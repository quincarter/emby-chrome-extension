/**
 * Shared helpers for live-site E2E integration tests.
 *
 * Unlike fixture tests, these navigate to real URLs.
 * Chrome API mocks and the content script bundle are injected
 * after the page loads.
 */
import { type Page, type TestInfo } from '@playwright/test';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const getContentScriptSource = (): string => {
  return readFileSync(resolve(ROOT, 'dist-e2e', 'content-script.js'), 'utf-8');
};

/** Re-export mock responses from the fixture helpers. */
export { mockResponses } from '../e2e-helpers';

/** Message handler map: maps `message.type` to a response value. */
export type MessageHandlerMap = Record<string, unknown>;

/**
 * Navigate to a live URL, inject Chrome API mocks + content script.
 *
 * @param page      Playwright page
 * @param url       The real site URL to navigate to
 * @param handlers  Map of message type → mock response
 * @param options   Additional options for navigation / injection
 */
export const setupLiveContentScript = async (
  page: Page,
  url: string,
  handlers: MessageHandlerMap,
  options: { waitForSelector?: string; preInjectDelay?: number } = {},
): Promise<void> => {
  // Navigate to the real page
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Some sites hydrate slowly — wait for a key selector if provided
  if (options.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, { timeout: 30_000, state: 'attached' });
  }

  // Optional delay before injecting (e.g. for SPAs that render late)
  if (options.preInjectDelay) {
    await page.waitForTimeout(options.preInjectDelay);
  }

  // Inject Chrome API mocks
  await page.addScriptTag({ content: buildChromeMock(handlers) });

  // Inject the built content script as an ES module
  const contentScriptSource = getContentScriptSource();
  await page.evaluate((src) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = src;
    document.head.appendChild(script);
  }, contentScriptSource);

  // Give the content script time to detect media and inject elements
  await page.waitForTimeout(3000);
};

/**
 * Build a script string that installs the `chrome.*` mock on `window`.
 */
const buildChromeMock = (handlers: MessageHandlerMap): string => {
  const serializedHandlers = JSON.stringify(handlers);

  return `
    (function() {
      const handlers = ${serializedHandlers};

      if (!window.chrome) window.chrome = {};
      if (!window.chrome.runtime) {
        window.chrome.runtime = {
          id: 'mock-extension-id',
          lastError: null,
          sendMessage: function(message, callback) {
            const type = message && message.type;
            const response = handlers[type];
            if (callback && response !== undefined) {
              setTimeout(function() { callback(response); }, 10);
            } else if (callback) {
              setTimeout(function() { callback(undefined); }, 10);
            }
          },
          onMessage: {
            addListener: function() {},
            removeListener: function() {},
          },
        };
      }
      if (!window.chrome.storage) {
        window.chrome.storage = {
          local: {
            get: function(keys, callback) { callback({}); },
            set: function(items, callback) { if (callback) callback(); },
          },
          sync: {
            get: function(keys, callback) { callback({}); },
            set: function(items, callback) { if (callback) callback(); },
          },
        };
      }
    })();
  `;
};

const SCREENSHOTS_DIR = resolve(ROOT, 'e2e', 'screenshots');

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Scroll to the injected element, take a contextual screenshot showing it
 * in the page, and attach it to the test result.
 *
 * Captures two screenshots:
 * 1. Element-only screenshot (cropped to the component)
 * 2. Viewport screenshot with the element scrolled into view
 */
export const screenshotInjectedElement = async (
  page: Page,
  testInfo: TestInfo,
  selector: string,
): Promise<void> => {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
  // Small pause for scroll + paint to settle
  await page.waitForTimeout(300);

  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const slug = slugify(`live-${testInfo.titlePath.join('-')}`);

  // Full viewport with element in view
  const viewportPath = resolve(SCREENSHOTS_DIR, `${slug}.png`);
  await page.screenshot({ path: viewportPath, fullPage: false });
  await testInfo.attach('viewport', { path: viewportPath, contentType: 'image/png' });

  // Cropped to just the injected element
  const elementPath = resolve(SCREENSHOTS_DIR, `${slug}-element.png`);
  await element.screenshot({ path: elementPath });
  await testInfo.attach('element', { path: elementPath, contentType: 'image/png' });
};

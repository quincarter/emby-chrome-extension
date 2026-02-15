import { test, expect } from '@playwright/test';
import { setupLiveContentScript, mockResponses, screenshotInjectedElement } from './live-helpers';

test.describe('IMDb — live site integration', () => {
  test('injects card on a movie page', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.imdb.com/title/tt0133093/',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrMovie('The Matrix'),
      },
      { waitForSelector: '[data-testid="hero-parent"]' },
    );

    const card = page.locator('#media-connector-imdb-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('Media Server Connector');
    await expect(card).toContainText('The Matrix');
    await screenshotInjectedElement(page, testInfo, '#media-connector-imdb-card');
  });

  test('injects card on a TV series page', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.imdb.com/title/tt0903747/',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrSeries('Breaking Bad'),
      },
      { waitForSelector: '[data-testid="hero-parent"]' },
    );

    const card = page.locator('#media-connector-imdb-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('Breaking Bad');
    await screenshotInjectedElement(page, testInfo, '#media-connector-imdb-card');
  });

  test('shows available status with Play button', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.imdb.com/title/tt0133093/',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrMovie('The Matrix'),
      },
      { waitForSelector: '[data-testid="hero-parent"]' },
    );

    const card = page.locator('#media-connector-imdb-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('✓ Available');
    await expect(card).toContainText('Play on Emby');
    await screenshotInjectedElement(page, testInfo, '#media-connector-imdb-card');
  });

  test('shows unavailable status with Request button', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.imdb.com/title/tt0133093/',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrMovie('The Matrix', 'not_requested'),
      },
      { waitForSelector: '[data-testid="hero-parent"]' },
    );

    const card = page.locator('#media-connector-imdb-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('Not in library');
    await expect(card).toContainText('Request');
    await screenshotInjectedElement(page, testInfo, '#media-connector-imdb-card');
  });
});

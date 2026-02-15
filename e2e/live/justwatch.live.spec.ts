import { test, expect } from '@playwright/test';
import { setupLiveContentScript, mockResponses, screenshotInjectedElement } from './live-helpers';

test.describe('JustWatch — live site integration', () => {
  test('injects card on a movie detail page', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.justwatch.com/us/movie/the-matrix',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrMovie('The Matrix'),
      },
      { waitForSelector: '.buybox-container, #buybox-anchor', preInjectDelay: 2000 },
    );

    const card = page.locator('#media-connector-justwatch-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText("I've got this!");
    await expect(card).toContainText('The Matrix');
    await screenshotInjectedElement(page, testInfo, '#media-connector-justwatch-card');
  });

  test('injects card on a TV show detail page', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.justwatch.com/us/tv-show/breaking-bad',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrSeries('Breaking Bad'),
      },
      { waitForSelector: '.buybox-container, #buybox-anchor', preInjectDelay: 2000 },
    );

    const card = page.locator('#media-connector-justwatch-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('Breaking Bad');
    await screenshotInjectedElement(page, testInfo, '#media-connector-justwatch-card');
  });

  test('injects badges on a search results page', async ({ page }, testInfo) => {
    await setupLiveContentScript(
      page,
      'https://www.justwatch.com/us/search?q=matrix',
      {
        GET_CONFIG: mockResponses.configEmby,
        SEARCH_JELLYSEERR: mockResponses.searchJellyseerrMovie('The Matrix'),
      },
      { waitForSelector: '.title-list-row__row', preInjectDelay: 2000 },
    );

    const badges = page.locator('.media-connector-jw-search-badge');
    await expect(badges.first()).toBeVisible({ timeout: 10_000 });
    await screenshotInjectedElement(page, testInfo, '.media-connector-jw-search-badge');
  });
});

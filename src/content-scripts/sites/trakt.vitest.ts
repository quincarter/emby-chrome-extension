import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tryInjectTraktItem, tryInjectTraktLegacyButton } from './trakt.js';
import type { CheckMediaResponse } from '../../types/messages.js';

describe('Trakt Injection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="section-list-container">
        <div class="trakt-list-title">
          <span class="title">
            Where to Watch
          </span>
        </div>
        <div class="trakt-list-item-container"></div>
      </div>
      <div class="action-buttons">
        <a class="btn-checkin">Check In</a>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('tryInjectTraktItem', () => {
    it('injects Emby item when available', () => {
      const response: CheckMediaResponse = {
        type: 'CHECK_MEDIA_RESPONSE',
        payload: {
          status: 'available',
          serverType: 'emby',
          itemUrl: 'https://emby.test/item/123',
        },
      };

      tryInjectTraktItem(response);

      const item = document.getElementById('media-connector-wtw-item');
      expect(item).to.exist;
      expect(item?.innerHTML).to.contain('Emby');
      expect(item?.querySelector('a')?.href).to.equal('https://emby.test/item/123');
    });

    it('injects Jellyfin item with Partial label when partial', () => {
      const response: CheckMediaResponse = {
        type: 'CHECK_MEDIA_RESPONSE',
        payload: {
          status: 'partial',
          serverType: 'jellyfin',
          itemUrl: 'https://jf.test/item/456',
        },
      };

      tryInjectTraktItem(response);

      const item = document.getElementById('media-connector-wtw-item');
      expect(item?.innerHTML).to.contain('Jellyfin (Partial)');
    });

    it('injects Request item when unavailable', () => {
      const response: CheckMediaResponse = {
        type: 'CHECK_MEDIA_RESPONSE',
        payload: {
          status: 'unavailable',
          serverType: 'emby',
        },
      };

      tryInjectTraktItem(response);

      const item = document.getElementById('media-connector-wtw-item');
      expect(item?.innerHTML).to.contain('Request');
    });
  });

  describe('tryInjectTraktLegacyButton', () => {
    it('inserts Play button before Check In button', () => {
      const response: CheckMediaResponse = {
        type: 'CHECK_MEDIA_RESPONSE',
        payload: {
          status: 'available',
          serverType: 'emby',
          itemUrl: 'https://emby.test/item/123',
        },
      };

      tryInjectTraktLegacyButton(response);

      const btn = document.getElementById('media-connector-trakt-action-btn');
      expect(btn).to.exist;
      expect(btn?.textContent).to.contain('Play on Emby');

      const checkinBtn = document.querySelector('.btn-checkin');
      expect(btn?.nextElementSibling).to.equal(checkinBtn);
    });

    it('inserts Request button when unavailable', () => {
      const response: CheckMediaResponse = {
        type: 'CHECK_MEDIA_RESPONSE',
        payload: {
          status: 'unavailable',
          serverType: 'jellyfin',
        },
      };

      tryInjectTraktLegacyButton(response);

      const btn = document.getElementById('media-connector-trakt-action-btn');
      expect(btn?.textContent).to.contain('Request on Jellyfin');
    });
  });
});

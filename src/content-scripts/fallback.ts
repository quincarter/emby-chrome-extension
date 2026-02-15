import { handleRequestClick } from './common-ui.js';
import type { CheckMediaResponse } from '../types/messages.js';

/**
 * Inject the media status indicator into the page.
 */
export const injectStatusIndicator = (response: CheckMediaResponse, _mediaType: string): void => {
  // Remove existing indicator if present
  const existing = document.getElementById('media-connector-indicator');
  if (existing) existing.remove();

  const indicator = document.createElement('div');
  indicator.id = 'media-connector-indicator';

  // Base styles for the indicator
  Object.assign(indicator.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.2s',
    opacity: '0',
    transform: 'translateY(10px)',
  });

  if (response.payload.status === 'available' && response.payload.itemUrl) {
    indicator.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
    indicator.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      <span>Available on Server</span>
    `;
    indicator.addEventListener('click', () => {
      window.open(response.payload.itemUrl, '_blank');
    });
  } else if (response.payload.status === 'partial' && response.payload.itemUrl) {
    indicator.style.background = 'linear-gradient(135deg, #FF9800, #E65100)';
    indicator.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
      <span>${response.payload.details ?? 'Partially available'}</span>
    `;
    indicator.addEventListener('click', () => {
      window.open(response.payload.itemUrl, '_blank');
    });
  } else if (response.payload.status === 'unavailable') {
    indicator.style.background = 'linear-gradient(135deg, #7B2FBE, #4A0E78)';
    indicator.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      <span>Request with Jellyseerr</span>
    `;
    indicator.addEventListener('click', () => {
      handleRequestClick();
    });
  } else if (response.payload.status === 'unconfigured') {
    indicator.style.background = 'linear-gradient(135deg, #616161, #424242)';
    indicator.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
      <span>Configure Extension</span>
    `;
  } else {
    return;
  }

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    marginLeft: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    opacity: '0.7',
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateY(10px)';
    setTimeout(() => indicator.remove(), 200);
  });
  indicator.appendChild(closeBtn);

  document.body.appendChild(indicator);

  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0)';
  });
};

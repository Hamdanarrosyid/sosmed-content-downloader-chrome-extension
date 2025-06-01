import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      'cookies',
      'contextMenus',
      'downloads',
      'activeTab', // For broader tab interaction
      'scripting', // For content script injection
    ],
    host_permissions: [
      '*://*.instagram.com/*', // Allow content script to run on Instagram
    ],
  },
});

import { handleInstagram } from './domains/instagram';
import { handleTikTok } from './domains/tiktok';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const hostname = window.location.hostname;

    if (hostname.includes('instagram.com')) {
      handleInstagram(ctx);
    } else if (hostname.includes('tiktok.com')) {
      handleTikTok(ctx);
    } else {
      console.log(`Content script running on unknown domain: ${hostname}`);
    }
  },
});

function injectDownloadButton(articleElement: HTMLElement) {
  const downloadButtonHtml = `
    <button class="download-button" style="position: absolute; top: 10px; right: 10px; background-color: #0095F6; color: white; border: none; border-radius: 5px; padding: 8px 12px; cursor: pointer; z-index: 1000;">
      Download
    </button>
  `;

  const existingButton = articleElement.querySelector('.download-button');
  if (existingButton) {
    return; // Button already exists, do not inject again
  }

  articleElement.style.position = 'relative'; // Ensure position is relative for absolute positioning of the button
  articleElement.insertAdjacentHTML('beforeend', downloadButtonHtml);

  const downloadButton = articleElement.querySelector('.download-button') as HTMLButtonElement;
  if (downloadButton) {
    downloadButton.addEventListener('click', async () => {
      // Extract content ID from the article
      const contentId = extractContentId(articleElement);
      if (contentId) {
        console.log('Content ID:', contentId);
        
        try {
          const cookies = document.cookie;
          const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
          const csrfToken = csrfMatch ? csrfMatch[1] : '';

          let lsd = '';
          let appId = '936619743392459';
          const scripts = document.querySelectorAll('script');
          for (const script of scripts) {
            const content = script.textContent || '';
            const lsdMatch = content.match(/"LSD",\[\],\{"token":"([^"]+)"/);
            if (lsdMatch) {
              lsd = lsdMatch[1];
            }
            const appIdMatch = content.match(/"APP_ID":"([^"]+)"/);
            if (appIdMatch) {
              appId = appIdMatch[1];
            }
          }

          const response = await browser.runtime.sendMessage({
            action: 'getVideoDownloadUrl',
            contentId: contentId,
            csrfToken: csrfToken,
            lsd: lsd,
            appId: appId
          });
          if (response && response.success && response.downloadUrl) {
            console.log('Download URL:', response.downloadUrl);
            browser.runtime.sendMessage({ action: 'downloadMedia', url: response.downloadUrl });
          } else {
            console.error('Error getting download URL from background:', response ? response.error : 'No response');
          }
        } catch (error) {
          console.error('Error sending message to background script:', error);
        }
      } else {
        console.warn('Could not find content ID in this article');
      }
    });
  }
}

function extractContentId(articleElement: HTMLElement): string | null {
  // Look for links with pattern /p/{content_id}/
  const postLinks = articleElement.querySelectorAll('a[href*="/p/"]');
  
  for (const link of postLinks) {
    const href = (link as HTMLAnchorElement).href;
    const match = href.match(/\/p\/([^\/]+)\//);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Alternative: look for time elements with datetime that might be near post links
  const timeElements = articleElement.querySelectorAll('time');
  for (const timeEl of timeElements) {
    const parentLink = timeEl.closest('a[href*="/p/"]');
    if (parentLink) {
      const href = (parentLink as HTMLAnchorElement).href;
      const match = href.match(/\/p\/([^\/]+)\//);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  
  return null;
}

export function handleInstagram(ctx: any) {
  console.log('Hello content. Running on Instagram!');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'ARTICLE') {
              injectDownloadButton(element);
            } else {
              const articles = element.querySelectorAll('article');
              articles.forEach(injectDownloadButton);
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also inject for existing articles on page load
  document.querySelectorAll('article').forEach(injectDownloadButton);
}

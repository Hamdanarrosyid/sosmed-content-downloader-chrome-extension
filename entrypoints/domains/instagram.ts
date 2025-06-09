function injectDownloadButton(articleElement: HTMLElement) {
  const downloadBtnContainer = '<div class="download-button-container"></div>';
  const loadingIndicator = `
  <div class="loading-indicator" style="margin-right: 4px;">
    <svg class="loading-svg-spinner" height="24px" width="24px" version="1.1" id="_x32_" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#000000;} </style> <g> <path class="st0" d="M256,0c-23.357,0-42.297,18.932-42.297,42.288c0,23.358,18.94,42.288,42.297,42.288 c23.357,0,42.279-18.93,42.279-42.288C298.279,18.932,279.357,0,256,0z"></path> <path class="st0" d="M256,427.424c-23.357,0-42.297,18.931-42.297,42.288C213.703,493.07,232.643,512,256,512 c23.357,0,42.279-18.93,42.279-42.288C298.279,446.355,279.357,427.424,256,427.424z"></path> <path class="st0" d="M74.974,74.983c-16.52,16.511-16.52,43.286,0,59.806c16.52,16.52,43.287,16.52,59.806,0 c16.52-16.511,16.52-43.286,0-59.806C118.261,58.463,91.494,58.463,74.974,74.983z"></path> <path class="st0" d="M377.203,377.211c-16.503,16.52-16.503,43.296,0,59.815c16.519,16.52,43.304,16.52,59.806,0 c16.52-16.51,16.52-43.295,0-59.815C420.489,360.692,393.722,360.7,377.203,377.211z"></path> <path class="st0" d="M84.567,256c0.018-23.348-18.922-42.279-42.279-42.279c-23.357-0.009-42.297,18.932-42.279,42.288 c-0.018,23.348,18.904,42.279,42.279,42.279C65.645,298.288,84.567,279.358,84.567,256z"></path> <path class="st0" d="M469.712,213.712c-23.357,0-42.279,18.941-42.297,42.288c0,23.358,18.94,42.288,42.297,42.297 c23.357,0,42.297-18.94,42.279-42.297C512.009,232.652,493.069,213.712,469.712,213.712z"></path> <path class="st0" d="M74.991,377.22c-16.519,16.511-16.519,43.296,0,59.806c16.503,16.52,43.27,16.52,59.789,0 c16.52-16.519,16.52-43.295,0-59.815C118.278,360.692,91.511,360.692,74.991,377.22z"></path> <path class="st0" d="M437.026,134.798c16.52-16.52,16.52-43.304,0-59.824c-16.519-16.511-43.304-16.52-59.823,0 c-16.52,16.52-16.503,43.295,0,59.815C393.722,151.309,420.507,151.309,437.026,134.798z"></path> </g> </g></svg>
    <style>
      /* Styles for the loading spinner */
      .loading-svg-spinner {
        animation: sosmed-loader-spin 1s linear infinite;
        transform-origin: center; /* Ensures rotation is around the center of the SVG element */
      }
      @keyframes sosmed-loader-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    
  </div>
  `
  const downloadBtn = `
  <div class="download-button bg-red-500" style="margin-right: 4px; cursor: pointer;" aria-label="download">
    <svg width="24px" height="24px" viewBox="0 0 24.00 24.00" fill="none" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 12L12 17M12 17L7 12M12 17V4M17 20H7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
  </div> 
  `



  // find last div element inside first section element
  const sectionElement = articleElement.querySelector('section');
  if (!sectionElement) {
    return;
  }

  const lastDivElement = sectionElement.lastElementChild as HTMLDivElement;
  if (!lastDivElement) {
    return;
  }
  const existingButton = lastDivElement.querySelector('.download-button');
  if (existingButton) {
    return; // Button already exists, do not inject again
  }

  lastDivElement.style.display = 'flex'; 
  lastDivElement.style.justifyContent = 'flex-end';
  lastDivElement.insertAdjacentHTML('afterbegin', downloadBtnContainer);
  
  const downloadContainer = lastDivElement.querySelector('.download-button-container') as HTMLDivElement;
  if (!downloadContainer) {
    console.warn('Could not find download button container, cannot inject button');
    return;
  }
  downloadContainer.insertAdjacentHTML('afterbegin', downloadBtn);

  const downloadButton = downloadContainer.querySelector('.download-button') as HTMLButtonElement;
  if (downloadButton) {
    downloadButton.addEventListener('click', async () => {
      // Extract content ID from the article
      const contentId = extractContentId(articleElement);
      if (contentId) {
        try {
          // change download button to loading indicator
          downloadButton.style.display = 'none'; // Hide the download button
          downloadContainer.insertAdjacentHTML('afterbegin', loadingIndicator);
          const response = await browser.runtime.sendMessage({
            action: 'getVideoDownloadUrl',
            contentId: contentId,
            domain: 'instagram.com',
          });
          if (response && response.success && response.downloadUrl) {
            browser.runtime.sendMessage({ action: 'downloadMedia', urls: response.downloadUrl });
          } else {
            console.error('Error getting download URL from background:', response ? response.error : 'No response');
          }
        } catch (error) {
          console.error('Error sending message to background script:', error);
        } finally {
          // Remove loading indicator and show download button again
          const loadingIndicatorEl = downloadContainer.querySelector('.loading-indicator');
          if (loadingIndicatorEl) {
            loadingIndicatorEl.remove();
          }
          downloadButton.style.display = 'block';
        }
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

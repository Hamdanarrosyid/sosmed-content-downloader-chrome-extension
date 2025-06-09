import JSZip from "jszip";

interface DownloadUrlInfo {
  url: string;
  type: 'data';
  revokerInterface: null;
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => { // REMOVED async from here
    if (message.action === 'downloadMedia' && message.urls) {
      if (message.urls.length > 1) {
        // create a zip file for multiple URLs with JSZip
        // create arraybuffer and get the extension from the response
        const zip = new JSZip();

        const downloadPromises = message.urls.map(async (url: string, index: number) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            let extension = 'dat'; // default extension for unknown binary data
            const contentType = response.headers.get('Content-Type');
            if (contentType) {
              if (contentType.includes('image/png')) {
                extension = 'png';
              } else if (contentType.includes('image/jpeg')) {
                extension = 'jpg';
              } else if (contentType.includes('video/mp4')) {
                extension = 'mp4';
              } else if (contentType.includes('video/webm')) {
                extension = 'webm';
              } else if (contentType.includes('video/quicktime')) {
                extension = 'mov';
              }
            }
            zip.file(`media_${index + 1}.${extension}`, arrayBuffer);
          } catch (error) {
            console.error(`Error downloading ${url}:`, error);
          }
        });



        Promise.all(downloadPromises)
          .then(() => {
            return zip.generateAsync({ type: 'blob' });
          })
          .then((blob) => {
            // It's a good practice to verify the type of blob
            if (!(blob instanceof Blob)) {
              return Promise.reject(new Error('JSZip did not return a valid Blob object.'));
            }
            return new Promise<DownloadUrlInfo>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  // For simplicity, we'll pass a consistent structure,
                  // though revokerInterface will be null and type always 'data'.
                  resolve({ url: reader.result, type: 'data' as const, revokerInterface: null });
                } else {
                  reject(new Error('FileReader did not return a string for data URL.'));
                }
              };
              reader.onerror = (error) => {
                console.error('[Background] FileReader failed to read blob as Data URL:', reader.error, error);
                reject(new Error('FileReader failed to read blob as Data URL: ' + reader.error?.message));
              };
              reader.readAsDataURL(blob);
            });
          })
          .then((result: DownloadUrlInfo) => {
            const { url: downloadableUrl } = result;
            const zipFileName = `instagram_media_${Date.now()}.zip`;
            
            browser.downloads.download({
              url: downloadableUrl,
              filename: zipFileName,
              saveAs: true,
            })
            .catch(error => {
              console.error('Download failed:', error);
              // No revocation needed for Data URLs
            });
          })
          .catch(error => {
            // This catch handles errors from Promise.all, zip.generateAsync, blob type check, or URL creation
            console.error('[Background] Error during media processing, zipping, URL creation, or download initiation:', error);
          });
      } else {
        // For a single URL, download directly
        const url = message.urls[0];
        browser.downloads.download({
          url: url,
          saveAs: true,
        }).catch(error => console.error('Download failed:', error));
      }

      return true; // Indicate that the response will be sent asynchronously
    }

    if (message.action === 'getVideoDownloadUrl' && message.contentId) {
      (async () => {
        try {
          const cookies = await browser.cookies.getAll({ domain: message.domain });
          const sessionId = cookies.find(cookie => cookie.name === 'sessionid')?.value || '';

          if (!sessionId) {
            console.error('No session ID found in cookies for domain:', message.domain);
            sendResponse({ success: false, error: 'No session ID found in cookies.' });
            return; 
          }

          const apiUrl = "http://147.93.81.5:8000/api/instagram";
          const resp = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
              url: message.contentId,
              session_id: sessionId,
            }),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });

          if (!resp.ok) {
            let errorText = `Server error: ${resp.status} ${resp.statusText}`;
            try {
              const serverErrorData = await resp.text();
              errorText += ` - ${serverErrorData}`;
            } catch (e) { console.warn(`[Background] Could not read error response body from ${apiUrl} for getVideoDownloadUrl`, e); }
            console.error(`[Background] Failed to fetch download URL from ${apiUrl} for getVideoDownloadUrl:`, errorText);
            sendResponse({ success: false, error: errorText });
            return; // Exit IIFE
          }

          const data = await resp.json();
          const downloadUrls = []
          if (data.resources && data.resources.length > 0) {
            data.resources.forEach((resource: any) => {
              if (resource.video_url) {
                downloadUrls.push(resource.video_url);
              } else {
                downloadUrls.push(resource.thumbnail_url || '');
              }
            });
          } else if (data.video_url) {
            downloadUrls.push(data.video_url);
          } else {
            downloadUrls.push(data.thumbnail_url || '');
          }
          const responseObject = { success: true, downloadUrl: downloadUrls, error: data.error || '' };
          sendResponse(responseObject);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[Background] Error in getVideoDownloadUrl handler IIFE:', error);
          sendResponse({ success: false, error: errorMessage });
        }
      })(); // Immediately invoke the async function
      return true; // Crucial: Indicate that the response will be sent asynchronously by the IIFE
    }
  });


  // Create a context menu item for images and videos
  browser.contextMenus.create({
    id: 'downloadInstagramMedia',
    title: 'Download Instagram Media',
    contexts: ['image', 'video'],
    documentUrlPatterns: ['*://*.instagram.com/*'],
  });

  // Listen for clicks on the context menu item
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downloadInstagramMedia' && tab?.id) {
      // Send a message to the content script to get the media URL
      browser.tabs.sendMessage(tab.id, { action: 'getMediaUrl' })
        .then(response => {
          if (response && response.url) {
            browser.downloads.download({
              url: response.url,
              saveAs: true,
            })
              .catch(error => console.error('Download failed:', error));
          } else {
            console.warn('Content script did not return a media URL.');
          }
        })
        .catch(error => console.error('Error sending message to content script:', error));
    }
  });
});

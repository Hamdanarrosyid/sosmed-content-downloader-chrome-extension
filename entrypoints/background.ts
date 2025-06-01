export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'downloadMedia' && message.url) {
      console.log('Received download request:', message.url);
      browser.downloads.download({
        url: message.url,
        saveAs: true, // Prompt the user to save the file
      })
        .then(downloadId => {
          console.log('Download started with ID:', downloadId);
          sendResponse({ success: true, downloadId: downloadId });
        })
        .catch(error => {
          console.error('Download failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicate that the response will be sent asynchronously
    } // Removed the old getCookie handler

    // New handler to get ALL cookies for a domain
    if (message.action === 'getAllCookies' && message.domain) {
      // Use browser.cookies.getAll to get all cookies matching the domain
      browser.cookies.getAll({ domain: message.domain })
        .then(cookies => {
          if (cookies) {
            sendResponse({ success: true, cookies: cookies }); // Send back the array of cookie objects
          } else {
            console.warn(`No cookies found for domain "${message.domain}"`);
            sendResponse({ success: false, error: `No cookies found for domain: ${message.domain}` });
          }
        })
        .catch(error => {
          console.error(`Error getting all cookies for domain "${message.domain}":`, error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicate asynchronous response
    }

    if (message.action === 'getVideoDownloadUrl' && message.contentId && message.csrfToken && message.lsd && message.appId) {
      getVideoDownloadUrl(message.contentId, message.csrfToken, message.lsd, message.appId)
        .then(downloadUrl => {
          sendResponse({ success: true, downloadUrl: downloadUrl });
        })
        .catch(error => {
          console.error('Error in getVideoDownloadUrl:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicate asynchronous response
    }
  });

  interface Cookie {
    name: string;
    value: string;
  }

  async function getVideoDownloadUrl(shortCode: string, csrfToken: string, lsd: string, appId: string): Promise<string> {
    try {
      const resp = await fetch("https://www.instagram.com/graphql/query", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "priority": "u=1, i",
        "sec-ch-prefers-color-scheme": "light",
        "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
        "sec-ch-ua-full-version-list": "\"Chromium\";v=\"136.0.7103.116\", \"Google Chrome\";v=\"136.0.7103.116\", \"Not.A/Brand\";v=\"99.0.0.0\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"10.0.0\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-asbd-id": "359341",
        "x-bloks-version-id": "446750d9733aca29094b1f0c8494a768d5742385af7ba20c3e67c9afb91391d8",
        "x-csrftoken": "uN4kXpD_j49LDbDuD8ffEb",
        "x-fb-friendly-name": "PolarisPostActionLoadPostQueryQuery",
        "x-fb-lsd": "AVrWuLu52HM",
        "x-ig-app-id": "936619743392459",
        "x-root-field-name": "xdt_shortcode_media"
      },
      // "referrer": "https://www.instagram.com/p/DIvrebQzUDE/",
      // "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "av=0&__d=www&__user=0&__a=1&__req=b&__hs=20236.HYP%3Ainstagram_web_pkg.2.1...0&dpr=1&__ccg=GOOD&__rev=1023247413&__s=fzou8n%3Aawf7gy%3Aous7zs&__hsi=7509446998341571100&__dyn=7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJw5ux609vCwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2swtUd8-U2zxe2GewGw9a361qw8Xxm16wa-0oa2-azo7u3C2u2J0bS1LwTwKG1pg2fwxyo6O1FwlA3a3zhA6bwIxe6V8aUuwm8jwhU3cyVrDyo16UswFCw&__csr=gn84klewFlOnkDbnlLWhqARA8iGA_h5paiGh5itbQnmnXhuqqmCjmdzAcypLK4ExzGCF9ah5olhGgyuASCnny4meQARzFdJu6bFaWAAGaG498nyqGHzfzi5LQdzu8yRJox95CCKi4qx6i5FpUS9zk4GxaFE-V8W4eUaorwxw05a482mWwcu0k0E1q187O8PPxi2e2Wdw60xq0GC0AU2SwkU1FE08C80NxwiUaxxoV0Bwh8lBokw8C0NIUfU11jw5rJk7Uao1hpng0r5xSq2B0pQ2O01Cvw3LE12E3pw0C0w&__comet_req=7&lsd=AVrWuLu52HM&jazoest=2914&__spin_r=1023247413&__spin_b=trunk&__spin_t=1748429378&__crn=comet.igweb.PolarisPostRoute&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisPostActionLoadPostQueryQuery&variables=%7B%22shortcode%22%3A%22DIvrebQzUDE%22%2C%22fetch_tagged_user_count%22%3Anull%2C%22hoisted_comment_id%22%3Anull%2C%22hoisted_reply_id%22%3Anull%7D&server_timestamps=true&doc_id=29599222026389233",
      "method": "POST",
      // "mode": "cors",
      // "credentials": "include"
    })
    const responseText = await resp.text();
    const cleanedResponse = responseText.replace(/^for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');
    console.log(cleanedResponse)

    console.log('Response data:', resp);
    return 'ada'
    } catch (error) {
      console.error('Error in getVideoDownloadUrl:', error)
      return 'Error fetching video download URL: ' + error;
      
    }
    

    // let mid = '';
    // let igDid = '';
    // let datr = '';
    // try {
    //   const cookies = await browser.cookies.getAll({ domain: 'instagram.com' });
    //   mid = cookies.find((c: Cookie) => c.name === 'mid')?.value || '';
    //   igDid = cookies.find((c: Cookie) => c.name === 'ig_did')?.value || '';
    //   datr = cookies.find((c: Cookie) => c.name === 'datr')?.value || '';
    // } catch (error) {
    //   console.error('Error getting cookies in background script:', error);
    // }

    // const mockSessionData = {
    //   csrfToken: 'PJFdASrGG3KaGhtlajAP2UPlQwgw8Gos',
    //   mid: 'aBD5FQALAAH4vjF3iiSu77ag9qCb',
    //   igDid: 'A6CD7882-8C2C-41C6-A7E0-FC4B71EAC4FB',
    //   datr: 'oSEbZyzW9SSOGBsijceZBzlX',
    //   // lsd: 'AVpKq9If6G0',
    //   lsd: lsd,
    //   appId: '936619743392459', // Default Instagram app ID
    //   sessionId: '', // Not provided in user's working cookie, setting to empty
    //   userId: '' // Not provided in user's working cookie, setting to empty
    // };

    // const headers = {
    //   'authority': 'www.instagram.com',
    //   'accept': '*/*',
    //   'accept-language': 'en-US,en;q=0.9',
    //   'content-type': 'application/x-www-form-urlencoded',
    //   'cookie': `csrftoken=${mockSessionData.csrfToken}; mid=${mockSessionData.mid}; ig_did=${mockSessionData.igDid}; datr=${mockSessionData.datr}`,
    //   'dnt': '1',
    //   'dpr': '1',
    //   'origin': 'https://www.instagram.com',
    //   'referer': `https://www.instagram.com/p/${shortCode}/`,
    //   'sec-ch-prefers-color-scheme': 'light',
    //   'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    //   'sec-ch-ua-full-version-list': '"Chromium";v="118.0.5993.89", "Google Chrome";v="118.0.5993.89", "Not=A?Brand";v="99.0.0.0"',
    //   'sec-ch-ua-mobile': '?0',
    //   'sec-ch-ua-model': '""',
    //   'sec-ch-ua-platform': 'Windows',
    //   'sec-ch-ua-platform-version': '10.0.0',
    //   'sec-fetch-dest': 'empty',
    //   'sec-fetch-mode': 'cors',
    //   'sec-fetch-site': 'same-origin',
    //   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    //   'viewport-width': '517',
    //   'x-asbd-id': '129477',
    //   'x-csrftoken': mockSessionData.csrfToken,
    //   'x-fb-friendly-name': 'PolarisPostActionLoadPostQueryQuery',
    //   'x-fb-lsd': mockSessionData.lsd,
    //   'x-ig-app-id': mockSessionData.appId,
    // }

    // console.log('Headers for request:', headers);

    // const rawData = `av=0&__d=www&__user=0&__a=1&__req=3&__hs=19655.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466525&__s=otsihg%3A4upelk%3Av7cj17&__hsi=7293830036142173767&__dyn=7xeUmwlEnwn8K2WnFw9-2i5U4e1ZyUW3qi2K360CEbo1nEhw2nVE4W0om78b87C0yE5ufz81s8hwGwQwoEcE7O2l0Fwqo31w9a9x-0z8-U2zxe2GewGwso88cobEaU2eUlwhEe87q7-0iK2S3qazo7u1xwIw8O321LwTwKG1pg661pwr86C1mwraCgoK68&__csr=gtsG9HmhuGvQJ2vah4VAAXBVrAZ9BBgBrWZqVEhAhWyrV4US8n-AiVXGviHAUObKELopiAj8Aal4Gvhe8WGGwODKew04ni80VQ0gq0gq08YzA4oS02kWeUh6aexq9w8Ca9ofFE1by02z60aYw3lj09O0rN00ppE0gMw&__comet_req=7&lsd=${mockSessionData.lsd}&jazoest=2856&__spin_r=1009466525&__spin_b=trunk&__spin_t=1698227142&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisPostActionLoadPostQueryQuery&variables=%7B%22shortcode%22%3A%22${shortCode}%22%2C%22fetch_comment_count%22%3A40%2C%22fetch_related_profile_media_count%22%3A3%2C%22parent_comment_count%22%3A24%2C%22child_comment_count%22%3A3%2C%22fetch_like_count%22%3A10%2C%22fetch_tagged_user_count%22%3Anull%2C%22fetch_preview_comment_count%22%3A2%2C%22has_threaded_comments%22%3Atrue%2C%22hoisted_comment_id%22%3Anull%2C%22hoisted_reply_id%22%3Anull%7D&server_timestamps=true&doc_id=10015901848480474`

    // try {
    //   const response = await fetch('https://www.instagram.com/api/graphql', {
    //     method: 'POST',
    //     headers: headers,
    //     body: rawData,
    //   });

    //   console.log('Response status:', response);

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const responseText = await response.text();
    //   const cleanedResponse = responseText.replace(/^for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');
    //   console.log(cleanedResponse)

    //   const responseData = JSON.parse(cleanedResponse);

    //   if (responseData.data && responseData.data.xdt_shortcode_media && responseData.data.xdt_shortcode_media.video_url) {
    //     return responseData.data.xdt_shortcode_media.video_url;
    //   } else {
    //     throw new Error('Video URL not found in response');
    //   }
    // } catch (error) {
    //   console.error('Error fetching download URL:', error);
    //   throw error;
    // }
  }

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
            console.log('Received media URL from content script:', response.url);
            browser.downloads.download({
              url: response.url,
              saveAs: true,
            })
              .then(downloadId => console.log('Download started:', downloadId))
              .catch(error => console.error('Download failed:', error));
          } else {
            console.warn('Content script did not return a media URL.');
          }
        })
        .catch(error => console.error('Error sending message to content script:', error));
    }
  });
});

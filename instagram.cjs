// Node.js version for testing Instagram API calls
const https = require('https');
const { URL } = require('url');

// Function to extract session data dynamically from browser environment
function extractSessionData() {
  // If running in browser environment
  if (typeof document !== 'undefined') {
    const cookies = document.cookie;
    
    // Extract CSRF token
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';
    
    // Extract other session cookies
    const midMatch = cookies.match(/mid=([^;]+)/);
    const mid = midMatch ? midMatch[1] : '';
    
    const igDidMatch = cookies.match(/ig_did=([^;]+)/);
    const igDid = igDidMatch ? igDidMatch[1] : '';
    
    const datrMatch = cookies.match(/datr=([^;]+)/);
    const datr = datrMatch ? datrMatch[1] : '';
    
    const sessionIdMatch = cookies.match(/sessionid=([^;]+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';
    
    const userIdMatch = cookies.match(/ds_user_id=([^;]+)/);
    const userId = userIdMatch ? userIdMatch[1] : '';
    
    // Try to extract other dynamic values from the page
    const scripts = document.querySelectorAll('script');
    let lsd = '';
    let appId = '936619743392459'; // Default Instagram app ID
    
    for (const script of scripts) {
      const content = script.textContent || '';
      
      // Look for LSD token
      const lsdMatch = content.match(/"LSD",\[\],\{"token":"([^"]+)"/);
      if (lsdMatch) {
        lsd = lsdMatch[1];
      }
      
      // Look for app ID
      const appIdMatch = content.match(/"APP_ID":"([^"]+)"/);
      if (appIdMatch) {
        appId = appIdMatch[1];
      }
    }
    
    return {
      csrfToken,
      mid,
      igDid,
      datr,
      lsd,
      appId,
      sessionId,
      userId
    };
  }
  
  // Fallback for Node.js environment - return empty values
  return {
    csrfToken: '',
    mid: '',
    igDid: '',
    datr: '',
    lsd: '',
    appId: '936619743392459',
    sessionId: '',
    userId: ''
  };
}

// Mock session data - you'll need to replace these with real values from your browser
const mockSessionData = {
  csrfToken: 'PJFdASrGG3KaGhtlajAP2UPlQwgw8Gos',
  mid: 'aBD5FQALAAH4vjF3iiSu77ag9qCb',
  igDid: 'A6CD7882-8C2C-41C6-A7E0-FC4B71EAC4FB',
  datr: 'oSEbZyzW9SSOGBsijceZBzlX',
  lsd: 'AVpKq9If6G0',
  appId: '936619743392459', // Default Instagram app ID
  sessionId: '', // Not provided in user's working cookie, setting to empty
  userId: '' // Not provided in user's working cookie, setting to empty
};

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function getVideoDownloadUrl(shortCode, sessionData = null) {
  console.log(`Attempting to fetch data for shortcode: ${shortCode}`);
  
  // Try to get dynamic session data first, fallback to mock data
  const dynamicSessionData = extractSessionData();
  const finalSessionData = sessionData || 
    (dynamicSessionData.csrfToken ? dynamicSessionData : mockSessionData);
  
  console.log('Using session data:', {
    csrfToken: finalSessionData.csrfToken ? '***' : 'missing',
    sessionId: finalSessionData.sessionId ? '***' : 'missing',
    userId: finalSessionData.userId || 'missing'
  });


  const headers = {
    'authority': 'www.instagram.com',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': `csrftoken=${finalSessionData.csrfToken}; mid=${finalSessionData.mid}; ig_did=${finalSessionData.igDid}; datr=${finalSessionData.datr}`, // Updated cookie string
    'dnt': '1',
    'dpr': '1',
    'origin': 'https://www.instagram.com',
    'referer': `https://www.instagram.com/p/${shortCode}/`, // Keep dynamic referer
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'sec-ch-ua-full-version-list': '"Chromium";v="118.0.5993.89", "Google Chrome";v="118.0.5993.89", "Not=A?Brand";v="99.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': 'Windows',
    'sec-ch-ua-platform-version': '10.0.0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'viewport-width': '517',
    'x-asbd-id': '129477',
    'x-csrftoken': finalSessionData.csrfToken,
    'x-fb-friendly-name': 'PolarisPostActionLoadPostQueryQuery',
    'x-fb-lsd': finalSessionData.lsd,
    'x-ig-app-id': finalSessionData.appId,
  }

  // Build the raw data payload
  const rawData = `av=0&__d=www&__user=0&__a=1&__req=3&__hs=19655.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466525&__s=otsihg%3A4upelk%3Av7cj17&__hsi=7293830036142173767&__dyn=7xeUmwlEnwn8K2WnFw9-2i5U4e1ZyUW3qi2K360CEbo1nEhw2nVE4W0om78b87C0yE5ufz81s8hwGwQwoEcE7O2l0Fwqo31w9a9x-0z8-U2zxe2GewGwso88cobEaU2eUlwhEe87q7-0iK2S3qazo7u1xwIw8O321LwTwKG1pg661pwr86C1mwraCgoK68&__csr=gtsG9HmhuGvQJ2vah4VAAXBVrAZ9BBgBrWZqVEhAhWyrV4US8n-AiVXGviHAUObKELopiAj8Aal4Gvhe8WGGwODKew04ni80VQ0gq0gq08YzA4oS02kWeUh6aexq9w8Ca9ofFE1by02z60aYw3lj09O0rN00ppE0gMw&__comet_req=7&lsd=${finalSessionData.lsd}&jazoest=2856&__spin_r=1009466525&__spin_b=trunk&__spin_t=1698227142&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisPostActionLoadPostQueryQuery&variables=%7B%22shortcode%22%3A%22${shortCode}%22%2C%22fetch_comment_count%22%3A40%2C%22fetch_related_profile_media_count%22%3A3%2C%22parent_comment_count%22%3A24%2C%22child_comment_count%22%3A3%2C%22fetch_like_count%22%3A10%2C%22fetch_tagged_user_count%22%3Anull%2C%22fetch_preview_comment_count%22%3A2%2C%22has_threaded_comments%22%3Atrue%2C%22hoisted_comment_id%22%3Anull%2C%22hoisted_reply_id%22%3Anull%7D&server_timestamps=true&doc_id=10015901848480474`

  try {
    console.log('Making request to Instagram API...');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    const response = await makeRequest('https://www.instagram.com/api/graphql', {
      method: 'POST',
      headers: headers,
      body: rawData
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get response as text first to handle the "for (;;);" prefix
    const responseText = await response.text();
    console.log('Raw response:', responseText.substring(0, 500) + '...');

    // Remove the "for (;;);" prefix that Instagram adds to prevent JSON hijacking
    const cleanedResponse = responseText.replace(/^for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');

    // Now parse the cleaned JSON
    const responseData = JSON.parse(cleanedResponse);
    
    console.log('Parsed response structure:', Object.keys(responseData));
    
    if (responseData.errors) {
      console.error('API returned errors:', responseData.errors);
      throw new Error('API returned errors: ' + JSON.stringify(responseData.errors));
    }

    if (responseData.data && responseData.data.xdt_shortcode_media) {
      const media = responseData.data.xdt_shortcode_media;
      console.log('Media type:', media.__typename);
      
      if (media.video_url) {
        console.log('Video URL found:', media.video_url);
        return media.video_url;
      } else if (media.display_url) {
        console.log('Image URL found:', media.display_url);
        return media.display_url;
      } else {
        console.log('Available media fields:', Object.keys(media));
        throw new Error('No video or image URL found in response');
      }
    } else {
      console.log('Response data structure:', JSON.stringify(responseData, null, 2));
      throw new Error('Media data not found in response');
    }
  } catch (error) {
    console.error('Error fetching download URL:', error);
    throw error;
  }
}

// Helper function to extract session data from browser
function printSessionDataInstructions() {
  console.log('\n=== HOW TO GET SESSION DATA ===');
  console.log('1. Open Instagram in your browser and log in');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to Application/Storage tab > Cookies > https://www.instagram.com');
  console.log('4. Copy these cookie values:');
  console.log('   - csrftoken');
  console.log('   - mid');
  console.log('   - ig_did');
  console.log('   - datr');
  console.log('   - sessionid (IMPORTANT!)');
  console.log('   - ds_user_id (IMPORTANT!)');
  console.log('5. Go to Console tab and run:');
  console.log('   document.querySelector(\'script\').textContent.match(/"LSD",\\[\\],\\{"token":"([^"]+)"/)?.[1]');
  console.log('6. This will give you the LSD token');
  console.log('7. Update the mockSessionData object in this file with real values');
  console.log('================================\n');
}

// Test function
async function testInstagramAPI() {
  // Check if we have real session data
  if (mockSessionData.csrfToken === 'your_csrf_token_here') {
    printSessionDataInstructions();
    console.log('Please update the mockSessionData with real values from your browser session.');
    return;
  }

  // Test with a sample shortcode (replace with actual Instagram post shortcode)
  const testShortcode = 'DKMLRQRpJfW'; // Replace with real shortcode from Instagram URL
  
  try {
    const downloadUrl = await getVideoDownloadUrl(testShortcode);
    console.log('Success! Download URL:', downloadUrl);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Export functions for use in other files
module.exports = {
  getVideoDownloadUrl,
  extractSessionData,
  testInstagramAPI,
  printSessionDataInstructions
};

// Run test if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const shortcode = args[0];
    console.log(`Testing with shortcode: ${shortcode}`);
    getVideoDownloadUrl(shortcode).then(url => {
      console.log('Download URL:', url);
    }).catch(error => {
      console.error('Error:', error.message);
    });
  } else {
    testInstagramAPI();
  }
}

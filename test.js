
    fetch("https://www.instagram.com/graphql/query", {
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
      "referrer": "https://www.instagram.com/p/DIvrebQzUDE/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "av=0&__d=www&__user=0&__a=1&__req=b&__hs=20236.HYP%3Ainstagram_web_pkg.2.1...0&dpr=1&__ccg=GOOD&__rev=1023247413&__s=fzou8n%3Aawf7gy%3Aous7zs&__hsi=7509446998341571100&__dyn=7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJw5ux609vCwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2swtUd8-U2zxe2GewGw9a361qw8Xxm16wa-0oa2-azo7u3C2u2J0bS1LwTwKG1pg2fwxyo6O1FwlA3a3zhA6bwIxe6V8aUuwm8jwhU3cyVrDyo16UswFCw&__csr=gn84klewFlOnkDbnlLWhqARA8iGA_h5paiGh5itbQnmnXhuqqmCjmdzAcypLK4ExzGCF9ah5olhGgyuASCnny4meQARzFdJu6bFaWAAGaG498nyqGHzfzi5LQdzu8yRJox95CCKi4qx6i5FpUS9zk4GxaFE-V8W4eUaorwxw05a482mWwcu0k0E1q187O8PPxi2e2Wdw60xq0GC0AU2SwkU1FE08C80NxwiUaxxoV0Bwh8lBokw8C0NIUfU11jw5rJk7Uao1hpng0r5xSq2B0pQ2O01Cvw3LE12E3pw0C0w&__comet_req=7&lsd=AVrWuLu52HM&jazoest=2914&__spin_r=1023247413&__spin_b=trunk&__spin_t=1748429378&__crn=comet.igweb.PolarisPostRoute&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisPostActionLoadPostQueryQuery&variables=%7B%22shortcode%22%3A%22DIvrebQzUDE%22%2C%22fetch_tagged_user_count%22%3Anull%2C%22hoisted_comment_id%22%3Anull%2C%22hoisted_reply_id%22%3Anull%7D&server_timestamps=true&doc_id=29599222026389233",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      console.log(data);
    }).catch(error => {
      console.error('Fetch error:', error);
    });

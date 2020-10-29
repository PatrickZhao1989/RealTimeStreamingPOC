# WebSocket Streaming Service
## What is this project?
This is a proof-of-concept audio streaming service which will accept 
an external broadcasting service (i.e. Twilio phone-to-websocket audio stream)
and forward it to a WebSocket client which will play it in the browser.

## How does it work?
1. Twilio sends u-law encoded 8-bit PCM audio through WebSocket in our server.
2. Our server will read the package, decode the payload and then re-broadcast this 
   payload to our WebSocket server's clients.
3. The WebSocket browser clients receives this u-law encoded binary message
   and decode it to a 16-bit PCM sequence which will be played via WebKit 
   HTML5 audio context library.

## Deployment
Resource group: `ap-rg-live-stream-test`


### Server - via Docker:
1. Install [Docker](https://www.docker.com/)
2. Open `_devops/variable.ps1`. Change the tag and image name as necessary.
3. Run `npm run build:dockerfile`. 
   This will build the docker image with the `./Dockerfile` configuration.
4. Login to ACR `az acr login`
5. Run `npm run deploy:dockerfile`.
   This will re-tag the built image with the tag `latest-${postfix}` 
   and push it to the respective registry (we used ACR) 
6. ACR webhook should automatically re-deploy Azure App Service
   when there's a change in the image with `latest-${postfix}` tag.
   If not, we need to manually deploy this image to Azure App Service.
   Below are the app services with auto-deploy:
   - Server decoding:
     - App service: `aplus-audio-wsserver` 
     - Docker image: `apluslivestreamtest.azurecr.io:latest-server-decoding`
   - Client decoding:
     - App service: `aplus-audio-wsserver-2` 
     - Docker image: `apluslivestreamtest.azurecr.io:latest-client-decoding`
   
 
### Browser - static HTML:
1. Change the configuration in `public/index.html` according to which decoding type we want.
   - Server decoding:
     - `const decodeOnClient = false` 
   - Client decoding:
     - `const decodeOnClient = true` 
2. Deploy `public/index.html` and `public/pcm-player.js` to the following storage accounts:
   - Server decoding:
     - Storage account: `apluslivestreamui` 
   - Client decoding:
     - Storage account: `apluslivestreamui2` 

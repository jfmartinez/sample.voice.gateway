# Sample Text To Speech Adapter

This sample text to speech adapter uses the Watson SDK for Text To Speech found [here](https://github.com/watson-developer-cloud/node-sdk).

## Background

By default IBM Voice Gateway uses the Watson Speech services for Text To Speech synthesis, the purpose of this project is to show how a developer can integrate a third party Text To Speech engine with IBM Voice Gateway. This project uses the Watson SDK for Text To Speech as the example for text synthesis.

## Requires
- [NodeJS v20 and higher](https://nodejs.org/en/download/)
- [IBM Voice Gateway](https://www.ibm.com/support/knowledgecenter/SS4U29/deploydocker.html) Setup


## Setup
1. Clone the Samples Repository
    ```
    git clone https://github.com/jfmartinez/sample.voice.gateway.git -b elevenlabs-tts
    cd sample.voice.gateway/speech-adapter-samples/text-to-speech/
    ```
1. Install dependencies
    ```
    npm install
    ```

1. (Optional) If working with a remote Voice Gateway you can use [ngrok](https://ngrok.com/) to expose your service:
    ```
    ngrok http 8010
    ```

1. Copy the `.env.sample` file to `.env`.
    ```
    cp .env.sample .env
    ```

1. Set `ELEVENLABS_API_KEY` in your `.env` file.

1. Run the server with `npm start`

1. Configure the Voice Gateway to connect to the adapter, by setting the `WATSON_TTS_URL` under the media.relay to point to this sample proxy
    ```
    - WATSON_TTS_URL=https://fcea70235af5.ngrok-free.app
    ```

1. Make a call

### Implement your own Text To Speech Engine

  Currently, this sample only demonstrates how to use Watson Text To Speech as the Text To Speech engine for the Voice Gateway. You can use the `lib/services/WatsonTextToSpeechEngine.js` as a guideline on how to implement your own Text To Speech Engine. Essentially, you'll be implementing a [Readable NodeJS Stream](http://nodejs.org/api/stream.html#stream_class_stream_readable). Once you implement your own class, you can modify the `lib/TextToSpeechAdapter.js` to `require` it.

  For example,

  ```js
  // Change to your own Text to Speech Engine implementation, you can use
  // the WatsonTextToSpeechEngine.js for guidance
  const TextToSpeechEngine = require('./WatsonTextToSpeechEngine');
  ```

  ```js
  // Uses MyTextToSpeechEngine
  const TextToSpeechEngine = require('./MyTextToSpeechEngine');
  ```

  #### Configuration
  In terms of configuration, a `config` object is passed in the constructor argument of your stream. Do note, this config object will contain Watson Text To Speech configuration items, you could map these parameters to specific parameters of your third party engine. For a list of configuration parameters for `Watson Text To Speech`, see the **Request** section of the [WebSocket API Reference](https://www.ibm.com/watson/developercloud/text-to-speech/api/v1/#wss_methods).

  Here's a sample config object:
  ```javascript
  {
    'accept': 'audio/basic', // Encoding of the audio, defaults to mulaw (pcmu) at 8kHz
    'voice': 'en-US_AllisonVoice'
  }
  ```
  ##### Dynamic Configuration through Conversation
  Similar to [dynamic configuration](https://www.ibm.com/support/knowledgecenter/SS4U29/dynamicspeech.html) of the Voice Gateway, you can also send configurations to the Sample STT Adapter from Conversation.

  Essentially, when using the `vgwActSetTTSConfig` action from Conversation, anything under the `config` object is passed through and used as the constructor argument for your stream engine.
  For example, setting this on the Watson Conversation service:

  ```json
  {
    "output": {
      "vgwAction": {
        "command": "vgwActSetTTSConfig",
        "parameters": {
          "config": {
            "voice": "en-US_AllisonVoice",
            "customProperty": "My Custom Property"
          }
        }
      }
    }
  }
  ```

  Will propagate to the `constructor` of the stream:

  ```javascript
  class MyTextToSpeechEngine {
    constructor(config) {
      // config.voice = "en-US_AllisonVoice"
      // config.customProperty = "My Custom Property"
    }
  }
  ```

  #### Sending synthesized Audio and Error Messages
  As shown in the `lib/WatsonTexToSpeechEngine.js`, to send audio in a NodeJS Stream, all you need is to call `this.push` with an audio chunk of type `Buffer`.

  ```javascript
  class MyTextToSpeechEngine {
    someMethod(synthesizedAudio) {
      this.push(synthesizedAudio); // Audio called with this.push will be sent to the Media Relay
    }
  }
  ```

  To surface error messages, you need to emit the `'error'` event with an error object:
  ```javascript
    const error = new Error('something bad happened, with the connection to my third party engine');
    this.emit('error', error);
  ```
  The sample will take care of propagating that error to the Media Relay.

  #### Development
  To have your adapter restart on any code changes, you can run:
  ```
  npm run dev
  ```
  And it will restart the server on any file changes made.

  You can quickly test if your implementation will be compatible with the Voice Gateway, by running the `test` command:
  ```
  npm test
  ```

## IBM Cloud Code Engine Deployment

**TBD (Work iN Progress) **
See [Deploying your app from local source code with the CLI](https://cloud.ibm.com/docs/codeengine?topic=codeengine-app-local-source-code)

Before you begin

1. Set up your [Code Engine CLI](https://cloud.ibm.com/docs/codeengine?topic=codeengine-install-cli) environment.
2. [Create and work with a project.](https://cloud.ibm.com/docs/codeengine?topic=codeengine-manage-project)

Create and work with a project.

The server comes with the Dockerfile for Code Engine deployment. To deploy the server to Code Engine, please follow the steps below:

**Note:** The steps guide how to push with a `.env` file, but
1. Build the docker image
  1. Copy the `.env-sample` file to `.env` and fill in the required information
  2. Build the image with docker build -t <image-name> . The image name should follow the format of <registry>/<namespace>/<image-name>:<tag>. For example, us.icr.io/testitall_ns/testitall_server:latest.
2. Push the image to the container registry with:
```
 docker push <image-name>
 ```
3. Create a Code Engine project and deploy the image

## License

Licensed under [Apache 2.0 License](https://github.com/WASdev/sample.voice.gateway/blob/master/LICENSE)

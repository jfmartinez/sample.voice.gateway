/**
* (C) Copyright IBM Corporation 2018.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { BasicAuthenticator, IamAuthenticator } = require('ibm-watson/auth');

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const logger = require('pino')({ level: LOG_LEVEL, name: 'WatsonTextToSpeechEngine' });
const TextToSpeechAdapter = require('./TextToSpeechAdapter');

const apikey = process.env.WATSON_TTS_APIKEY;
const url = process.env.WATSON_TTS_URL;

const authenticator = new IamAuthenticator({
  apikey,
});

const textToSpeech = new TextToSpeechV1({ authenticator, url });

const MISSING_TEXT_FIELD_ERROR = 'Text field must be defined';

class WatsonTextToSpeechEngine extends TextToSpeechAdapter {
  /**
   * Creates an instace of the WatsonTextToSpeechEngine
   * @param {Object} config - Configuration object
   * @param {String} config.text - Text to synthesize
   * @param {String} [config.voice] - Voice to use
   * @param {String} config.accept - Content-type, this is usually accept/basic for mulaw
   * @returns {Transform} Returns a readable stream
   */
  constructor(config = {}) {
    super();

    if (typeof config.text === 'undefined') {
      this.emit('error', new Error(MISSING_TEXT_FIELD_ERROR));
    }
  }

  async synthesize() {
    const params = {
      text: this.config.text,
      voice: this.config.voice,
      accept: this.config.accept,
    };

    logger.debug(params, 'sending synthesize request');

    const audioStream = await textToSpeech.synthesize();

    return audioStream;
  }
}
module.exports = WatsonTextToSpeechEngine;

/**
* (C) Copyright IBM Corporation 2025.
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

const { Readable } = require('stream');

const { ElevenLabsClient } = require('elevenlabs');
const TextToSpeechAdapter = require('./TextToSpeechAdapter');

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

class ElevenLabsTextToSpeechEngine extends TextToSpeechAdapter {
  constructor(config = {}) {
    super();
    this.config = config;
  }

  async synthesize() {
    const audioStream = await elevenlabs.generate({
      stream: true,
      voice_id: this.config.voice_id,
      voice: this.config.voice,
      text: this.config.text,
      model_id: this.config.model_id,
      voice_settings: this.config.voice_settings,
      // TODO - We need to dynamically pick the output format from the config,
      // but for now it's likely going to be mulaw
      output_format: 'ulaw_8000',
    });
    const nodeStream = Readable.fromWeb(audioStream);

    return nodeStream;
  }
}
module.exports = ElevenLabsTextToSpeechEngine;

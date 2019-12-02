// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { ApiAiClient } from 'api-ai-javascript';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Message {
  constructor(public content: string | object, public sentBy: string, public type: number) {}
}

@Injectable()
export class ChatService {

  readonly token = environment.dialogflow.angularBot;
  readonly client: any = new ApiAiClient({ accessToken: this.token });
  i = 0;

  conversation = new BehaviorSubject<Message[]>([]);

  constructor() {}

  // Sends and receives messages via DialogFlow
  converse(msg: string) {
    const userMessage = new Message(msg, 'user', 0);
    this.update(userMessage);
    this.i++;

    return this.client.textRequest(msg)
               .then(res => {
                  for(const message of res.result.fulfillment.messages) {
                    const type = message.type;
                    let botMessage = null
                    if(type === 0)
                      botMessage = new Message(message.speech, 'bot', type);
                    if(type === 1) {
                      botMessage = new Message(message, 'bot', type)
                    }
                    if (botMessage) {
                      this.update(botMessage);
                    }
                  }
               });
  }



  // Adds message to source
  update(msg: Message) {
    if(this.i==0) {return;}
    this.conversation.next([msg]);
  }


}

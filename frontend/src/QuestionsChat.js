import { LitElement, html, css } from 'lit-element';
import 'weightless/textfield';
import 'weightless/button';
import 'weightless/progress-spinner';

import { getUserInfo as originalGetUserInfo } from './api/users.js';
import { openSocket as originalOpenSocket } from './api/socket.js';

// This is the needed in order to make ESM imports mockable
let getUserInfo = originalGetUserInfo;
let openSocket = originalOpenSocket;

export const mockDependencies = dependencies => {
  getUserInfo = dependencies.getUserInfo;
  openSocket = dependencies.openSocket;
};

export class QuestionsChat extends LitElement {
  static get properties() {
    return {
      username: { type: String },
      ws: { type: Object },
      connectionError: { type: Boolean },
      questions: { type: Array },
      users: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(8px + 1vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
      }

      .spinner {
        margin-top: 100px;
      }

      .bold {
        font-weight: bold;
      }

      main {
        flex-grow: 1;
        display: grid;
        width: 100%;
        grid-template-columns: 70% 30%;
        grid-template-rows: 80px auto 80px;
        grid-template-areas:
          'header header'
          'questions users'
          'add-question add-question';
      }

      main h1 {
        grid-area: header;
        isplay: flex;
        align-items: center;
        justify-content: center;
      }

      questions-list {
        grid-area: questions;
        max-height: calc(100vh - 200px);
        overflow: scroll;
      }

      users-list {
        grid-area: users;
      }

      ask-question {
        grid-area: add-question;
      }
    `;
  }

  constructor() {
    super();
    this.username = '';
    this.users = [];
    this.questions = [];
  }

  async firstUpdated() {
    const { username } = await getUserInfo();
    this.username = username;

    this.addEventListener('answer', ({ detail }) => {
      this.ws.send(
        JSON.stringify({
          type: 'ANSWER',
          ...detail,
        })
      );
    });

    this.addEventListener('question', ({ detail }) => {
      this.ws.send(
        JSON.stringify({
          type: 'QUESTION',
          ...detail,
        })
      );
    });

    this.ws = openSocket(username);
    this.ws.onerror = () => {
      this.connectionError = true;
    };
    this.ws.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);

      if (message.type === 'USERS') {
        this.users = message.users;
      } else {
        this.questions = message.questions;
      }
    });
  }

  get questionEl() {
    return this.shadowRoot.getElementById('question');
  }

  render() {
    if (this.connectionError) {
      return html`<h1 class="error">
        Failed connecting to server, please try refreshing the page.
      </h1>`;
    }

    if (!this.username) {
      return html`<wl-progress-spinner class="spinner"></wl-progress-spinner>`;
    }

    return html`
      <main>
        <h1>Questions!</h1>
        <questions-list .questions=${this.questions}></questions-list>
        <users-list
          .users=${this.users}
          currentUser="${this.username}"
        ></users-list>
        <ask-question></ask-question>
      </main>
    `;
  }
}

customElements.define('questions-chat', QuestionsChat);

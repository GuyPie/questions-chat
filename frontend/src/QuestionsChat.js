import { LitElement, html, css } from 'lit-element';
import anime from 'animejs/lib/anime.es.js';
import 'weightless/textfield';
import 'weightless/button';
import 'weightless/progress-spinner';
import 'weightless/divider';

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
      userDetails: { type: Object },
      ws: { type: Object },
      connectionError: { type: Boolean },
      messages: { type: Array },
      users: { type: Array },
      quotedMessage: { type: Object },
      focusedUser: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        --blue: #1c2f8d;
        --purple: #6630f5;
        --lightpink: #f9f6ff;
        --pink: #eae9fc;
        --primary-hue: 224;
        --primary-saturation: 45%;
        --primary-400: 256.447, 71.9854%, 51.7059%;
        --primary-500: 256.447, 90.7834%, 57.451%;
        --primary-600: 257.626, 100%, 60.3529%;
        --input-font-family: 'Open Sans', sans-serif;
        --input-font-size: 0.9rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
        font-family: 'Open Sans', sans-serif;
      }

      .spinner {
        margin-top: 100px;
      }

      .bold {
        font-weight: bold;
      }

      #send-message,
      #users-list {
        overflow: hidden;
        color: var(--blue);
      }

      #quoted-message {
        max-height: 0;
        opacity: 0;
        transition: max-height 0.2s, opacity 0.4s;
        transition-timing-function: ease-out;
      }

      #quoted-message.visible {
        max-height: 100px;
        opacity: 1;
      }

      #focused-user {
        height: 0;
        overflow: hidden;
        color: var(--blue);
      }

      main {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        background-color: var(--pink);
        color: #9696a2;
      }
    `;
  }

  constructor() {
    super();
    this.userDetails = undefined;
    this.users = [];
    this.messages = [];
    this.quotedMessage = undefined;
    this.focusedUser = undefined;
  }

  async firstUpdated() {
    this.addEventListener('reply', ({ detail: { messageId } }) => {
      this.quotedMessage = this.messages.find(
        message => message.id === messageId
      );
      this.quotedMessageEl.classList.add('visible');
      const event = new Event('reply');
      this.sendMessageEl.dispatchEvent(event);
    });

    this.addEventListener('cancel-reply', () => {
      this.hideQuotedMessage();
    });

    this.addEventListener('user-focus', ({ detail: { user } }) => {
      this.focusedUser = user;
      this.toggleAnimation();
    });

    this.addEventListener('user-focus-out', () => {
      this.toggleAnimation();
    });

    this.addEventListener('message', ({ detail }) => {
      this.ws.send(
        JSON.stringify({
          ...detail,
          quotedMessageId: this.quotedMessage
            ? this.quotedMessage.id
            : undefined,
        })
      );

      if (this.quotedMessage) {
        this.hideQuotedMessage();
      }
    });

    this.userDetails = await getUserInfo();
    this.ws = openSocket({
      id: this.userDetails.login.uuid,
      firstName: this.userDetails.name.first,
      lastName: this.userDetails.name.last,
      pictureUrl: this.userDetails.picture.large,
    });
    this.ws.onerror = () => {
      this.connectionError = true;
    };
    this.ws.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);

      if (message.type === 'USERS') {
        this.users = message.users;
      } else {
        this.messages = message.messages;
      }
    });
  }

  toggleAnimation() {
    this.quotedMessage = undefined;
    this.quotedMessageEl.classList.remove('visible');

    if (!this.animation) {
      const tl = anime.timeline({
        duration: 800,
        easing: 'easeInElastic',
        autoplay: false,
      });
      tl.add({
        targets: [this.usersListEl, this.sendMessageEl],
        height: 0,
        opacity: 0,
      });
      tl.add(
        {
          targets: this.focusedUserEl,
          height: '100vh',
          duration: 800,
          easing: 'easeOutExpo',
        },
        '-=800'
      );
      this.animation = tl;
    }

    if (this.animation.began) {
      this.animation.reverse();

      if (
        this.animation.progress === 100 &&
        this.animation.direction === 'reverse'
      ) {
        this.animation.completed = false;
      }
    }

    if (this.animation.paused) {
      this.quotedMessage = undefined;
      this.animation.play();
    }
  }

  hideQuotedMessage() {
    this.quotedMessageEl.classList.remove('visible');
    setTimeout(() => {
      this.quotedMessage = undefined;
    }, 200);
  }

  get sendMessageEl() {
    return this.shadowRoot.getElementById('send-message');
  }

  get messagesListEl() {
    return this.shadowRoot.getElementById('messages-list');
  }

  get usersListEl() {
    return this.shadowRoot.getElementById('users-list');
  }

  get quotedMessageEl() {
    return this.shadowRoot.getElementById('quoted-message');
  }

  get focusedUserEl() {
    return this.shadowRoot.getElementById('focused-user');
  }

  render() {
    if (this.connectionError) {
      return html`<h1 class="error">
        Failed connecting to server, please try refreshing the page.
      </h1>`;
    }

    if (!this.userDetails) {
      return html`<wl-progress-spinner class="spinner"></wl-progress-spinner>`;
    }

    return html`
      <main>
        <users-list id="users-list" .users=${this.users}></users-list>
        <messages-list
          id="messages-list"
          .messages=${this.messages}
          currentUserId=${this.userDetails.login.uuid}
        ></messages-list>
        <div id="focused-user">
          <user-details .user=${this.focusedUser}></user-details>
        </div>
        <div id="quoted-message">
          <wl-divider></wl-divider>
          <quoted-message .quotedMessage=${this.quotedMessage}></quoted-message>
          <wl-divider></wl-divider>
        </div>
        <send-message id="send-message"></send-message>
      </main>
    `;
  }
}

customElements.define('questions-chat', QuestionsChat);

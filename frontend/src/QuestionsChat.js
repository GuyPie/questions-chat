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
        --gray1: #f0f0f0;
        --gray2: #eaeaea;
        --turquoise: #49bfaf;
        --green: #60c38a;
        --primary-hue: 224;
        --primary-saturation: 45%;
        --primary-400: 145.455, 35.9129%, 51.3529%;
        --primary-500: 145.455, 45.2055%, 57.0588%;
        --primary-600: 145.455, 57.346%, 62.7647%;
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

      #send-message,
      #users-list {
        overflow: hidden;
      }

      #quoted-message {
        height: 0;
      }

      #focused-user {
        height: 0;
        overflow: hidden;
      }

      main {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        background-color: var(--gray1);
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
      anime({
        targets: this.quotedMessageEl,
        height: [0, 100],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 400,
      });
      const event = new Event('reply');
      this.sendMessageEl.dispatchEvent(event);
    });

    this.addEventListener('cancel-reply', () => {
      anime({
        targets: this.quotedMessageEl,
        height: [100, 0],
        opacity: [1, 0],
        easing: 'easeOutExpo',
        complete: () => {
          this.quotedMessage = undefined;
        },
        duration: 400,
      });
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
        anime({
          targets: this.quotedMessageEl,
          height: [100, 0],
          opacity: [1, 0],
          easing: 'easeOutExpo',
          complete: () => {
            this.quotedMessage = undefined;
          },
          duration: 400,
        });
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

    await this.updateComplete;
    await super.updateComplete;
    // I don't knpw why a timeout is needed
    setTimeout(() => {
      const tl = anime.timeline({
        duration: 800,
        easing: 'easeInOutElastic',
        autoplay: false,
      });
      tl.add({
        targets: [this.usersListEl, this.sendMessageEl],
        height: 0,
        opacity: 0,
      });
      tl.add(
        {
          targets: this.messagesListEl,
          opacity: 0,
          duration: 400,
        },
        '-=400'
      );
      tl.add(
        {
          targets: this.focusedUserEl,
          height: '100vh',
          duration: 200,
          easing: 'easeOutBack',
        },
        '-=400'
      );
      this.animation = tl;
    }, 1000);
  }

  toggleAnimation() {
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
      this.animation.play();
    }
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
        </div>
        <send-message id="send-message"></send-message>
      </main>
    `;
  }
}

customElements.define('questions-chat', QuestionsChat);

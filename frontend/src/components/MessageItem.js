import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/expansion';
import 'weightless/button';

export class MessageItem extends LitElement {
  static get properties() {
    return {
      isOwnMessage: { type: Boolean },
      isQuoted: { type: Boolean },
      id: { type: String },
      author: { type: Object },
      text: { type: String },
      quotedMessage: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        --icon-size: 0.8rem;
        --button-fab-size: 1rem;
        text-align: left;
        animation: opacity 0.4s ease;
      }

      .bold {
        font-weight: bold;
      }

      .message-container {
        display: flex;
      }

      .message-container.own-message {
        flex-direction: row-reverse;
      }

      .message {
        background-color: var(--gray2);
        margin-left: 10px;
        padding: 10px;
        border-radius: 0 10px 10px 10px;
        max-width: 600px;
      }

      .message-container.own-message .message {
        background-color: var(--green);
        color: white;
        margin-left: 0;
        margin-right: 10px;
        border-radius: 10px 0 10px 10px;
      }

      .message-container.quoted .message {
        max-width: initial;
        flex: 1;
      }

      .reply {
        align-self: flex-end;
        margin-left: 5px;
        flex-shrink: 0;
      }

      .quoted-message {
        background-color: var(--turquoise);
        color: white;
        border-radius: 5px;
        padding: 5px;
        font-size: 0.75rem;
        margin-bottom: 5px;
      }

      .message-container.own-message .quoted-message {
        background-color: var(--gray2);
        color: black;
      }

      @keyframes opacity {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
    this.isOwnMessage = false;
    this.isQuoted = false;
    this.id = '';
    this.author = {};
    this.text = '';
    this.quotedMessage = undefined;
  }

  reply() {
    const event = new CustomEvent('reply', {
      bubbles: true,
      composed: true,
      detail: { messageId: this.id },
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`<div>
      <div
        class="message-container ${classMap({
          'own-message': this.isOwnMessage,
          quoted: this.isQuoted,
        })}"
      >
        <user-image .user=${this.author}></user-image>
        <div class="message">
          ${this.quotedMessage
            ? html`<div class="quoted-message">
                <span class="bold"
                  >${this.quotedMessage.author.firstName}:</span
                >
                <span>${this.quotedMessage.text}</span>
                <div></div>
              </div>`
            : ''}
          ${this.text}
        </div>
        ${!this.isOwnMessage && !this.isQuoted
          ? html`<wl-button
              class="reply"
              fab
              flat
              inverted
              outlined
              @click=${this.reply}
            >
              <wl-icon>reply</wl-icon>
            </wl-button>`
          : ''}
      </div>
    </div>`;
  }
}

customElements.define('message-item', MessageItem);

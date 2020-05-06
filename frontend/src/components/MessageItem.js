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
      oneLine: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        --icon-size: 0.8rem;
        --button-fab-size: 1rem;
        --message-border-radius: 25px;
        text-align: left;
        font-size: 0.9rem;
        margin-bottom: 10px;
        mind-width: 0;
      }

      .bold {
        font-weight: bold;
      }

      .message-container {
        display: flex;
        align-items: center;
      }

      .message-container.own-message {
        flex-direction: row-reverse;
      }

      .message {
        background-color: var(--lightpink);
        margin-left: 10px;
        border-radius: 0 var(--message-border-radius)
          var(--message-border-radius) var(--message-border-radius);
        max-width: 60%;
      }

      .message .message-text {
        padding: 20px 10px;
      }

      .message-container.own-message .message {
        background-color: var(--purple);
        color: var(--lightpink);
        margin-left: 0;
        margin-right: 10px;
        border-radius: var(--message-border-radius) 0
          var(--message-border-radius) var(--message-border-radius);
      }

      .message-container.quoted .message {
        max-width: initial;
        flex: 1;
        min-width: 0;
      }

      .message-container.one-line .message-text {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .reply {
        align-self: flex-end;
        margin-left: 5px;
        flex-shrink: 0;
        margin-bottom: 5px;
      }

      .quoted-message {
        background-color: var(--pink);
        color: var(--blue);
        padding: 5px;
        font-size: 0.75rem;
        padding-left: 10px;
        padding-right: 15px;
        border-radius: 0 var(--message-border-radius) 0 0;
        margin-bottom: -10px;
      }

      .message-container.own-message .quoted-message {
        background-color: var(--lightpink);
        color: var(--blue);
        border-radius: var(--message-border-radius) 0 0 0;
        padding-right: 10px;
        padding-left: 15px;
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
    this.oneLine = false;
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
          'one-line': this.oneLine,
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
          <div class="message-text">${this.text}</div>
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

import { LitElement, html, css } from 'lit-element';

export class QuotedMessage extends LitElement {
  static get properties() {
    return {
      quotedMessage: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        background-color: var(--gray1);
        padding: 20px;
      }

      message-item {
        width: 100%;
        margin-right: 5px;
      }

      .close {
        margin-left: auto;
        flex-shrink: 0;
        align-self: center;
      }
    `;
  }

  constructor() {
    super();
    this.quotedMessage = undefined;
  }

  cancelReply() {
    const event = new Event('cancel-reply', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <message-item
        isQuoted
        id=${this.quotedMessage.id}
        .author=${this.quotedMessage.author}
        text=${this.quotedMessage.text}
        .answers=${this.quotedMessage.answers}
      ></message-item>
      <wl-button class="close" fab flat inverted @click=${this.cancelReply}>
        <wl-icon>close</wl-icon>
      </wl-button>
    `;
  }
}

customElements.define('quoted-message', QuotedMessage);
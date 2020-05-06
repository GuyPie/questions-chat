import { LitElement, html, css } from 'lit-element';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/expansion';
import 'weightless/button';

export class SendMessage extends LitElement {
  static get properties() {
    return {
      id: { type: String },
      author: { type: String },
      text: { type: String },
      answers: { type: Array },
    };
  }

  static get styles() {
    return css`
      .send-message {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: white;
        z-index: 1;
        position: relative;
      }

      wl-textfield {
        flex-grow: 1;
        margin-right: 5px;
      }

      wl-button {
        height: 26px;
      }
    `;
  }

  firstUpdated() {
    this.addEventListener('reply', () => {
      console.log('here');
      this.messageEl.focus();
    });
  }

  get messageEl() {
    return this.shadowRoot.getElementById('message');
  }

  sendQuestion() {
    if (this.messageEl.value) {
      const event = new CustomEvent('message', {
        bubbles: true,
        composed: true,
        detail: { text: this.messageEl.value },
      });
      this.dispatchEvent(event);

      this.messageEl.value = '';
    }
  }

  render() {
    return html`<form class="send-message" onsubmit="return false;">
      <wl-textfield id="message" outlined label="Type a message"></wl-textfield>
      <wl-button
        type="submit"
        flat
        inverted
        outlined
        @click="${this.sendQuestion}"
      >
        <wl-icon>send</wl-icon>
      </wl-button>
    </form>`;
  }
}

customElements.define('send-message', SendMessage);

import { LitElement, html, css } from 'lit-element';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/expansion';
import 'weightless/button';

export class AskQuestion extends LitElement {
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
      .ask-question {
        display: flex;
        align-items: center;
        padding: 0 20px;
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

  get questionEl() {
    return this.shadowRoot.getElementById('question');
  }

  sendQuestion() {
    if (this.questionEl.value) {
      const event = new CustomEvent('question', {
        bubbles: true,
        composed: true,
        detail: { text: this.questionEl.value },
      });
      this.dispatchEvent(event);

      this.questionEl.value = '';
    }
  }

  render() {
    return html`<form class="ask-question" onsubmit="return false;">
      <wl-textfield
        id="question"
        outlined
        filled
        label="Any questions?"
      ></wl-textfield>
      <wl-button type="submit" outlined @click="${this.sendQuestion}"
        >Ask</wl-button
      >
    </form>`;
  }
}

customElements.define('ask-question', AskQuestion);

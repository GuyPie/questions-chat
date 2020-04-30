import { LitElement, html, css } from 'lit-element';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/expansion';
import 'weightless/button';

export class QuestionItem extends LitElement {
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
      :host {
        text-align: left;
      }

      .bold {
        font-weight: bold;
      }

      .add-answer {
        display: flex;
        margin: 20px 0;
      }

      .add-answer wl-textfield {
        flex-grow: 1;
        margin-right: 5px;
      }
    `;
  }

  constructor() {
    super();
    this.id = '';
    this.author = '';
    this.text = '';
    this.answers = [];
  }

  get answerEl() {
    return this.shadowRoot.getElementById('answer');
  }

  sendAnswer() {
    if (this.answerEl.value) {
      const event = new CustomEvent('answer', {
        bubbles: true,
        composed: true,
        detail: { questionId: this.id, text: this.answerEl.value },
      });
      this.dispatchEvent(event);

      this.answerEl.value = '';
    }
  }

  render() {
    return html`<div>
      <span class="bold">${this.author}:</span>
      ${this.text}
      <form class="add-answer" onsubmit="return false;">
        <wl-textfield
          id="answer"
          outlined
          filled
          label="Any idea?"
        ></wl-textfield>
        <wl-button type="submit" outlined @click="${this.sendAnswer}"
          >Answer</wl-button
        >
      </form>
      ${this.answers.length
        ? html`<wl-expansion>
            <span slot="title">${this.answers.length} answers</span>
            ${this.answers.map(
              answer => html`<div>
                <span class="bold">${answer.author}:</span>
                ${answer.text}
              </div>`
            )}
          </wl-expansion>`
        : ''}
    </div>`;
  }
}

customElements.define('question-item', QuestionItem);

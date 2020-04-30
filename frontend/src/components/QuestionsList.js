import { LitElement, html, css } from 'lit-element';
import 'weightless/divider';

export class QuestionsList extends LitElement {
  static get properties() {
    return {
      questions: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        padding: 20px;
        text-align: left;
      }

      wl-divider {
        margin: 20px 0;
      }
    `;
  }

  constructor() {
    super();
    this.questions = [];
  }

  get answerEl() {
    return this.shadowRoot.getElementById('answer');
  }

  handleClick(question) {
    const event = new CustomEvent('answer', {
      bubbles: true,
      composed: true,
      detail: { questionId: question.id, text: this.answerEl.value },
    });
    this.dispatchEvent(event);

    this.answerEl.value = '';
  }

  render() {
    return html`<section>
      ${this.questions.length
        ? this.questions.map(
            question =>
              html`
                <question-item
                  id=${question.id}
                  author=${question.author}
                  text=${question.text}
                  .answers=${question.answers}
                >
                </question-item>
                <wl-divider></wl-divider>
              `
          )
        : "No questions yet, what's on your mind?"}
    </section>`;
  }
}

customElements.define('questions-list', QuestionsList);

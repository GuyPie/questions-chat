import { LitElement, html, css } from 'lit-element';

export class MessagesList extends LitElement {
  static get properties() {
    return {
      messages: { type: Array },
      currentUserId: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        padding: 10px;
        text-align: left;
        border-radius: 50px 50px 0 0;
        background-color: white;
        flex: 1;
        overflow: auto;
        text-align: center;
      }

      message-item {
        display: block;
        margin: 10px 0;
      }
    `;
  }

  constructor() {
    super();
    this.messages = [];
    this.currentUserId = '';
  }

  async updated() {
    const isScrolledToBottom =
      this.scrollHeight - this.clientHeight <= this.scrollTop + 1;

    if (isScrolledToBottom) {
      await super.updateComplete;
      await this.updateComplete;
      this.scrollTop += this.scrollHeight - this.clientHeight;
    }
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
    return this.messages.length
      ? this.messages.map(
          message => html`
            <message-item
              ?isOwnMessage=${this.currentUserId === message.author.id}
              id=${message.id}
              .author=${message.author}
              text=${message.text}
              .quotedMessage=${message.quotedMessage}
            ></message-item>
          `
        )
      : html`<h2>No questions yet, what's on your mind?</h2>`;
  }
}

customElements.define('messages-list', MessagesList);

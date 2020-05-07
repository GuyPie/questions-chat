import { LitElement, html, css } from 'lit-element';
import anime from 'animejs/lib/anime.es.js';

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
        text-align: left;
        border-radius: 20px 20px 0 0;
        background-color: white;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        text-align: center;
      }

      message-item {
        display: block;
        margin: 20px;
      }

      message-item:last-of-type {
        margin-bottom: 10px;
      }
    `;
  }

  constructor() {
    super();
    this.messages = [];
    this.currentUserId = '';
  }

  async updated(changedProperties) {
    const isScrolledToBottom =
      this.scrollHeight - this.clientHeight <= this.scrollTop + 100;
    const isRealUpdate =
      changedProperties.get('messages') &&
      changedProperties.get('messages').length > -1;

    if (
      isRealUpdate &&
      (changedProperties.get('messages').length === 0 ||
        isScrolledToBottom ||
        this.animation.progress < 100)
    ) {
      await super.updateComplete;
      await this.updateComplete;

      this.animation = anime({
        targets: this,
        scrollTop: this.scrollHeight - this.clientHeight,
        duration: 400,
        easing: 'easeInOutSine',
      });
    }

    if (isRealUpdate && changedProperties.get('messages').length > 0) {
      anime({
        targets: this.shadowRoot.getElementById(
          this.messages[this.messages.length - 1].id
        ),
        scale: [0, 1],
      });
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

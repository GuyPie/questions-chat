import { LitElement, html, css } from 'lit-element';

export class UserImage extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }

      .image {
        border-radius: 100px;
        overflow: hidden;
        width: 50px;
        height: 50px;
        border: 2px solid var(--green);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 5px;
      }

      .image img {
        width: 96%;
        border-radius: 100px;
      }

      .name {
        font-weight: bold;
        font-size: 0.8rem;
      }
    `;
  }

  constructor() {
    super();
    this.user = {};
    this.onclick = () => {
      const event = new CustomEvent('user-focus', {
        bubbles: true,
        composed: true,
        detail: { user: this.user },
      });
      this.dispatchEvent(event);
    };
  }

  render() {
    return html`
      <div class="image">
        <img src="${this.user.pictureUrl}" />
      </div>
      <span class="name">${this.user.firstName}</span>
    `;
  }
}

customElements.define('user-image', UserImage);

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
        color: var(--blue);
      }

      .image {
        overflow: hidden;
        border-radius: 10px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        width: 100%;
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
    `;
  }
}

customElements.define('user-image', UserImage);

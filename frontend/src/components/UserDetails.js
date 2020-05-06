import { LitElement, html, css } from 'lit-element';

export class UserDetails extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        background-color: white;
        display: flex;
        height: 100%;
        flex-direction: column;
        padding: 20px;
        align-items: center;
      }

      .top {
        display: flex;
        align-items: center;
        font-size: 1.4rem;
        width: 100%;
        margin-bottom: 20px;
      }

      .top wl-icon {
        cursor: pointer;
      }

      .top .title {
        display: flex;
        height: 100%;
        align-items: center;
      }

      .info {
        display: flex;
      }

      .info .image img {
        height: 150px;
        width: 150px;
      }

      .info .right {
        text-align: left;
        margin-left: 20px;
      }
    `;
  }

  constructor() {
    super();
    this.user = {};
  }

  close() {
    const event = new Event('user-focus-out', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return this.user
      ? html`
          <div class="top">
            <wl-icon @click=${this.close}>keyboard_backspace</wl-icon>
            <span class="title">User Details</span>
          </div>
          <div class="info">
            <div class="left">
              <div class="image">
                <img src="${this.user.pictureUrl}" />
              </div>
            </div>
            <div class="right">
              <h2>${this.user.firstName} ${this.user.lastName}</h2>
              <span class="name">${this.user.firstName}</span>
            </div>
          </div>
        `
      : '';
  }
}

customElements.define('user-details', UserDetails);

import { LitElement, html, css } from 'lit-element';
import anime from 'animejs/lib/anime.es.js';

export class UsersList extends LitElement {
  static get properties() {
    return {
      users: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        text-align: left;
        padding-left: 10px;
      }

      ul {
        padding: 0;
        display: flex;
        flex-wrap: wrap;
      }

      li {
        list-style-type: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 10px;
      }

      h3 {
        text-align: left;
        margin: 10px 0;
      }
    `;
  }

  constructor() {
    super();
    this.users = [];
  }

  updated(changedProperties) {
    if (
      changedProperties.get('users') &&
      this.users.length > changedProperties.get('users').length
    ) {
      anime({
        targets: this.shadowRoot.getElementById(
          this.users[this.users.length - 1].id
        ),
        scale: [0, 1],
      });
    }
  }

  render() {
    return html`<div class="users">
      <h3>Online</h3>
      <ul>
        ${this.users.map(
          user => html`<li>
            <user-image id=${user.id} .user=${user}></user-image>
          </li>`
        )}
      </ul>
    </div>`;
  }
}

customElements.define('users-list', UsersList);

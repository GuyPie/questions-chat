import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

export class UsersList extends LitElement {
  static get properties() {
    return {
      users: { type: Array },
      currentUser: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        text-align: left;
        padding-left: 10px;
      }

      .bold {
        font-weight: bold;
      }

      ul {
        padding: 0 10px;
      }

      h3 {
        text-align: left;
      }
    `;
  }

  constructor() {
    super();
    this.users = [];
    this.currentUser = '';
  }

  render() {
    return html`<div class="users">
      <h3>${this.users.length} users online:</h3>
      <ul>
        ${this.users.map(
          user =>
            html`<li class=${classMap({ bold: this.currentUser === user })}>
              ${user}
            </li>`
        )}
      </ul>
    </div>`;
  }
}

customElements.define('users-list', UsersList);

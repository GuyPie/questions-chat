import { html, fixture, expect } from '@open-wc/testing';
import sinon from 'sinon';

import { mockDependencies } from '../src/QuestionsChat.js';

describe('QuestionsChat', () => {
  let element;
  let spies = {};

  beforeEach(async () => {
    spies = {
      addEventListener: sinon.spy(),
      send: sinon.spy(),
      getUserInfo: sinon.stub().resolves({
        login: { uuid: 'abc123' },
        name: { firstName: 'Some', lastName: 'User' },
        picture: { medium: 'someurl' },
      }),
    };
    mockDependencies({
      getUserInfo: spies.getUserInfo,
      openSocket: sinon.stub().returns({
        addEventListener: spies.addEventListener,
        send: spies.send,
      }),
    });
    element = await fixture(html` <questions-chat></questions-chat> `);
  });

  it('shows error when server is unresponsive', async () => {
    element.ws.onerror();
    await element.updateComplete;
    const errorEl = element.shadowRoot.querySelector('h1.error');
    expect(errorEl).to.exist;
  });

  it('shows spinner when loading user details', async () => {
    spies.getUserInfo.resolves(undefined);
    element = await fixture(html` <questions-chat></questions-chat> `);
    const spinnerEl = element.shadowRoot.querySelector('wl-progress-spinner');
    expect(spinnerEl).to.exist;
  });

  it('hides spinner on load', async () => {
    const spinnerEl = element.shadowRoot.querySelector('wl-progress-spinner');
    expect(spinnerEl).to.not.exist;
  });

  it('sends event on user message', async () => {
    const event = new CustomEvent('message', {
      detail: { text: 'text text?' },
    });
    element.dispatchEvent(event);
    expect(
      spies.send.calledWith(
        JSON.stringify({
          text: 'text text?',
        })
      )
    ).to.be.true;
  });

  it('listens to updates in connected users', async () => {
    const payload = {
      data: JSON.stringify({
        type: 'USERS',
        users: ['bot', 'abc123', 'someuser'],
      }),
    };
    spies.addEventListener.yield(payload);
    expect(element.users).to.eql(['bot', 'abc123', 'someuser']);
  });

  it('listens to updates in feed', async () => {
    const payload = {
      data: JSON.stringify({
        type: 'FEED',
        messages: [{ author: '123abc', text: 'How are you?' }],
      }),
    };
    spies.addEventListener.yield(payload);
    expect(element.messages).to.eql([
      { author: '123abc', text: 'How are you?' },
    ]);
  });

  it('shows quoted message on reply event', async () => {
    const payload = {
      data: JSON.stringify({
        type: 'FEED',
        messages: [{ id: '123', author: '123abc', text: 'How are you?' }],
      }),
    };
    spies.addEventListener.yield(payload);
    const event = new CustomEvent('reply', {
      detail: { messageId: '123' },
    });
    element.dispatchEvent(event);
    await element.updateComplete;
    const quotedMessageEl = element.shadowRoot.querySelector('quoted-message');
    expect(element.quotedMessage).to.eql({
      id: '123',
      author: '123abc',
      text: 'How are you?',
    });
    expect(quotedMessageEl).to.exist;
  });

  it('focuses send message input on reply event', async () => {
    const payload = {
      data: JSON.stringify({
        type: 'FEED',
        messages: [{ id: '123', author: '123abc', text: 'How are you?' }],
      }),
    };
    spies.addEventListener.yield(payload);
    const spy = sinon.spy();
    sinon.stub(element, 'sendMessageEl').get(() => ({ dispatchEvent: spy }));
    const event = new CustomEvent('reply', {
      detail: { messageId: '123' },
    });
    element.dispatchEvent(event);
    expect(spy.called).to.be.true;
  });

  it('hides quoted message on cancel reply event', async () => {
    const payload = {
      data: JSON.stringify({
        type: 'FEED',
        messages: [{ id: '123', author: '123abc', text: 'How are you?' }],
      }),
    };
    spies.addEventListener.yield(payload);
    const event = new CustomEvent('reply', {
      detail: { messageId: '123' },
    });
    element.dispatchEvent(event);
    element.dispatchEvent(new Event('cancel-reply'));
    const quotedMessageEl = element.shadowRoot.querySelector('quoted-message');
    expect(element.quotedMessage).to.not.exist;
    expect(quotedMessageEl).to.not.exist;
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});

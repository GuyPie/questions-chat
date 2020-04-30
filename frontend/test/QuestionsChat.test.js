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
    };
    mockDependencies({
      getUserInfo: () => Promise.resolve({ username: 'abc123' }),
      openSocket: () => spies,
    });
    element = await fixture(html` <questions-chat></questions-chat> `);
  });

  it('shows error when server is unresponsive', async () => {
    element.ws.onerror();
    await element.updateComplete;
    const error = element.shadowRoot.querySelector('h1.error');
    expect(error).to.exist;
  });

  it('shows spinner when loading user details', async () => {
    mockDependencies({
      getUserInfo: () => Promise.resolve({ username: undefined }),
      openSocket: () => {},
    });
    element = await fixture(html` <questions-chat></questions-chat> `);
    const spinner = element.shadowRoot.querySelector('wl-progress-spinner');
    expect(spinner).to.exist;
  });

  it('hides spinner on load', async () => {
    const spinner = element.shadowRoot.querySelector('wl-progress-spinner');
    expect(spinner).to.not.exist;
  });

  it('sends event on user answer', async () => {
    const event = new CustomEvent('answer', {
      detail: { questionId: '123', text: 'text text' },
    });
    element.dispatchEvent(event);
    expect(
      spies.send.calledWith(
        JSON.stringify({
          type: 'ANSWER',
          questionId: '123',
          text: 'text text',
        })
      )
    ).to.be.true;
  });

  it('sends event on user question', async () => {
    const event = new CustomEvent('question', {
      detail: { text: 'text text?' },
    });
    element.dispatchEvent(event);
    expect(
      spies.send.calledWith(
        JSON.stringify({
          type: 'QUESTION',
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
        questions: [{ author: '123abc', text: 'How are you?' }],
      }),
    };
    spies.addEventListener.yield(payload);
    expect(element.questions).to.eql([
      { author: '123abc', text: 'How are you?' },
    ]);
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});

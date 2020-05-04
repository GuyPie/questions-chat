const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { BOT_ID } = require('../src/constants');

let spies;
let sendBotAnswerIfAppropriate;

test.beforeEach(() => {
	spies = {
    getMessage: sinon.stub(),
    getRepliesToMessage: sinon.stub(),
    addMessage: sinon.spy(),
	};
  spies.getMessage.returns({ author: { firstName: 'abc' }, text: 'just asking?' });
  spies.getRepliesToMessage.returns([nonBotAnswer]);
	sendBotAnswerIfAppropriate = proxyquire('../src/bot', {
    './messages': spies
  }).sendBotAnswerIfAppropriate;
});

const question = { id: 'somequestion' };
const nonBotAnswer = { author: { firstName: '123' }, text: 'some text' };

test.serial('returns false when similar questions array is empty', async t => {
  t.false(sendBotAnswerIfAppropriate(question, []));
});

test.serial('returns false when first similar question is less than 0.5 similar', async t => {
  t.false(sendBotAnswerIfAppropriate(question, [{ _score: 0.4 }]));
});

test.serial('returns false when there are no non-bot answers', async t => {
  spies.getRepliesToMessage.returns([{ author: { id: BOT_ID } }]);
  t.false(sendBotAnswerIfAppropriate(question, [{ _score: 0.9, _source: {} }]));
});

test.serial('returns true when there is a similar non-bot answer', async t => {
  t.true(sendBotAnswerIfAppropriate(question, [{ _score: 0.9, _source: {} }]));
});

test.serial('add certain answer when similarity is above 0.95', async t => {
  sendBotAnswerIfAppropriate(question, [{ _score: 0.96, _source: {} }]);
  const arg = spies.addMessage.firstCall.firstArg;
  t.deepEqual(arg, {
    authorId: BOT_ID,
    text: 'Are you just copying and pasting questions? Anyway, if 123 knows what they\'re talking about the answer is "some text".',
    quotedMessageId: 'somequestion',
  });
});

test.serial('add somewhat certain answer when similarity is above 0.8', async t => {
  sendBotAnswerIfAppropriate(question, [{ _score: 0.82, _source: {} }]);
  const arg = spies.addMessage.firstCall.firstArg;
  t.deepEqual(arg, {
    authorId: BOT_ID,
    text: 'I\'m pretty sure 123 already covered this! When asked "just asking?", their answer was "some text".',
    quotedMessageId: 'somequestion',
  });
});

test.serial('add uncertain answer when similarity is above 0.5', async t => {
  sendBotAnswerIfAppropriate(question, [{ _score: 0.61, _source: {} }]);
  const arg = spies.addMessage.firstCall.firstArg;
  t.deepEqual(arg, {
    authorId: BOT_ID,
    text: 'I don\'t know if this helps, but when asked "just asking?", 123 had this to say - "some text".',
    quotedMessageId: 'somequestion',
  });
});


const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { BOT_NAME } = require('../src/constants');

let spies;
let sendBotAnswerIfAppropriate;

test.beforeEach(() => {
	spies = {
    getQuestion: sinon.stub(),
    addAnswer: sinon.spy(),
	};
	sendBotAnswerIfAppropriate = proxyquire('../src/bot', {
    './questions': spies
	}).sendBotAnswerIfAppropriate;
})

const question = {};

test.serial('returns false when similar questions array is empty', async t => {
  spies.getQuestion.returns({ author: 'some name', answers: [{ author: BOT_NAME }] });
  t.false(sendBotAnswerIfAppropriate(question, []));
});

test.serial('returns false when first similar question is less than 0.5 similar', async t => {
  spies.getQuestion.returns({ author: 'some name', answers: [{ author: BOT_NAME }] });
  t.false(sendBotAnswerIfAppropriate(question, [{ _score: 0.4 }]));
});

test.serial('returns false when there are no non-bot answers', async t => {
  spies.getQuestion.returns({ author: 'some name', answers: [{ author: BOT_NAME }] });
  t.false(sendBotAnswerIfAppropriate(question, [{ _score: 0.9, _source: {} }]));
});

test.serial('returns true when there is a similar non-bot answer', async t => {
  spies.getQuestion.returns({ author: 'some name', answers: [{ author: 'abc' }] });
  t.true(sendBotAnswerIfAppropriate(question, [{ _score: 0.9, _source: {} }]));
});

test.serial('add certain answer when similarity is above 0.95', async t => {
  spies.getQuestion.returns({ author: 'some name', answers: [{ author: 'abc', text: 'some text' }] });
  sendBotAnswerIfAppropriate(question, [{ _score: 0.96, _source: {} }]);
  const arg = spies.addAnswer.firstCall.lastArg;
  t.deepEqual(arg, {
    author: BOT_NAME,
    text: 'Are you just copying and pasting questions? Anyway, if abc knows what they\'re talking about the answer is "some text".',
  });
});

test.serial('add somewhat certain answer when similarity is above 0.8', async t => {
  spies.getQuestion.returns({ author: 'some name', text: 'just asking?', answers: [{ author: 'abc', text: 'some text' }] });
  sendBotAnswerIfAppropriate(question, [{ _score: 0.82, _source: {} }]);
  const arg = spies.addAnswer.firstCall.lastArg;
  t.deepEqual(arg, {
    author: BOT_NAME,
    text: 'I\'m pretty sure abc already covered this! When asked "just asking?", their answer was "some text".',
  });
});

test.serial('add uncertain answer when similarity is above 0.5', async t => {
  spies.getQuestion.returns({ author: 'some name', text: 'just asking?', answers: [{ author: 'abc', text: 'some text' }] });
  sendBotAnswerIfAppropriate(question, [{ _score: 0.61, _source: {} }]);
  const arg = spies.addAnswer.firstCall.lastArg;
  t.deepEqual(arg, {
    author: BOT_NAME,
    text: 'I don\'t know if this helps, but when asked "just asking?", abc had this to say - "some text".',
  });
});


const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { QUESTION_INBOUND_MESSAGE_TYPE, ANSWER_INBOUND_MESSAGE_TYPE } = require('../src/constants');

let spies;
let init;

test.beforeEach(() => {
	spies = {
		loadTf: sinon.stub().resolves({
			embed: sinon.stub().resolves({
				array: sinon.stub().resolves(['12345'])
			}),
		}),
		initSocket: sinon.spy(),
		onConnectionMessage: sinon.spy(),
		sendFeedToAll: sinon.spy(),
		addQuestion: sinon.stub().returns({ text: 'a question' }),
		addAnswer: sinon.spy(),
		getSimilarQuestions: sinon.spy(),
		insertQuestion: sinon.spy(),
		sendBotAnswerIfAppropriate: sinon.stub(),
	};
	init = proxyquire('../src/index', {
		'@tensorflow-models/universal-sentence-encoder': { load: spies.loadTf, '@noCallThru': true },
		'./socket': { initSocket: spies.initSocket, onConnectionMessage: spies.onConnectionMessage, sendFeedToAll: spies.sendFeedToAll },
		'./questions': { addQuestion: spies.addQuestion, addAnswer: spies.addAnswer },
		'./elasticsearch': { insertQuestion: spies.insertQuestion, getSimilarQuestions: spies.getSimilarQuestions },
		'./bot': { sendBotAnswerIfAppropriate: spies.sendBotAnswerIfAppropriate },
	}).init;
});

test.serial('initiliazes tensorflow model and web socket', async t => {
	await init();
	t.true(spies.loadTf.calledOnce);
	t.true(spies.initSocket.calledOnce);
});

test.serial('adds question on question message', async t => {
	await init();
	spies.onConnectionMessage.yield('123abc', { type: QUESTION_INBOUND_MESSAGE_TYPE, text: 'some question' });
	const arg = spies.addQuestion.firstCall.firstArg;
	t.deepEqual(arg, { author: '123abc', text: 'some question' });
});

test.serial('saves question to elasticsearch asynchronously on question message', async t => {
	await init();
	spies.onConnectionMessage.yield('123abc', { type: QUESTION_INBOUND_MESSAGE_TYPE, text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		const [firstArg, secondArg] = spies.insertQuestion.firstCall.args;
		t.deepEqual(firstArg, { text: 'a question' });
		t.is(secondArg, '12345');
	});
});

test.serial('updates feed asynchronously if bot has answer for question message', async t => {
	await init();
	spies.sendBotAnswerIfAppropriate.returns({ text: 'clever bot answer' });
	spies.onConnectionMessage.yield('123abc', { type: QUESTION_INBOUND_MESSAGE_TYPE, text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		t.true(spies.sendFeedToAll.calledOnce);
	});
});

test.serial('does not update feed if bot has no answer for question message', async t => {
	await init();
	spies.onConnectionMessage.yield('123abc', { type: QUESTION_INBOUND_MESSAGE_TYPE, text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		t.false(spies.sendFeedToAll.calledOnce);
	});
});

test.serial('adds answer on answer message', async t => {
	await init();
	spies.onConnectionMessage.yield('123abc', { type: ANSWER_INBOUND_MESSAGE_TYPE, questionId: '123', text: 'an answer' });
	const [firstArg, secondArg] = spies.addAnswer.firstCall.args;
	t.is(firstArg, '123');
	t.deepEqual(secondArg, { author: '123abc', text: 'an answer' });
});

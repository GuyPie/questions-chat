const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

let spies;
let init;

test.beforeEach(() => {
	const SocketStub = sinon.stub();
	SocketStub.prototype.onConnectionMessage = sinon.spy();
	SocketStub.prototype.sendFeed = sinon.spy();
	spies = {
		loadTf: sinon.stub().resolves({
			embed: sinon.stub().resolves({
				array: sinon.stub().resolves(['12345'])
			}),
		}),
		Socket: SocketStub,
		addMessage: sinon.stub().returns({ text: 'a question' }),
		addAnswer: sinon.spy(),
		getSimilarQuestions: sinon.spy(),
		insertQuestion: sinon.spy(),
		sendBotAnswerIfAppropriate: sinon.stub(),
	};
	init = proxyquire('../src/index', {
		'@tensorflow-models/universal-sentence-encoder': { load: spies.loadTf, '@noCallThru': true },
		'./socket': SocketStub,
		'./messages': { addMessage: spies.addMessage },
		'./elasticsearch': { insertQuestion: spies.insertQuestion, getSimilarQuestions: spies.getSimilarQuestions },
		'./bot': { sendBotAnswerIfAppropriate: spies.sendBotAnswerIfAppropriate },
	}).init;
});

test.serial('initiliazes tensorflow model and web socket', async t => {
	await init();
	t.true(spies.loadTf.calledOnce);
	t.true(spies.Socket.calledOnce);
});

test.serial('adds message on socket message', async t => {
	await init();
	spies.Socket.prototype.onConnectionMessage.yield('123abc', { text: 'some question', quotedMessageId: 'someid' });
	const arg = spies.addMessage.firstCall.firstArg;
	t.deepEqual(arg, { authorId: '123abc', text: 'some question', quotedMessageId: 'someid' });
});

test.serial('saves question to elasticsearch asynchronously on question message', async t => {
	await init();
	spies.Socket.prototype.onConnectionMessage.yield('123abc', { text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		const [firstArg, secondArg] = spies.insertQuestion.firstCall.args;
		t.deepEqual(firstArg, { text: 'a question' });
		t.is(secondArg, '12345');
	});
});

test.serial('updates feed asynchronously if bot has answer for question message', async t => {
	await init();
	spies.sendBotAnswerIfAppropriate.returns({ text: 'clever bot answer' });
	spies.Socket.prototype.onConnectionMessage.yield('123abc', { text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		t.true(spies.Socket.prototype.sendFeed.calledOnce);
	});
});

test.serial('does not update feed if bot has no answer for question message', async t => {
	await init();
	spies.Socket.prototype.onConnectionMessage.yield('123abc', { text: 'some question' });

	return new Promise(resolve => setTimeout(resolve)).then(() => {
		t.false(spies.Socket.prototype.sendFeed.calledOnce);
	});
});

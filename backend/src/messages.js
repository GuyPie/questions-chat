const short = require('short-uuid');
const { getUser } = require('./users');

const messages = [];

const addMessage = ({ authorId, text, quotedMessageId }) => {
  const message = {
    id: short.generate(),
    author: getUser(authorId),
    text,
    quotedMessage: messages.find((message) => message.id === quotedMessageId),
  };
  messages.push(message);

  return message;
}

const getMessage = (messageId) => {
  return messages.find(message => message.id === messageId);
}

const getRepliesToMessage = (messageId) => {
  return messages.filter(message => message.quotedMessage && message.quotedMessage.id === messageId);
}

const getMessages = () => messages;

module.exports = { addMessage, getMessage, getRepliesToMessage, getMessages };

const WebSocket = require('ws');
const url = require('url');
const { BOT_NAME, FEED_OUTBOUND_MESSAGE_TYPE, USERS_OUTBOUND_MESSAGE_TYPE } = require('./constants');
const { getQuestions } = require('./questions');

const initSocket = () => {
  return new WebSocket.Server({ port: 8080 });
};

const onConnectionMessage = (wss, callback) => {
  wss.on('connection', (ws, request) => {
    const { query } = url.parse(request.url, true);
    ws.id = query.id;
    sendFeed(ws);
    sendUsersListToAll(wss);
  
    ws.on('message', async (message) => {
      await callback(query.id, JSON.parse(message));
      sendFeedToAll(wss);
    });
    ws.on('close', () => sendUsersListToAll(wss));  
  });
};

const sendFeed = (client) => {
  client.send(JSON.stringify({
    type: FEED_OUTBOUND_MESSAGE_TYPE,
    questions: getQuestions(),
  }));
};

const sendUsersListToAll = (wss) => {
  const users = [...wss.clients].map(client => client.id);
  users.unshift(BOT_NAME);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: USERS_OUTBOUND_MESSAGE_TYPE,
        users,
      }));
    }
  });
};

const sendFeedToAll = (wss) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendFeed(client);
    }
  });
};

module.exports = { initSocket, onConnectionMessage, sendUsersListToAll, sendFeed, sendFeedToAll };

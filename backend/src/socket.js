const WebSocket = require('ws');
const url = require('url');
const { FEED_OUTBOUND_MESSAGE_TYPE, USERS_OUTBOUND_MESSAGE_TYPE } = require('./constants');
const { getMessages } = require('./messages');
const { addUser, getOnlineUsers, markUserOffline, getUser } = require('./users');

class Socket {
  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });
  }

  onConnectionMessage(callback) {
    this.wss.on('connection', (ws, request) => {
      const { query } = url.parse(request.url, true);
      ws.id = query.id;
      addUser({
        id: query.id, 
        firstName: query.firstName,
        lastName: query.lastName,
        pictureUrl: query.pictureUrl,
      });
      this.sendUsersList();
      this.sendFeed(ws);
    
      ws.on('message', async (message) => {
        await callback(query.id, JSON.parse(message));
        this.sendFeed();
      });
      ws.on('close', () => {
        markUserOffline(ws.id);
        this.sendUsersList()
      });  
    });
  };

  sendFeed(client) {
    if (client) {
      client.send(JSON.stringify({
        type: FEED_OUTBOUND_MESSAGE_TYPE,
        messages: getMessages(),
      }));
    } else {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          this.sendFeed(client);
        }
      });
    }
  }

  sendUsersList() {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: USERS_OUTBOUND_MESSAGE_TYPE,
          users: getOnlineUsers(),
        }));
      }
    });
  }
}

module.exports = Socket;

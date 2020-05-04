const { BOT_ID } = require('./constants');
const users = [];

const addUser = (userDetails) => {
  users.push({
    ...userDetails,
    online: true,
  });

  return userDetails;
}

const markUserOffline = (userId) => {
  const index = users.findIndex(({ id }) => id === userId);

  if (index > -1) {
    users[index] = {
      ...users[index],
      online: false,
    };
    return true;
  }

  return false;
}

const getOnlineUsers = () => users.filter(user => user.online);

const getUser = (id) => {
  if (id === BOT_ID) {
    return {
      id, 
      firstName: 'Bot',
      lastName: 'Robotnik',
      pictureUrl: 'https://cdn.imgbin.com/4/1/0/imgbin-internet-bot-robot-chatbot-user-robot-PbX0WYPcj8AAKcDqVd7R7qYAD.jpg',
    };
  }
  
  return users.find(user => user.id === id);
}

module.exports = { addUser, markUserOffline, getOnlineUsers, getUser };

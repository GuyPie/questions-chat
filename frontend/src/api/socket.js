export const openSocket = ({ id, firstName, lastName, pictureUrl }) =>
  new WebSocket(
    `ws://localhost:8080?id=${id}&firstName=${firstName}&lastName=${lastName}&pictureUrl=${pictureUrl}`
  );

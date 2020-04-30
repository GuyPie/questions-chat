export const openSocket = username =>
  new WebSocket(`ws://localhost:8080?id=${username}`);

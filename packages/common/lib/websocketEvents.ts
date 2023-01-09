export const WebsocketEvent = {
  CONNECTION: "connection",
  ERROR: "error",
  HEADERS: "headers",
  CLOSE: "close",
  LISTENING: "listening",
  PING: "ping",
  PONG: "pong",
  MESSAGE: "message",
} as const;

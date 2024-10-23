import { WebSocketServer } from "ws";

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("New client connected");
  console.log(`- Max clients: ${wss.clients.size}`);

  ws.on("message", (message) => {
    console.log("received: ", message);
  });

  ws.on("error", (error) => {
    console.log("Error: %s", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
console.log(`Server parameters:`);
console.log(`- Port: ${PORT}`);

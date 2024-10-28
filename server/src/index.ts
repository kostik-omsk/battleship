import { WebSocketServer, WebSocket } from "ws";
import { wsRoutes } from "./routes/wsRoutes";
import { handleExit } from "./controllers/roomController";

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");
  console.log(`- Number of active clients: ${wss.clients.size}`);

  ws.on("message", (message: string) => {
    wsRoutes(ws, message);
  });

  ws.on("error", (error) => {
    console.log("Error: %s", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    handleExit(ws);
  });
});

wss.on("error", (error) => {
  console.log("Error: %s", error);
});

wss.on("close", () => {
  console.log("Server closed");
});

console.log(`WebSocket server is running on port ${PORT}`);

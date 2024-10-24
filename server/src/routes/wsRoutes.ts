// Маршрутизация сообщений WebSocket
import { WebSocket } from "ws";
import { parseMessage } from "@/utils/messageParser";
import { handleRegistration } from "@/controllers/regController";
import { MessageType } from "@/types/index.d";

export function wsRoutes(ws: WebSocket, message: string) {
  const { type, data } = parseMessage(message);

  switch (type) {
    case MessageType.Reg:
      handleRegistration(ws, data);
      break;

    default:
      console.log("Unknown message type:", type);
  }
}

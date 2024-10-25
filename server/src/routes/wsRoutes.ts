// Маршрутизация сообщений WebSocket
import { WebSocket } from "ws";
import { safeParseJSON } from "@/utils/messageParser";
import { handleRegistration } from "@/controllers/regController";
import { BaseMessage, MessageType } from "@/types/index.d";
import { handleAddUserToRoom, handleCreateRoom } from "@/controllers/roomController";

export function wsRoutes(ws: WebSocket, message: string) {
  const parsedMessage = safeParseJSON<BaseMessage>(message);

  if (!parsedMessage || typeof parsedMessage !== "object") {
    console.log("Received invalid Message");
    return;
  }

  const { type, data } = parsedMessage;

  switch (type as MessageType) {
    case MessageType.Reg:
      handleRegistration(ws, data);
      break;
    case MessageType.CreateRoom:
      handleCreateRoom(ws);
      break;
    case MessageType.AddUserToRoom:
      handleAddUserToRoom(ws, data);
      break;
    default:
      console.log("Unknown message type:", type);
  }
}

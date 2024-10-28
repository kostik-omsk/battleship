// Маршрутизация сообщений WebSocket
import { WebSocket } from "ws";
import { safeParseJSON } from "@/utils/messageParser";
import { handleRegistration } from "@/controllers/regController";
import { BaseMessage, MessageType } from "@/types/index.d";
import { handleAddUserToRoom, handleCreateRoom } from "@/controllers/roomController";
import { addShips, attack } from "@/controllers/gameController";
import { botTurn, handSinglePlay } from "@/controllers/single_play/singlePlay";

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
    case MessageType.Single:
      handSinglePlay(ws);
      break;
    case MessageType.CreateRoom:
      handleCreateRoom(ws);
      break;
    case MessageType.AddUserToRoom:
      handleAddUserToRoom(ws, data);
      break;
    case MessageType.AddShips:
      addShips(ws, data);
      break;
    case MessageType.Attack:
      attack(ws, data);
      break;
    case MessageType.RandomAttack:
      attack(ws, data, true);
      break;
    case MessageType.Turn:
      botTurn(ws, data);
      break;

    default:
      break;
  }
}

import { randomUUID } from "crypto";
import { ExtendedWebSocket, MessageType, Room, RoomUser, UpdateRoom } from "@/types/index.d";
import sendMessage from "@/utils/sendMessage";
import { safeParseJSON } from "@/utils/messageParser";
import { createGame } from "./gameController";
import { getConnections } from "@/services/WebSocketService";

export const rooms: UpdateRoom[] = [];

export const updateRoom = (ws: ExtendedWebSocket) => {
  sendMessage<UpdateRoom[]>(ws, MessageType.UpdateRoom, rooms);
};
export const handleCreateRoom = (ws: ExtendedWebSocket) => {
  if (!ws.player) return;

  const user: RoomUser = {
    name: ws.player.name,
    index: ws.player.index,
  };

  rooms.push({
    roomId: randomUUID(),
    roomUsers: [user],
  });

  sendMessage<UpdateRoom[]>(ws, MessageType.UpdateRoom, rooms);
};

export const handleAddUserToRoom = (ws: ExtendedWebSocket, data: string) => {
  const parsedData = safeParseJSON<Room>(data);

  if (!parsedData) {
    console.log("Received invalid data");
    return;
  }

  const { indexRoom } = parsedData;
  const roomIndex = rooms.findIndex((room) => room.roomId === indexRoom);

  if (roomIndex !== -1) {
    // Комната найдена — добавляем пользователя
    if (!ws.player) return;
    rooms[roomIndex].roomUsers.push({
      name: ws.player.name,
      index: ws.player.index,
    });

    const room = rooms[roomIndex];
    updateRoom(ws);

    if (room.roomUsers.length === 2) {
      rooms.splice(roomIndex, 1);
      createGameForPlayers(room);
    }
  } else {
    console.log("Room not found");
  }
};

export function createGameForPlayers(room: UpdateRoom) {
  const [player1, player2] = room.roomUsers;

  const player1Ws = getConnections(player1);
  const player2Ws = getConnections(player2);

  createGame(player1Ws);
  createGame(player2Ws);
}

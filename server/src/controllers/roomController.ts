import { randomUUID } from "crypto";
import { ExtendedWebSocket, MessageType, Room, RoomUser, UpdateRoom } from "@/types/index.d";
import sendMessage from "@/utils/sendMessage";
import { safeParseJSON } from "@/utils/messageParser";
import { createGameForPlayers, endGame, gameSessions } from "./gameController";
import { getAllConnections } from "@/services/WebSocketService";

export const rooms: UpdateRoom[] = [];

export const updateRoom = () => {
  const connections = getAllConnections();

  connections.forEach((ws) => {
    sendMessage<UpdateRoom[]>(ws, MessageType.UpdateRoom, rooms);
  });
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

  updateRoom();
};

export const handleAddUserToRoom = (ws: ExtendedWebSocket, data: string) => {
  const parsedData = safeParseJSON<Room>(data);

  if (!parsedData) {
    console.log("Received invalid data");
    return;
  }

  const { indexRoom } = parsedData;
  const roomIndex = rooms.findIndex((room) => room.roomId === indexRoom);
  //больше 2 игроков не может быть в одной комнате
  if (rooms[roomIndex].roomUsers.length >= 2) {
    console.log("Room is full");
    return;
  }

  const isUserInRoom = rooms[roomIndex].roomUsers.some((user) => user.index === ws.player?.index);
  if (isUserInRoom) {
    console.log("User already in room");
    return;
  }

  if (roomIndex !== -1) {
    if (!ws.player) return;
    rooms[roomIndex].roomUsers.push({
      name: ws.player.name,
      index: ws.player.index,
    });

    const room = rooms[roomIndex];

    if (room.roomUsers.length === 2) {
      createGameForPlayers(room);
      rooms.splice(roomIndex, 1);
    }
    updateRoom();
  } else {
    console.log("Room not found");
  }
};

// Функция для обработки отключения игрока
export const handleExit = (ws: ExtendedWebSocket) => {
  if (!ws.player) return;

  // const playerIndex = ws.player.index;
  // const roomIndex = rooms.findIndex((room) => room.roomUsers.some((user) => user.index === playerIndex));

  // if (roomIndex !== -1) {
  //   const room = rooms[roomIndex];
  //   const remainingUser = room.roomUsers[0];
  //   const remainingUserWs = getConnections(remainingUser);
  //   endGame(remainingUserWs, ws, Number(remainingUser), null);
  //   rooms.splice(roomIndex, 1);
  // }
  // updateRoom();

  if (gameSessions) {
    // Проверка на отключение в процессе игры
    for (const gameId in gameSessions) {
      const gameSession = gameSessions[gameId];
      const playerInGame = Object.keys(gameSession.players).find((key) => gameSession.players[key] === ws);

      if (playerInGame !== undefined) {
        const opponentIndex = Object.keys(gameSession.players).find((key) => key !== playerInGame);

        // Завершаем игру, объявляя оставшегося игрока победителем, если есть оппонент
        if (opponentIndex && gameSession.players[opponentIndex]) {
          const opponentWs = gameSession.players[opponentIndex];
          endGame(opponentWs, ws, Number(opponentIndex), gameId);
        } else {
          console.log(`Game ${gameId} has no remaining players.`);
        }
        break;
      }
    }
  }
};

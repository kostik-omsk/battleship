import { ExtendedWebSocket, MessageType, Player, RegCreateMessage, RegLogMessage, User } from "@/types/index.d";
import { safeParseJSON } from "@/utils/messageParser";
import { updateRoom } from "@/controllers/roomController";
import { updateWinners } from "@/controllers/gameController";
import sendMessage from "@/utils/sendMessage";
import { addConnection } from "@/services/WebSocketService";

interface PlayersDB {
  [name: string]: Player;
}
interface usersDB {
  [name: string]: User;
}

export const playersDB: PlayersDB = {};
export const usersDB: usersDB = {};

export const handleRegistration = (ws: ExtendedWebSocket, data: string) => {
  const parsedData = safeParseJSON<RegLogMessage>(data);

  if (!parsedData) {
    console.log("Received invalid data");
    return;
  }

  const { name, password } = parsedData;

  if (name && password) {
    const existingUser = usersDB[name];
    const existingPlayer = playersDB[name];

    if (existingPlayer && existingUser && existingUser.password === password) {
      const player = {
        name,
        index: existingPlayer.index,
      };

      ws.player = player;
      addConnection(ws, player);

      const response = {
        ...player,
        error: false,
        errorText: "",
      };
      sendMessage<RegCreateMessage>(ws, MessageType.Reg, response);
      updateRoom(ws);
      updateWinners(ws);
    } else if (existingPlayer) {
      const response = {
        name,
        index: "",
        error: true,
        errorText: "Player already registered",
      };
      sendMessage<RegCreateMessage>(ws, MessageType.Reg, response);
    } else {
      const playerId = Object.keys(playersDB).length + 1;
      playersDB[name] = { index: playerId, wins: 0 };
      usersDB[name] = { password };

      const player = {
        name,
        index: playerId,
      };

      ws.player = player;
      addConnection(ws, player);

      const response = {
        ...player,
        error: false,
        errorText: "",
      };

      sendMessage<RegCreateMessage>(ws, MessageType.Reg, response);
      updateRoom(ws);
      updateWinners(ws);
    }
  }
};

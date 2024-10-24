import { RegLogMessage } from "@/types";
import { WebSocket } from "ws";

interface Player {
  password: string;
  playerId: number | string;
  wins: number;
}

interface PlayersDB {
  [name: string]: Player;
}

export const playersDB: PlayersDB = {};

export const handleRegistration = (ws: WebSocket, { name, password }: RegLogMessage["data"]) => {
  if (name && password) {
    const existingPlayer = playersDB[name];

    if (existingPlayer && existingPlayer.password === password) {
      const response = {
        type: "reg",
        data: JSON.stringify({
          name,
          index: existingPlayer.playerId,
          error: false,
          errorText: "",
        }),
        id: 0,
      };

      ws.send(JSON.stringify(response));
    } else if (existingPlayer) {
      const response = {
        type: "reg",
        data: JSON.stringify({
          name,
          index: "",
          error: true,
          errorText: "Player already registered",
        }),
        id: 0,
      };

      ws.send(JSON.stringify(response));
    } else {
      const playerId = Object.keys(playersDB).length + 1;
      playersDB[name] = { password, playerId, wins: 0 };

      const response = {
        type: "reg",
        data: JSON.stringify({
          name,
          index: playerId,
          error: false,
          errorText: "",
        }),
        id: 0,
      };

      ws.send(JSON.stringify(response));
    }
  }
};

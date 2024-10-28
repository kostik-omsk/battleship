import WebSocket from "ws";
import { handleRegistration, playersDB } from "../regController";
import { ExtendedWebSocket, TurnMessage } from "@/types/index.d";
import { handleAddUserToRoom, handleCreateRoom, rooms } from "../roomController";
import { addShips, attack, GameSession, gameSessions } from "../gameController";
import shipsBot from "./shipsBot";
import { safeParseJSON } from "@/utils/messageParser";

export const handSinglePlay = (ws: ExtendedWebSocket) => {
  if (!ws.player) return;
  const name = ws.player.name;
  const wsBot = new WebSocket(`ws://localhost:3000`);
  const nameBot = "Bot_" + name;
  const passwordBot = "robot";

  wsBot.on("open", () => {
    const data = {
      name: nameBot,
      password: passwordBot,
    };
    handleRegistration(wsBot, JSON.stringify(data));

    handleCreateRoom(ws);

    const indexBot = playersDB[nameBot].index;

    const room = rooms.filter((room) => room.roomUsers.some((user) => user.index === ws.player?.index));

    handleAddUserToRoom(wsBot, JSON.stringify({ indexRoom: room[0].roomId }));

    const addShipsBot = JSON.stringify({
      gameId: room[0].roomId,
      ships: shipsBot(),
      indexPlayer: indexBot,
    });
    addShips(wsBot, addShipsBot);
  });
};

export function botTurn(ws: ExtendedWebSocket, message: string) {
  const parsedMessage = safeParseJSON<TurnMessage>(message);

  if (!parsedMessage) {
    console.log("Received invalid Message");
    return;
  }

  const { currentPlayer } = parsedMessage;

  if (!currentPlayer) return;

  const botGameSession = findGameSessionByPlayerIndex(currentPlayer);

  if (!botGameSession) return;

  const nameBot = botGameSession.players[currentPlayer].player?.name;

  if (!nameBot) return;

  if (nameBot.startsWith("Bot")) {
    const gameId = botGameSession.idGame;
    const botWS = botGameSession.players[currentPlayer];
    const data = JSON.stringify({
      gameId,
      indexPlayer: currentPlayer,
    });

    setTimeout(() => {
      attack(botWS, data, true);
    }, 1000);
  }
}

function findGameSessionByPlayerIndex(playerIndex: number | string): GameSession | null {
  for (const session of Object.values(gameSessions)) {
    if (session.players[playerIndex]) {
      return session;
    }
  }
  return null;
}

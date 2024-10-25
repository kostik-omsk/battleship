import { CreateGame, ExtendedWebSocket, MessageType, UpdateWinners } from "@/types/index.d";
import sendMessage from "@/utils/sendMessage";
import { randomUUID } from "crypto";

export const winners: UpdateWinners[] = [];

export const updateWinners = (ws: ExtendedWebSocket) => {
  sendMessage<UpdateWinners[]>(ws, MessageType.UpdateWinners, winners);
};

export const createGame = (ws: ExtendedWebSocket) => {
  if (!ws.player) return;

  const game = {
    idGame: randomUUID(),
    idPlayer: ws.player?.index,
  };

  sendMessage<CreateGame>(ws, MessageType.CreateGame, game);
};

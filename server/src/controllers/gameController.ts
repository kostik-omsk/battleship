import { WebSocket } from "ws";
import { MessageType, UpdateWinners } from "@/types/index.d";
import sendMessage from "@/utils/sendMessage";

export const winners: UpdateWinners[] = [];

export const updateWinners = (ws: WebSocket) => {
  sendMessage<UpdateWinners[]>(ws, MessageType.UpdateWinners, winners);
};

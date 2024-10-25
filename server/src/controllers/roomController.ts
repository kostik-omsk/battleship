import { randomUUID } from "crypto";
import { ExtendedWebSocket, MessageType, RoomUser, UpdateRoomMessage } from "@/types/index.d";
import sendMessage from "@/utils/sendMessage";

export const rooms: UpdateRoomMessage[] = [];

export const updateRoom = (ws: ExtendedWebSocket) => {
  sendMessage<UpdateRoomMessage[]>(ws, MessageType.UpdateRoom, rooms);
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

  sendMessage<UpdateRoomMessage[]>(ws, MessageType.UpdateRoom, rooms);
};

import { ExtendedWebSocket, MessageType } from "@/types/index.d";

export default function sendMessage<T>(ws: ExtendedWebSocket, type: MessageType, data: T) {
  const response = {
    type,
    data: JSON.stringify(data),
    id: 0,
  };

  ws.send(JSON.stringify(response));
}

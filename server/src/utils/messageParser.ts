import { GameMessage } from "@/types";

export function parseMessage(message: string): GameMessage {
  const { type, data, id } = JSON.parse(message);
  const dataToParse = typeof data === "string" && data.length > 0 ? JSON.parse(data) : data;

  return {
    type,
    data: dataToParse,
    id: id || 0,
  };
}

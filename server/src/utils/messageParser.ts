// import { GameMessage } from "@/types";

// export function parseMessage(message: string) {
//   const { type, data, id } = JSON.parse(message);
//   const dataToParse = typeof data === "string" && data.length > 0 ? JSON.parse(data) : data;

//   return {
//     type,
//     data: dataToParse,
//     id: id || 0,
//   };
// }

export function safeParseJSON<T>(msg: string): T | null {
  try {
    return JSON.parse(msg);
  } catch (error) {
    console.error("Invalid JSON: ", error);
    return null;
  }
}

import { WebSocket } from "ws";

export enum MessageType {
  Reg = "reg",
  UpdateWinners = "update_winners",
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
  CreateGame = "create_game",
  UpdateRoom = "update_room",
  AddShips = "add_ships",
  StartGame = "start_game",
  Attack = "attack",
  RandomAttack = "randomAttack",
  Turn = "turn",
  Finish = "finish",
}

export interface Player {
  index: number | string;
  wins: number;
}

export interface BaseMessage {
  type: MessageType;
  data: string;
  id: number | string;
}

// Сообщение о регистрации
export interface RegLogMessage {
  name: string;
  password: string;
}

export interface RegCreateMessage {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
}

// // Создание новой комнаты
export interface User {
  password: string;
}
export interface RoomUser {
  name: string;
  index: number | string;
}

export interface UpdateRoomMessage {
  roomId: number | string;
  roomUsers: RoomUser[];
}

export interface UpdateWinners {
  name: string;
  wins: number;
}

export interface ExtendedWebSocket extends WebSocket {
  player?: RoomUser;
}

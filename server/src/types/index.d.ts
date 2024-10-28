import { WebSocket } from "ws";

export enum MessageType {
  Reg = "reg",
  UpdateWinners = "update_winners",
  CreateRoom = "create_room",
  Single = "single_play",
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
  name: string;
  index: number | string;
  wins: number;
}

export interface PlayerWS {
  name: string;
  index: string | number;
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

export interface Room {
  indexRoom: number | string;
}

export interface RoomUser {
  name: string;
  index: number | string;
}

export interface UpdateRoom {
  roomId: number | string;
  roomUsers: RoomUser[];
}

export interface UpdateWinners {
  name: string;
  wins: number;
}

// Создание игры

export interface CreateGame {
  idGame: number | string;
  idPlayer: number | string;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
  // Новые поля
  hits: { x: number; y: number }[];
  isSunk: boolean;
  positions: { x: number; y: number }[];
}

export interface AddShips {
  gameId: number | string;
  ships: Ship[];
  indexPlayer: number | string;
}

export interface StartGame {
  ships: {
    position: {
      x: number;
      y: number;
    };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
  }[];
  currentPlayerIndex: number | string;
}

export interface TurnMessage {
  currentPlayer: number;
}

export interface AttackMessage {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
}

export type AttackStatus = "miss" | "killed" | "shot";

export interface AttackFeedback {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number | string;
  status: AttackStatus;
}

export interface FinishGame {
  winPlayer: number | string;
}
export interface ExtendedWebSocket extends WebSocket {
  player?: RoomUser;
}

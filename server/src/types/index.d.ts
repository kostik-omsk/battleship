export interface BaseMessage {
  id: number | string;
}

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

// Сообщение о регистрации
export interface RegLogMessage extends BaseMessage {
  type: MessageType.Reg;
  data: {
    name: string;
    password: string;
  };
}

export interface RegCreateMessage extends BaseMessage {
  type: MessageType.Reg;
  data: {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
  };
}

export type GameMessage = RegLogMessage;

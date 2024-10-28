import { getAllConnections, getConnections } from "@/services/WebSocketService";
import {
  AddShips,
  AttackFeedback,
  AttackMessage,
  AttackStatus,
  CreateGame,
  ExtendedWebSocket,
  FinishGame,
  MessageType,
  Ship,
  StartGame,
  TurnMessage,
  UpdateRoom,
  UpdateWinners,
} from "@/types/index.d";
import { safeParseJSON } from "@/utils/messageParser";
import sendMessage from "@/utils/sendMessage";
import { getPlayerNameByIndex } from "./regController";
import { updateRoom } from "./roomController";

export interface GameSession {
  playersShips: {
    [playerIndex: number | string]: AddShips["ships"];
  };
  players: {
    [playerIndex: number | string]: ExtendedWebSocket;
  };
  attackedCells: {
    [playerIndex: string | number]: Set<string>;
  };
  idGame: string | number;
}

interface GameSessions {
  [gameId: string | number]: GameSession;
}
const gameSessions: GameSessions = {};

const winners: UpdateWinners[] = [];

let turnPlayers: {
  currentPlayer: number;
};

const updateWinners = () => {
  const connections = getAllConnections();
  connections.forEach((ws) => {
    sendMessage<UpdateWinners[]>(ws, MessageType.UpdateWinners, winners);
  });
};

const createGame = (ws: ExtendedWebSocket, gameId: string | number) => {
  if (!ws.player) return;

  const game = {
    idGame: gameId,
    idPlayer: ws.player.index,
  };

  sendMessage<CreateGame>(ws, MessageType.CreateGame, game);
};

const createGameForPlayers = (room: UpdateRoom) => {
  const [player1, player2] = room.roomUsers;
  const player1Ws = getConnections(player1);
  const player2Ws = getConnections(player2);
  const gameId = room.roomId;

  createGame(player1Ws, gameId);
  createGame(player2Ws, gameId);
};

const sendTurnInfo = (wsArray: ExtendedWebSocket[], currentPlayerId: number | string) => {
  const turnData: TurnMessage = {
    currentPlayer: Number(currentPlayerId),
  };

  turnPlayers = turnData;
  wsArray.forEach((ws) => sendMessage<TurnMessage>(ws, MessageType.Turn, turnData));
};

const addShips = (ws: ExtendedWebSocket, data: string) => {
  const parsedData = safeParseJSON<AddShips>(data);
  if (!parsedData) return console.log("Received invalid data");

  const { gameId, ships, indexPlayer } = parsedData;
  if (!gameId || !ships || indexPlayer === undefined) return console.log("Invalid data");

  if (!gameSessions[gameId]) {
    gameSessions[gameId] = { playersShips: {}, players: {}, attackedCells: {}, idGame: gameId };
  }

  gameSessions[gameId].playersShips[indexPlayer] = ships;
  gameSessions[gameId].players[indexPlayer] = ws;

  if (Object.keys(gameSessions[gameId].playersShips).length === 2) {
    startGameSession(gameId);
  }

  console.log(`Player ${getPlayerNameByIndex(+indexPlayer)} added ships`);
};

const startGameSession = (gameId: string | number) => {
  const { players, playersShips } = gameSessions[gameId] ?? {};
  if (!players || !playersShips) return;

  gameSessions[gameId].attackedCells = {
    [Object.keys(players)[0]]: new Set(),
    [Object.keys(players)[1]]: new Set(),
  };

  const [player1Index, player2Index] = Object.keys(players);

  initializeShips(gameSessions[gameId].playersShips[player1Index]);
  initializeShips(gameSessions[gameId].playersShips[player2Index]);

  sendMessage<StartGame>(players[player1Index], MessageType.StartGame, {
    ships: playersShips[player1Index],
    currentPlayerIndex: player1Index,
  });
  sendMessage<StartGame>(players[player2Index], MessageType.StartGame, {
    ships: playersShips[player2Index],
    currentPlayerIndex: player2Index,
  });

  sendTurnInfo([players[player1Index], players[player2Index]], player1Index);

  console.log(`Game ${gameId} started`);
};

function initializeShips(ships: Ship[]) {
  ships.forEach((ship) => {
    ship.hits = [];
    ship.isSunk = false;
    ship.positions = [];

    for (let i = 0; i < ship.length; i++) {
      const x = ship.position.x + (ship.direction ? 0 : i);
      const y = ship.position.y + (ship.direction ? i : 0);
      ship.positions.push({ x, y });
    }
  });
  return ships;
}

const generateRandomCoordinates = (attackedCells: Set<string>): { x: number; y: number } => {
  let x, y, cellKey;
  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    cellKey = `${x},${y}`;
  } while (attackedCells.has(cellKey));

  return { x, y };
};

const attack = (ws: ExtendedWebSocket, data: string, isRandomAttack = false) => {
  const parsedData = safeParseJSON<AttackMessage>(data);
  if (!parsedData) return console.log("Received invalid data");

  const { gameId, indexPlayer } = parsedData;
  let { x, y } = parsedData;
  if (turnPlayers.currentPlayer !== indexPlayer) {
    return;
  }
  const gameSession = gameSessions[gameId];
  if (!gameSession) return;

  const attackedCells = gameSession.attackedCells[indexPlayer];

  if (isRandomAttack) {
    const randomCoords = generateRandomCoordinates(attackedCells);
    x = randomCoords.x;
    y = randomCoords.y;
  }

  const cellKey = `${x},${y}`;
  if (attackedCells.has(cellKey)) {
    console.log("Cell already attacked:", cellKey);
    return;
  }

  attackedCells.add(cellKey);

  //Оппонент
  const opponentIndex = Object.keys(gameSession.players).find((key) => key !== indexPlayer.toString());
  if (!opponentIndex) return;
  //корабли опонента
  const opponentShips = gameSession.playersShips[opponentIndex];

  const attackStatus = hit(opponentShips, x, y, indexPlayer, gameSession);

  const feedbackData: AttackFeedback = {
    position: { x, y },
    currentPlayer: indexPlayer,
    status: attackStatus,
  };

  if (attackStatus === "killed") {
    if (opponentShips.every((ship) => ship.isSunk)) {
      endGame(ws, gameSession.players[opponentIndex], indexPlayer, gameId);
    } else {
      sendTurnInfo([ws, gameSession.players[opponentIndex]], indexPlayer);
    }
  } else if (attackStatus === "shot") {
    sendTurnInfo([ws, gameSession.players[opponentIndex]], indexPlayer);
  } else {
    sendTurnInfo([ws, gameSession.players[opponentIndex]], opponentIndex);
  }

  sendMessage<AttackFeedback>(ws, MessageType.Attack, feedbackData);
  sendMessage<AttackFeedback>(gameSession.players[opponentIndex], MessageType.Attack, feedbackData);

  console.log(`Player ${getPlayerNameByIndex(indexPlayer)} attacked x: ${x}, y: ${y}, status: ${attackStatus}`);
};

const endGame = (
  ws: ExtendedWebSocket,
  opponentWs: ExtendedWebSocket,
  indexPlayer: number,
  gameId: string | number | null,
) => {
  const name = getPlayerNameByIndex(indexPlayer);
  if (!name) return;

  let winner = winners.find((winner) => winner.name === name);
  if (winner) {
    winner.wins++;
  } else {
    winners.push({ name, wins: 1 });
  }

  sendMessage<FinishGame>(ws, MessageType.Finish, { winPlayer: indexPlayer });
  sendMessage<FinishGame>(opponentWs, MessageType.Finish, { winPlayer: indexPlayer });

  updateWinners();
  updateRoom();
  if (gameId) {
    delete gameSessions[gameId];
  }

  console.log(`Game ${gameId} ended, winner: ${name}`);
};

function hit(
  ships: Ship[],
  x: number,
  y: number,
  currentPlayerIndex: string | number,
  gameSession: GameSession,
): AttackStatus {
  for (const ship of ships) {
    if (ship.isSunk) continue;
    for (const pos of ship.positions) {
      if (pos.x === x && pos.y === y) {
        ship.hits.push({ x, y });
        if (ship.hits.length === ship.length) {
          ship.isSunk = true;
          markSurroundingCells(ship, currentPlayerIndex, gameSession);
          return "killed";
        }
        return "shot";
      }
    }
  }
  return "miss";
}

function markSurroundingCells(ship: Ship, currentPlayerIndex: number | string, gameSession: GameSession) {
  const surroundingCells = new Set();
  const shipCells = new Set<string>(ship.positions.map(({ x, y }) => `${x},${y}`));

  ship.positions.forEach(({ x, y }) => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellX = x + dx;
        const cellY = y + dy;

        if (cellX < 0 || cellX >= 10 || cellY < 0 || cellY >= 10) continue;

        surroundingCells.add(`${cellX},${cellY}`);
      }
    }
  });

  const opponentIndex = Object.keys(gameSession.players).find((key) => key !== currentPlayerIndex.toString());
  if (!opponentIndex) return;

  const attackedCells = gameSession.attackedCells[currentPlayerIndex];

  surroundingCells.forEach((cell) => {
    const [cellX, cellY] = (cell as string).split(",").map(Number);

    const cellKey = `${cellX},${cellY}`;
    if (!attackedCells.has(cellKey)) {
      attackedCells.add(cellKey);
    }

    let attackStatus = "miss" as AttackStatus;
    if (shipCells.has(`${cellX},${cellY}`)) {
      attackStatus = "killed";
    }

    const feedbackData: AttackFeedback = {
      position: { x: cellX, y: cellY },
      currentPlayer: currentPlayerIndex,
      status: attackStatus,
    };

    sendMessage<AttackFeedback>(gameSession.players[currentPlayerIndex], MessageType.Attack, feedbackData);
    sendMessage<AttackFeedback>(gameSession.players[opponentIndex], MessageType.Attack, feedbackData);
  });
}

export { attack, addShips, createGameForPlayers, createGame, updateWinners, winners, gameSessions, endGame };

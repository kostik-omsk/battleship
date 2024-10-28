import { ExtendedWebSocket, PlayerWS } from "@/types/index.d";

interface WSConnection {
  [playerId: string | number]: ExtendedWebSocket;
}

const wsConnections: WSConnection = {};

export const addConnection = (ws: ExtendedWebSocket, player: PlayerWS) => {
  wsConnections[player.index] = ws;
};

export const removeConnection = (ws: ExtendedWebSocket, player: PlayerWS) => {
  delete wsConnections[player.index];
};

export const getConnections = (player: PlayerWS) => wsConnections[player.index];

export const getAllConnections = () => Object.values(wsConnections);

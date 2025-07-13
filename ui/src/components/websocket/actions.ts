import { ws } from "./handler";
import {
  BroadcastMessageData,
  JoinRoomData,
  LeaveRoomData,
  NewRoomData,
  RequestEvents,
  UpdatePositionData,
  UpdateTyping,
} from "./types";

const sendJSON = (payload: any) => ws?.send(JSON.stringify(payload));

export const newRoom = async (data: NewRoomData) => {
  const payload = {
    Event: RequestEvents.CreateRoom,
    Data: data,
  };

  sendJSON(payload);
};

export const joinRoom = async (data: JoinRoomData) => {
  const payload = {
    Event: RequestEvents.JoinRoom,
    Data: data,
  };

  sendJSON(payload);
};

export const broadcastMessage = (data: BroadcastMessageData) => {
  const payload = {
    Event: RequestEvents.BroadcastMessage,
    Data: data,
  };

  sendJSON(payload);
};

export const leaveRoom = (data: LeaveRoomData) => {
  const payload = {
    Event: RequestEvents.LeaveRoom,
    Data: data,
  };

  sendJSON(payload);
  ws?.close();
};

export const updateTyping = (
  roomId: string,
  userId: string,
  isTyping: boolean
) => {
  const payload: {
    Event: string;
    Data: UpdateTyping;
  } = {
    Event: RequestEvents.UpdateTyping,
    Data: {
      roomId,
      userId,
      isTyping,
    },
  };

  sendJSON(payload);
};

export const updatePosition = (
  roomId: string,
  userId: string,
  x: number,
  y: number
) => {
  const payload: {
    Event: string;
    Data: UpdatePositionData;
  } = {
    Event: RequestEvents.UpdatePosition,
    Data: {
      dest: `${x},${y}`,
      roomId,
      userId,
    },
  };

  sendJSON(payload);
};
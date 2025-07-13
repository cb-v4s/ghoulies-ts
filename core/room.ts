import { randomInt } from "crypto";
import { BroadcastToRoomFunction, PopularRoom, Position, Room, Todo, User } from "./types";
import { DefaultDirection, frontLeft, gridSize, speedUserMov } from "./constants";
import { findPath } from "./lib/pathfinding";
import { getFacingDirection, sleep } from "./lib/utils";

export class RoomHandler {
  rooms: Room[];

  constructor() {
    this.rooms = [];

    this.rooms.push({
      roomId: "keep the block hot#334288",
      roomName: "keep the block hot",
      users: [],
      usersPositions: [],
      isProtected: false,
      Password: '',
    });
  }

  getRandomEmptyPosition(usersPositions: string[]): Position {
    let position: Position;

    for (;;) {
      position = {
        Row: randomInt(10),
        Col: randomInt(10),
      };

      const newPosition = `${position.Row},${position.Col}`;
      if (!usersPositions.includes(newPosition)) return position;
    }
  }

  async joinRoom(
    connectionId: string,
    roomId: string,
    userName: string,
    password: string
  ): Promise<Todo> {
    try {
      const roomIdx = await this.rooms.findIndex(
        (room) => room.roomId === roomId
      );

      if (roomIdx === -1) throw "Room doesnt exist";

      // if (password !== this.rooms[roomIdx].Password) throw new Error("invalid password")

      const newPosition = this.getRandomEmptyPosition(
        this.rooms[roomIdx].usersPositions
      );
      const newUser: User = {
        UserName: userName,
        UserID: connectionId,
        RoomID: roomId,
        Position: newPosition,
        Direction: DefaultDirection,
        IsTyping: false,
      };

      this.rooms[roomIdx].usersPositions.push(
        `${newPosition.Row}, ${newPosition.Col}`
      );
      this.rooms[roomIdx].users.push(newUser);

      return { users: this.rooms[roomIdx].users };
    } catch (error) {
      console.error("error from joinRoom", error);
      throw error;
    }
  }

  leaveRoom(connectionId: string, roomId: string): Todo {
    console.log(
      `Attempting to remove user ${connectionId} from room ${roomId}`
    );

    const roomIdx = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIdx === -1) {
      console.warn(`Attempted to leave non-existent room: ${roomId}`);
      throw new Error(`Room '${roomId}' not found for leaving.`);
    }

    const room = this.rooms[roomIdx];
    const userToLeave = room.users.find((user) => user.UserID === connectionId);

    room.users = room.users.filter((user) => user.UserID !== connectionId);

    if (userToLeave) {
      const posString = `${userToLeave.Position.Row},${userToLeave.Position.Col}`;
      const posIndex = room.usersPositions.indexOf(posString);
      if (posIndex > -1) {
        room.usersPositions.splice(posIndex, 1);
        console.log(`Removed position ${posString} for user ${connectionId}.`);
      } else {
        console.warn(
          `Position ${posString} not found for user ${connectionId} in room ${roomId}'s positions array.`
        );
      }
    } else {
      console.warn(
        `User ${connectionId} not found in room ${roomId}'s user list.`
      );
    }

    console.log(
      `User ${connectionId} left room ${roomId}. Updated user count: ${room.users.length}`
    );

    return { users: room.users };
  }

  NewRoom(userId: string, roomName: string, userName: string, password: string): any {
    // TODO: you must check if the roomId already exist but yolo
    const generateRoomId = (roomName: string) => {
      const pf = Math.floor(1000 + Math.random() * 9000)

      return `${roomName}#${pf}`
    }

    const newRoomId = generateRoomId(roomName)
    const defaultPosition = {
        Row: 0,
        Col: 0
      }
    const defaultPositionStr = '0,0'

    const newUser: User = {
      UserName: userName,
      UserID: userId,
      RoomID: newRoomId,
      Position: defaultPosition,
      Direction: frontLeft,
      IsTyping: false
    }

    const newRoom: Room = {
      roomId: newRoomId,
      roomName,
      users: [newUser],
      usersPositions: [defaultPositionStr],
      isProtected: password?.length ? true : false,
      Password: password,
    }

    this.rooms.push(newRoom);

    return { userId, roomId: newRoomId, users: newRoom.users };
  }

  getPopularRooms(): PopularRoom[] {
    const roomsLimit = 10;
    const popularRooms: PopularRoom[] = [];
    this.rooms.slice(0, roomsLimit).forEach((room: Room) => {
      popularRooms.push({
        roomId: room.roomId,
        roomName: room.roomName,
        totalConns: room.users.length,
        isProtected: room.isProtected,
      });
    });

    return popularRooms;
  }

  UpdateUserTyping(roomId: string, userId: string, IsTyping: boolean): Todo {
    const roomIdx = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIdx === -1) {
      console.warn(`Attempted to find non-existent room: ${roomId}`);
      throw new Error(`Room '${roomId}' not found.`);
    }

    const room = this.rooms[roomIdx];
    const userIdx = room.users.findIndex((user) => user.UserID === userId);
    if (userIdx === -1) {
      console.warn(`Attempted to find non-existent user: ${roomId}`);
      throw new Error(`User '${userId}' not found.`);
    }

    room.users[userIdx].IsTyping = IsTyping;

    return { users: room.users };
  }

  GetUsernameById(roomId: string, userId: string): Todo {
    const roomIdx = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIdx === -1) {
      console.warn(`Attempted to find non-existent room: ${roomId}`);
      throw new Error(`Room '${roomId}' not found.`);
    }

    const room = this.rooms[roomIdx];
    const userIdx = room.users.findIndex((user) => user.UserID === userId);
    if (userIdx === -1) {
      console.warn(`Attempted to find non-existent user: ${roomId}`);
      throw new Error(`User '${userId}' not found.`);
    }

    const username = room.users[userIdx].UserName;

    return { username };
  }

  async UpdatePosition(roomId: string, userId: string, dest: string, broadcastToRoom: BroadcastToRoomFunction): Promise<void> {
    const roomIdx = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIdx === -1) {
      console.warn(`Attempted to find non-existent room: ${roomId}`);
      throw new Error(`Room '${roomId}' not found.`);
    }

    const room = this.rooms[roomIdx];
    const userIdx = room.users.findIndex((user: any) => user.UserID === userId);
    if (userIdx === -1) {
      console.warn(`Attempted to find non-existent user: ${userId} in room ${roomId}`);
      throw new Error(`User '${userId}' not found in room '${roomId}'.`);
    }

    const user = room.users[userIdx];
    let currentPosition = { ...user.Position };

    const destinationPosition: [number, number] = dest.split(',').map(Number) as [number, number];

    const positions = findPath(currentPosition.Row, currentPosition.Col, destinationPosition[0], destinationPosition[1], gridSize, room.usersPositions);

    if (positions.length === 0 && (currentPosition.Row !== destinationPosition[0] || currentPosition.Col !== destinationPosition[1])) {
        console.warn(`No path found for user ${userId} from ${JSON.stringify(currentPosition)} to ${dest}`);
        return;
    }

    for (const position of positions) {
      const oldPositionStr = `${user.Position.Row},${user.Position.Col}`;
      const newPositionStr = `${position.row},${position.col}`;

      // Remove old position from usersPositions before updating
      // Ensure you're filtering correctly to remove only ONE instance if duplicates are possible
      const oldPosIndex = room.usersPositions.indexOf(oldPositionStr);
      if (oldPosIndex > -1) {
        room.usersPositions.splice(oldPosIndex, 1);
      }

      // Update User's Position
      const previousUserPosition = { ...user.Position };
      user.Position = {
        Row: position.row,
        Col: position.col
      };

      user.Direction = getFacingDirection(previousUserPosition, user.Position);

      room.usersPositions.push(newPositionStr);

      broadcastToRoom(roomId, 'updateUser', { // Use a specific event name
        user
      });

      await sleep(speedUserMov);
    }
  }
}

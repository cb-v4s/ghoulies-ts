export type Todo = any
export type FacingDirection = -1 | 1 | 0 | 2
export type Position = {
    Row: number
    Col: number
}
export type PopularRoom = {
    roomId: string;
    roomName: string;
    totalConns: number;
    isProtected: boolean;
}
export type User = {
  UserName: string;
  UserID: string;
  RoomID: string; // e.g. keep the block hot#334288
  Position: Position;
  Direction: FacingDirection;
  IsTyping: boolean;
};

export type Room = {
  roomId: string;
  roomName: string;
  users: User[];
  usersPositions: string[]
  isProtected: boolean;
  Password: string;
};
export type BroadcastToRoomFunction = (roomId: string, eventName: string, data: any) => void;
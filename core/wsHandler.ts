import { WebSocket, WebSocketServer } from "ws";
import { RoomHandler } from "./room";
import { Todo } from "./types";
import { randomUUID } from "crypto";

export let roomHdl: Todo = new RoomHandler();

interface CustomWebSocket extends WebSocket {
  id: string;
  roomId?: string; // To track which room the user is in
}

export const setupWebSocketHandler = (wss: WebSocketServer) => {

  const broadcastToRoom = (roomId: string, eventName: string, data: any) => {
    const message = JSON.stringify({ Event: eventName, Data: data });

    // @ts-ignore
    wss.clients.forEach((client: CustomWebSocket) => {
      if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
        client.send(message);
      }
    });
  };

  const broadcastAll = (eventName: string, data: any) => {
    const message = JSON.stringify({ Event: eventName, Data: data });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  };

  wss.on("connection", (ws: WebSocket) => {
    const connectionId = randomUUID(); // used as userId
    (ws as CustomWebSocket).id = connectionId;

    console.log("Client connected to WebSocket.");

    ws.on("message", async (message: Buffer) => {
      const { Event, Data } = JSON.parse(message.toString());

      switch (Event) {
        case "joinRoom": {
          const { roomId, userName, password } = Data;

          try {
            const { users } = await roomHdl.joinRoom(
              connectionId,
              roomId,
              userName,
              password
            );

            // Set the roomId for the connected client
            (ws as CustomWebSocket).roomId = roomId;

            // Broadcast to the specific room when a user joins
            broadcastToRoom(roomId, "updateScene", { roomId, users });
            // Send join success only to the joining client
            ws.send(JSON.stringify({ Event: "joinRoomSuccess", Data: { userId: connectionId } }));
            return
          } catch (error) {
            console.error(error);
          }

          return;
        }

        case 'updateTyping': {
          const { roomId, isTyping } = Data;
          const { users } = await roomHdl.UpdateUserTyping(roomId, connectionId, isTyping);

          try {
            broadcastToRoom(roomId, "updateScene", { roomId, users });
          } catch (error) {
            console.error(error);
          }

          return
        }

        case 'broadcastMessage': {
          const { roomId, msg } = Data;

          const { username } = roomHdl.GetUsernameById(roomId, connectionId);

          try {
            broadcastToRoom(roomId, 'broadcastMessage', { msg, from: username });
          } catch (error) {
            console.error(error);
          }

          return; // Add return to exit switch
        }

        case 'updatePosition': {
          const { dest, roomId } = Data // dest: '7,9', ...

          try {
            roomHdl.UpdatePosition(roomId, connectionId, dest, broadcastToRoom);
          } catch (error) {
            console.error(error)
          }
          // Pass the broadcastToRoom function to UpdatePosition
          return
        }

        case "newRoom": {
          const { roomName, userName, password } = Data;
          
          const { userId, roomId, users } = roomHdl.NewRoom(connectionId, roomName, userName, password);

          (ws as CustomWebSocket).roomId = roomId;

          try {
            broadcastToRoom(roomId, 'updateScene', { roomId, users })
            ws.send(JSON.stringify({ Event: "joinRoomSuccess", Data: { userId } }));
          } catch (error) {
            console.error(error)
          }
          
          return
        }

        default:
          return;
      }
    });

    // Event listener for when the client connection is closed
    ws.on('close', () => {
      console.log(`Client disconnected from WebSocket. ID: ${connectionId}`);

      const currentRoomId = (ws as CustomWebSocket).roomId;
      if (currentRoomId) {
        try {
          const { users } = roomHdl.leaveRoom(connectionId, currentRoomId);
          // Broadcast to the room that a user has left and scene updated
          broadcastToRoom(currentRoomId, "updateScene", { roomId: currentRoomId, users });
        } catch (error: any) {
          console.error(`Error handling user leave for client ID ${connectionId} from room ${currentRoomId}:`, error.message || error);
        }
      } else {
        console.log(`Client ID ${connectionId} disconnected but was not in a tracked room.`);
      }
    });

    // Event listener for errors
    ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });
  });
};
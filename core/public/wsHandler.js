"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketHandler = exports.roomHdl = void 0;
const ws_1 = require("ws");
const room_1 = require("./room");
const crypto_1 = require("crypto");
exports.roomHdl = new room_1.RoomHandler();
const setupWebSocketHandler = (wss) => {
    const broadcastToRoom = (roomId, eventName, data) => {
        const message = JSON.stringify({ Event: eventName, Data: data });
        // @ts-ignore
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN && client.roomId === roomId) {
                client.send(message);
            }
        });
    };
    const broadcastAll = (eventName, data) => {
        const message = JSON.stringify({ Event: eventName, Data: data });
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN)
                client.send(message);
        });
    };
    wss.on("connection", (ws) => {
        const connectionId = (0, crypto_1.randomUUID)(); // used as userId
        ws.id = connectionId;
        console.log("Client connected to WebSocket.");
        ws.on("message", async (message) => {
            const { Event, Data } = JSON.parse(message.toString());
            switch (Event) {
                case "joinRoom": {
                    const { roomId, userName, password } = Data;
                    try {
                        const { users } = await exports.roomHdl.joinRoom(connectionId, roomId, userName, password);
                        // Set the roomId for the connected client
                        ws.roomId = roomId;
                        // Broadcast to the specific room when a user joins
                        broadcastToRoom(roomId, "updateScene", { roomId, users });
                        // Send join success only to the joining client
                        ws.send(JSON.stringify({ Event: "joinRoomSuccess", Data: { userId: connectionId } }));
                        return;
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return;
                }
                case 'updateTyping': {
                    const { roomId, isTyping } = Data;
                    const { users } = await exports.roomHdl.UpdateUserTyping(roomId, connectionId, isTyping);
                    try {
                        broadcastToRoom(roomId, "updateScene", { roomId, users });
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return;
                }
                case 'broadcastMessage': {
                    const { roomId, msg } = Data;
                    const { username } = exports.roomHdl.GetUsernameById(roomId, connectionId);
                    try {
                        broadcastToRoom(roomId, 'broadcastMessage', { msg, from: username });
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return; // Add return to exit switch
                }
                case 'updatePosition': {
                    const { dest, roomId } = Data; // dest: '7,9', ...
                    try {
                        exports.roomHdl.UpdatePosition(roomId, connectionId, dest, broadcastToRoom);
                    }
                    catch (error) {
                        console.error(error);
                    }
                    // Pass the broadcastToRoom function to UpdatePosition
                    return;
                }
                case "newRoom": {
                    const { roomName, userName, password } = Data;
                    const { userId, roomId, users } = exports.roomHdl.NewRoom(connectionId, roomName, userName, password);
                    ws.roomId = roomId;
                    try {
                        broadcastToRoom(roomId, 'updateScene', { roomId, users });
                        ws.send(JSON.stringify({ Event: "joinRoomSuccess", Data: { userId } }));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return;
                }
                default:
                    return;
            }
        });
        // Event listener for when the client connection is closed
        ws.on('close', () => {
            console.log(`Client disconnected from WebSocket. ID: ${connectionId}`);
            const currentRoomId = ws.roomId;
            if (currentRoomId) {
                try {
                    const { users } = exports.roomHdl.leaveRoom(connectionId, currentRoomId);
                    // Broadcast to the room that a user has left and scene updated
                    broadcastToRoom(currentRoomId, "updateScene", { roomId: currentRoomId, users });
                }
                catch (error) {
                    console.error(`Error handling user leave for client ID ${connectionId} from room ${currentRoomId}:`, error.message || error);
                }
            }
            else {
                console.log(`Client ID ${connectionId} disconnected but was not in a tracked room.`);
            }
        });
        // Event listener for errors
        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });
};
exports.setupWebSocketHandler = setupWebSocketHandler;

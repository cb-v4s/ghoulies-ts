"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const wsHandler_1 = require("./wsHandler");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const wsHandler_2 = require("./wsHandler");
const app = (0, express_1.default)();
const port = 8000;
const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true, // <--- ADD THIS LINE to allow credentials
};
app.use((0, cors_1.default)(corsOptions));
app.get('/rooms', (req, res) => {
    res.json({ rooms: wsHandler_2.roomHdl.getPopularRooms() });
});
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
(0, wsHandler_1.setupWebSocketHandler)(wss);
server.listen(port, () => {
    console.log(`HTTP server listening on http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:${port}`);
});

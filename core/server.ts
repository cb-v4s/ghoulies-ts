import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWebSocketHandler } from "./wsHandler"
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

import { roomHdl } from "./wsHandler";

const app = express();
const port = 8000;

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true, // <--- ADD THIS LINE to allow credentials
};
app.use(cors(corsOptions));

app.get('/rooms', (req: express.Request, res: express.Response) => {
  res.json({ rooms: roomHdl.getPopularRooms() });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

setupWebSocketHandler(wss);

server.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
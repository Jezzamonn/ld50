import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ServerGame } from './server-game';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // Allow local host CORS stuff
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let game: ServerGame | undefined;
let simulatedTimeMs: number | undefined;
let fixedTimeStep = 1 / 60;

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!');
});

io.on('connection', (socket: any) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});

// Game loop
function handleFrame() {
    if (game == null) {
        return;
    }
    if (simulatedTimeMs === undefined) {
        simulatedTimeMs = Date.now();
    }

    let currentTimeMs = Date.now();
    while (currentTimeMs > simulatedTimeMs) {
        game.update(fixedTimeStep);
        simulatedTimeMs += fixedTimeStep * 1000;
    }

    setImmediate(handleFrame);
}
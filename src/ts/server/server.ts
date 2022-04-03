import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { seededRandom } from '../common/util';
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
const rng = seededRandom("aaflafskjlasfdlasjwf");

const updatePeriodMs = 1000 / 20;

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!');
});

io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    if (game == undefined) {
        game = new ServerGame(rng);
        handleFrame(game);
    }
    // To start with just send the initial state.
    socket.emit('update', game.getEntitiesAsObjects());

    socket.on('update', (entities: any) => {
        game?.updateEntitiesFromClient(entities);
    });

    socket.on('reset', () => {
        console.log('Resetting game');
        game = new ServerGame(rng);
        handleFrame(game);
        io.emit('reset');
    })
});

setInterval(() => {
    if (game == undefined) {
        return;
    }
    io.emit('update', game.getEntitiesAsObjects());
}, updatePeriodMs)

server.listen(3000, () => {
    console.log('Listening on port 3000');
});

// Game loop
function handleFrame(loopGame: ServerGame) {
    if (loopGame != game) {
        return;
    }
    if (simulatedTimeMs === undefined) {
        simulatedTimeMs = Date.now();
    }

    let currentTimeMs = Date.now();
    while (currentTimeMs > simulatedTimeMs) {
        loopGame.update(fixedTimeStep);
        simulatedTimeMs += fixedTimeStep * 1000;
    }

    setImmediate(() => handleFrame(loopGame));
}
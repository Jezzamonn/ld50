import { Aseprite } from "../common/aseprite-js";
import { KeyboardKeys, RegularKeys } from "../common/keys";
import { seededRandom } from "../common/util";
import { ClientGame } from "./game/client-game";
import { io, Socket } from 'socket.io-client';

let game: ClientGame;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let simulatedTimeMs: number;
const fixedTimeStep = 1 / 60;

let lastUpdatedMs: number;
const serverUpdatePeriodMs = 1000 / 20;

let socket: Socket;

function init() {
    canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    Aseprite.disableSmoothing(context);

    const keys = new KeyboardKeys();
    const rng = seededRandom("aaflafskjlasfdlasjwf");

    ClientGame.loadAllImages();

    game = new ClientGame(keys, rng);
    keys.setUp();

    socket = io('http://localhost:3000');
    socket.on('connect', () => {
        console.log('Connected to server');

        socket.emit('update', game.getServerUpdateData());
    });

    socket.on('update', (entities: any) => {
        game.updateEntitiesFromServer(entities);
    });

    handleFrame();
}

function handleFrame() {
    if (simulatedTimeMs === undefined) {
        simulatedTimeMs = Date.now();
    }

    let currentTimeMs = Date.now();
    const maxSteps = 10;
    let steps = 0;
    while (currentTimeMs > simulatedTimeMs) {
        if (steps >= maxSteps) {
            simulatedTimeMs = currentTimeMs;
            break;
        }
        game.update(fixedTimeStep);
        simulatedTimeMs += fixedTimeStep * 1000;
        steps++;
    }

    if (lastUpdatedMs === undefined || currentTimeMs - lastUpdatedMs > serverUpdatePeriodMs) {
        lastUpdatedMs = currentTimeMs;
        socket.emit('update', game.getServerUpdateData());
    }

    game.render(context);

    requestAnimationFrame(handleFrame);
}

window.onload = init;
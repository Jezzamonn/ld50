import { Aseprite } from "../common/aseprite-js";
import { KeyboardKeys, RegularKeys } from "../common/keys";
import { seededRandom } from "../common/util";
import { ClientGame } from "./game/client-game";
import { io } from 'socket.io-client';

let game: ClientGame;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let simulatedTimeMs: number;
const fixedTimeStep = 1 / 60;

function init() {
    canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    Aseprite.disableSmoothing(context);

    const keys = new KeyboardKeys();
    const rng = seededRandom("aaflafskjlasfdlasjwf");

    ClientGame.loadAllImages();

    game = new ClientGame(keys, rng);
    keys.setUp();

    handleFrame();

    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
        console.log('Connected to server');
    });
}

function handleFrame() {
    if (simulatedTimeMs === undefined) {
        simulatedTimeMs = Date.now();
    }

    let currentTimeMs = Date.now();
    while (currentTimeMs > simulatedTimeMs) {
        game.update(fixedTimeStep);
        simulatedTimeMs += fixedTimeStep * 1000;
    }

    game.render(context);

    requestAnimationFrame(handleFrame);
}

window.onload = init;
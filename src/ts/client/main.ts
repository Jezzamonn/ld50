import { Aseprite } from "../common/aseprite-js";
import { KeyboardKeys, RegularKeys } from "../common/keys";
import { seededRandom } from "../common/util";
import { ClientGame } from "./game/client-game";
import { io, Socket } from 'socket.io-client';
import { Sounds } from "../common/sounds";
import { ACTION_KEYS, MUTE_KEYS } from "../common/common";

let gameState = 'title';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let keys: RegularKeys;
let rng: () => number;
let game: ClientGame;

let simulatedTimeMs: number;
const fixedTimeStep = 1 / 60;

let lastUpdatedMs: number;
const serverUpdatePeriodMs = 1000 / 20;

let socket: Socket;

function init() {
    canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    Aseprite.disableSmoothing(context);

    keys = new KeyboardKeys();
    keys.setUp();
    rng = seededRandom("qwrjafdskafsd;lkas;afek;");

    ClientGame.loadAllImages();
    ClientGame.loadAllSounds();

    Sounds.loadMuteState();

    Sounds.setSong('main');

    document.addEventListener('keydown', (evt) => {
        if (MUTE_KEYS.includes(evt.code)) {
            Sounds.toggleMute();
        }

        if (ACTION_KEYS.includes(evt.code)) {
            if (gameState === 'title') {
                showInstructions();
            }
            else if (gameState === 'instructions') {
                showInstructions2();
            }
            else if (gameState === 'instructions2') {
                startGame();
            }
        }
    });
}

function updateWhichElementsAreVisible() {
    document.querySelector('.game')!.classList.toggle('hidden', gameState !== 'game');
    document.querySelector('.title')!.classList.toggle('hidden', gameState !== 'title');
    document.querySelector('.instructions')!.classList.toggle('hidden', gameState !== 'instructions');
    document.querySelector('.instructions2')!.classList.toggle('hidden', gameState !== 'instructions2');
}

function showInstructions() {
    gameState = 'instructions';
    updateWhichElementsAreVisible();
}
function showInstructions2() {
    gameState = 'instructions2';
    updateWhichElementsAreVisible();
}

function startGame() {
    gameState = 'game';
    updateWhichElementsAreVisible();

    game = new ClientGame(keys, rng);
    game.resetFn = () => reset();

    socket = io('http://localhost:3000');
    socket.on('connect', () => {
        console.log('Connected to server');

        socket.emit('update', game.getServerUpdateData());
    });

    socket.on('update', (entities: any) => {
        game.updateEntitiesFromServer(entities);
    });

    socket.on('reset', () => {
        console.log('Resetting game');
        game = new ClientGame(keys, rng);
        game.resetFn = () => reset();

        Sounds.playSound('restart', { volume: 0.5 });
    });

    handleFrame();
}

function reset() {
    socket.emit('reset');
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
import { Game } from "./game/game";

let game: Game;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let simulatedTimeMs: number;
const fixedTimeStep = 1 / 60;

function init() {
    game = new Game();
    canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;

    handleFrame();
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
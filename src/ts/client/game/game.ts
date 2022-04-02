import { rgb } from "../../common/util";

export class Game {
    update(dt: number) {
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = rgb(0, 0, 100 * Math.random());
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
}
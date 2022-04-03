import { Point } from "../../common";
import { leftPad, secondsToFullTimeString } from "../../util";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

let timerElement: HTMLElement | null = null;

// Really hacky way to send the timer down from the server but also have it be pretty synced.
export class Timer extends Entity {

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = 0;
        this.height = 0;
        this.type = 'timer';

        if (!game.isServer && !timerElement) {
            timerElement = document.querySelector('.timer-span');
        }
    }

    canRender(screenCenter: Point): boolean {
        return true;
    }

    render(context: CanvasRenderingContext2D): void {
        if (!timerElement) {
            return;
        }

        const timeText = secondsToFullTimeString(this.animCount);
        if (timerElement.innerText != timeText) {
            timerElement.innerText = timeText;
        }
    }

    toObject() {
        return {
            ...super.toObject(),
            animCount: this.animCount,
        };
    }

    updateFromObject(obj: any, smooth = false) {
        super.updateFromObject(obj, smooth);
        this.animCount = obj.animCount;
    }

    update(dt: number): void {
        if (this.game.gameOver) {
            return;
        }
        this.animCount += dt;
    }
}
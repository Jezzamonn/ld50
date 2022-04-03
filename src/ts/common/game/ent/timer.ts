import { leftPad } from "../../util";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

let timerElement: HTMLParagraphElement | null = null;

const secondsPerMinute = 60;
const minutesPerHour = 60;

// Really hacky way to send the timer down from the server but also have it be pretty synced.
export class Timer extends Entity {

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = 0;
        this.height = 0;
        this.type = 'timer';

        if (!game.isServer && !timerElement) {
            timerElement = document.querySelector('.timer');
        }
    }

    render(context: CanvasRenderingContext2D): void {
        if (!timerElement) {
            return;
        }

        const timeText = this.getTimeString();
        if (timerElement.innerText != timeText) {
            timerElement.innerText = timeText;
        }
    }

    getTimeString(): string {
        const deciSeconds = Math.floor((this.animCount * 10) % 10);
        const seconds = Math.floor(this.animCount % secondsPerMinute);
        const minutes = Math.floor((this.animCount / secondsPerMinute) % minutesPerHour);
        const hours = Math.floor(this.animCount / (secondsPerMinute * minutesPerHour));

        if (hours > 0) {
            return (
                hours + ':' +
                leftPad(minutes.toString(), 2, '0') + ':' +
                leftPad(seconds.toString(), 2, '0') + '.' +
                leftPad(deciSeconds.toString(), 1, '0')
            );
        }
        if (minutes > 0) {
            return (
                minutes + ':' +
                leftPad(seconds.toString(), 2, '0') + '.' +
                leftPad(deciSeconds.toString(), 1, '0')
            );
        }
        return seconds + '.' + leftPad(deciSeconds.toString(), 1, '0');
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
import { ClientGame } from "../../../client/game/client-game";
import { Point } from "../../common";
import { leftPad, secondsToFullTimeString } from "../../util";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";
import { Holdable } from "./holdable";

let element: HTMLElement | null = null;

// Really hacky way to send the timer down from the server but also have it be pretty synced.
export class DistractionUpdater extends Entity {

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = 0;
        this.height = 0;
        this.type = 'timer';

        if (!game.isServer && !element) {
            element = document.querySelector('.distraction-span');
        }
    }

    canRender(screenCenter: Point): boolean {
        return true;
    }

    render(context: CanvasRenderingContext2D): void {
        if (!element) {
            return;
        }

        const timeText = secondsToFullTimeString(this.countDistractions());
        if (element.innerText != timeText) {
            element.innerText = timeText;
        }
    }


    countDistractions() {
        let count = 0;
        const clientGame = this.game as ClientGame;
        const cat = clientGame.getCat();
        if (!cat) {
            return 0;
        }

        const topHouseY = this.game.entities.filter(e => e.type === 'house').map(e => e.minY).reduce((a, b) => Math.min(a, b), Number.MAX_VALUE);

        for (const entity of clientGame.entities) {
            if (entity.type !== 'holdable') {
                continue;
            }


            // Only count ones in front of the cat
            if (entity.midY < cat.midY) {
                continue;
            }
            if (entity.maxY > topHouseY) {
                continue;
            }
            if (entity.maxX < cat.minX || entity.minX > cat.maxX) {
                continue;
            }

            const holdable = entity as Holdable;
            count += holdable.distractionLength;
        }

        return count + cat.distractionCount;
    }
}
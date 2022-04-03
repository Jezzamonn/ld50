import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, physScale, pxFromPhys, spriteScale } from "../../common";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { House } from "./house";
import { Mouse } from "./mouse";

export class Cat extends Entity {

    moveSpeed = physFromPx(0.3 / frameLength);
    distractionCount = 0;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = physFromPx(120);
        this.height = physFromPx(180);
        this.type = 'cat';
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Holdable || other instanceof Mouse || other instanceof House;
    }

    update(dt: number): void {
        if (this.distractionCount > dt) {
            this.distractionCount -= dt;
        }
        else {
            this.distractionCount = 0;
        }

        if (this.distractionCount === 0) {
            this.dy = this.moveSpeed;
        }
        else {
            this.dy = 0;
        }

        this.moveY(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'cat',
            animationName: this.getAnimationName(),
            time: this.animCount,
            position: {
                x: pxFromPhys(this.midX),
                y: pxFromPhys(this.maxY),
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: spriteScale,
        });
    }

    getAnimationName(): string {
        if (this.distractionCount > 0) {
            return 'distracted';
        }
        return 'idle';
    }

    onEntityCollision(other: Entity): void {
        if (other instanceof Holdable) {
            other.done = true;
            this.distractionCount = 5;
        }
        else if (other instanceof Mouse) {
            other.done = true;
            this.distractionCount = 5;
            this.game.toUpdate.push(other);
        }
        else if (other instanceof House) {
            // TODO: LOSE!
        }
    }

    static loadImage() {
        Aseprite.loadImage({name: 'cat', basePath: 'sprites/'});
    }
}
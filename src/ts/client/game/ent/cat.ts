import { Aseprite } from "../../../common/aseprite-js";
import { frameLength, physFromPx, physScale, pxFromPhys, spriteScale } from "../../../common/common";
import { Game } from "../game";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { Mouse } from "./mouse";

export class Cat extends Entity {

    moveSpeed = physFromPx(0.3 / frameLength);

    constructor(game: Game) {
        super(game);

        this.width = physFromPx(120);
        this.height = physFromPx(180);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Mouse || other instanceof Holdable;
    }

    update(dt: number): void {
        this.dy = this.moveSpeed;

        this.moveY(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'cat',
            animationName: 'idle',
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

    static loadImage() {
        Aseprite.loadImage({name: 'cat', basePath: 'sprites/'});
    }
}
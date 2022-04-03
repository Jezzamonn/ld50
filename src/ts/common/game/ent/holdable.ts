import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, pxFromPhys, spriteScale } from "../../common";
import { choose } from "../../util";
import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Entity } from "./entity";
import { Tree } from "./tree";

export const holdableTypes = ['grass', 'rock', 'wood', 'wool']

export class Holdable extends Entity {

    type: string;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.debugColor = '#3e8948'
        this.type = 'grass';

        this.dampAcceleration = physFromPx(50 / frameLength);
    }

    update(dt: number): void {
        this.animCount += dt;

        if (this.z > -0.1) {
            this.dampX(dt);
            this.dampY(dt);
        }
        this.moveX(dt);
        this.moveY(dt);
        this.moveZ(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        super.render(context);

        if (this.z < -0.1) {
            Aseprite.drawAnimation({
                context,
                image: 'holdable',
                animationName: 'shadow',
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

        Aseprite.drawAnimation({
            context,
            image: 'holdable',
            animationName: this.type,
            time: this.animCount,
            position: {
                x: pxFromPhys(this.midX),
                y: pxFromPhys(this.maxY + this.z),
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: spriteScale,
        });
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat || other instanceof Tree;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'holdable', basePath: 'sprites/'});
    }
}
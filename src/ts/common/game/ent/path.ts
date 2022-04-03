import { Aseprite } from "../../aseprite-js";
import { pxFromPhys, spriteScale } from "../../common";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

export class Path extends Entity {
    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = 0;
        this.height = 0;
        this.type = 'path';
    }

    render(context: CanvasRenderingContext2D): void {
        Aseprite.drawSprite({
            context,
            image: 'path',
            frame: 0,
            position: {
                x: pxFromPhys(this.midX),
                y: pxFromPhys(this.minY),
            },
            anchorRatios: {
                x: 0.5,
                y: 0,
            },
            scale: spriteScale,
        });
    }

    static loadImage() {
        Aseprite.loadImage({ name: 'path', basePath: 'sprites/' });
    }
}
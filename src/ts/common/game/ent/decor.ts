import { Aseprite } from "../../aseprite-js";
import { pxFromPhys, spriteScale } from "../../common";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

export class Decor extends Entity {

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = 0;
        this.height = 0;
        this.type = 'decor';
    }

    render(context: CanvasRenderingContext2D): void {
        super.render(context);

        Aseprite.drawSprite({
            context,
            image: 'decor',
            frame: 0,
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
        Aseprite.loadImage({ name: 'decor', basePath: 'sprites/' });
    }
}
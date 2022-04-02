import { Aseprite } from "../../../common/aseprite-js";
import { pxFromPhys, spriteScale } from "../../../common/common";
import { Game } from "../game";
import { Entity } from "./entity";

export class Decor extends Entity {

    constructor(game: Game) {
        super(game);

        this.width = 0;
        this.height = 0;
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
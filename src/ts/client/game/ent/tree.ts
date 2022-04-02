import { Aseprite } from "../../../common/aseprite-js";
import { physFromPx, pxFromPhys, spriteScale } from "../../../common/common";
import { Game } from "../game";
import { Entity } from "./entity";

export class Tree extends Entity {

    constructor(game: Game) {
        super(game);

        this.width = physFromPx(25);
        this.height = physFromPx(10);
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);
        Aseprite.drawSprite({
            context,
            image: 'tree',
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
        })
    }

    static loadImage() {
        Aseprite.loadImage({name: 'tree', basePath: 'sprites/'});
    }
}
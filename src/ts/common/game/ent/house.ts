import { Aseprite } from "../../aseprite-js";
import { physFromPx, physFromSpritePx, pxFromPhys, spriteScale } from "../../common";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

export class House extends Entity {

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = physFromSpritePx(40);
        this.height = physFromSpritePx(30);
        this.type = 'house';
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);
        Aseprite.drawSprite({
            context,
            image: 'house',
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
        Aseprite.loadImage({name: 'house', basePath: 'sprites/'});
    }
}
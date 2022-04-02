import { physFromPx, physScale, pxFromPhys, pxGameHeight, pxGameWidth } from "../../common/common";
import { RegularKeys } from "../../common/keys";
import { rgb } from "../../common/util";
import { Cat } from "./ent/cat";
import { Entity } from "./ent/entity";
import { Holdable } from "./ent/holdable";
import { Mouse } from "./ent/mouse";

export class Game {

    keys: RegularKeys;
    rng: () => number;

    entities: Entity[] = [];
    player: Mouse;

    constructor(keys: RegularKeys, rng: () => number) {
        this.keys = keys;
        this.rng = rng;

        // Create the player and the cat
        const mouse = new Mouse(this);
        mouse.midX = 0;//physFromPx(200);
        mouse.minY = 0;//physFromPx(200);
        this.entities.push(mouse);
        this.player = mouse;

        const cat = new Cat(this);
        cat.midX = physFromPx(200);
        cat.maxY = physFromPx(200);
        this.entities.push(cat);

        // Add a bunch of holdable things.
        for (let i = 0; i < 10; i++) {
            const holdable = new Holdable(this);
            holdable.midX = physFromPx(Math.round(this.rng() * 800));
            holdable.minY = physFromPx(Math.round(this.rng() * 600));
            this.entities.push(holdable);
        }
    }

    update(dt: number) {
        for (const ent of this.entities) {
            ent.update(dt);
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent.done) {
                this.entities.splice(i, 1);
            }
        }

        this.keys.resetFrame();
    }

    render(context: CanvasRenderingContext2D) {
        context.resetTransform();

        this.renderBg(context);

        context.translate(
            pxFromPhys(-this.player.midX) + pxGameWidth / 2,
            pxFromPhys(-this.player.midY) + pxGameHeight / 2);
        for (const ent of this.entities) {
            ent.render(context);
        }
    }

    renderBg(context: CanvasRenderingContext2D) {
        context.save();
        context.resetTransform();
        context.fillStyle = '#7dcc6c'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }

    getEntitiesOfType<T extends Entity>(type: { new (...args: any[]): T }): T[] {
        return this.entities.filter(ent => ent instanceof type) as T[];
    }

    static loadAllImages() {
        Mouse.loadImage();
    }
}
import { RegularKeys } from "../../common/keys";
import { rgb } from "../../common/util";
import { Cat } from "./ent/cat";
import { Entity } from "./ent/entity";
import { Mouse } from "./ent/mouse";

export class Game {

    keys: RegularKeys;

    entities: Entity[] = [];

    constructor(keys: RegularKeys) {
        this.keys = keys;

        // Create the player and the cat
        const mouse = new Mouse(this);
        mouse.midX = 200;
        mouse.minY = 200;
        this.entities.push(mouse);

        const cat = new Cat(this);
        cat.midX = 200;
        cat.maxY = 200;
        this.entities.push(cat);
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
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = '#7dcc6c'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        for (const ent of this.entities) {
            ent.render(context);
        }
    }
}
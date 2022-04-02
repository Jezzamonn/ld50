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

    constructor(keys: RegularKeys, rng: () => number) {
        this.keys = keys;
        this.rng = rng;

        // Create the player and the cat
        const mouse = new Mouse(this);
        mouse.midX = 200;
        mouse.minY = 200;
        this.entities.push(mouse);

        const cat = new Cat(this);
        cat.midX = 200;
        cat.maxY = 200;
        this.entities.push(cat);

        // Add a bunch of holdable things.
        for (let i = 0; i < 10; i++) {
            const holdable = new Holdable(this);
            holdable.midX = Math.round(this.rng() * 800);
            holdable.minY = Math.round(this.rng() * 600);
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
        context.fillStyle = '#7dcc6c'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        for (const ent of this.entities) {
            ent.render(context);
        }
    }

    getEntitiesOfType<T extends Entity>(type: { new (...args: any[]): T }): T[] {
        return this.entities.filter(ent => ent instanceof type) as T[];
    }
}
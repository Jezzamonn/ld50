import { physFromPx, pxWorldHeight, pxWorldWidth } from "../common/common";
import { Cat } from "../common/game/ent/cat";
import { Decor } from "../common/game/ent/decor";
import { Entity } from "../common/game/ent/entity";
import { Holdable, holdableTypes } from "../common/game/ent/holdable";
import { Mouse } from "../common/game/ent/mouse";
import { Tree } from "../common/game/ent/tree";
import { EntityList } from "../common/game/entity-list";
import { choose } from "../common/util";
import { v4 as uuidv4 } from "uuid";

export class ServerGame implements EntityList {
    rng: () => number;

    entities: Entity[] = [];

    constructor(rng: () => number) {
        this.rng = rng;
        // TODO: This need to happen when a player connects.
        this.createWorld();
    }

    update(dt: number): void {
        for (const ent of this.entities) {
            ent.update(dt);
        }
    }

    getEntitiesAsObjects() {
        return this.entities.map(ent => ent.toObject());
    }

    createWorld() {
        this.entities = [];

        // Don't create the player here.

        const cat = new Cat(this, uuidv4());
        cat.midX = physFromPx(200);
        cat.maxY = physFromPx(200);
        this.entities.push(cat);

        // Add a bunch of holdable things.
        for (let i = 0; i < 100; i++) {
            const holdable = new Holdable(this, uuidv4());
            holdable.type = choose(holdableTypes, this.rng);
            holdable.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            holdable.minY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.entities.push(holdable);
        }

        // Add a bunch of trees
        for (let i = 0; i < 200; i++) {
            const tree = new Tree(this, uuidv4());
            tree.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            tree.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.entities.push(tree);
        }

        // Add decor
        for (let i = 0; i < 500; i++) {
            const decor = new Decor(this, uuidv4());
            decor.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            decor.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.entities.push(decor);
        }
    }

}
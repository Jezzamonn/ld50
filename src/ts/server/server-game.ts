import { physFromPx, physFromSpritePx, pxWorldHeight, pxWorldWidth } from "../common/common";
import { Cat } from "../common/game/ent/cat";
import { Decor } from "../common/game/ent/decor";
import { Entity } from "../common/game/ent/entity";
import { Holdable, holdableTypes } from "../common/game/ent/holdable";
import { Mouse } from "../common/game/ent/mouse";
import { Tree } from "../common/game/ent/tree";
import { EntityList } from "../common/game/entity-list";
import { choose } from "../common/util";
import { v4 as uuidv4 } from "uuid";
import { createEntityFromObject } from "../common/game/ent/entity-creator";
import { House } from "../common/game/ent/house";
import { Path } from "../common/game/ent/path";

export class ServerGame implements EntityList {
    rng: () => number;

    entities: Entity[] = [];
    // Unused?
    toUpdate: Entity[] = [];

    gameOver: boolean = false;
    isServer: boolean = true;

    constructor(rng: () => number) {
        this.rng = rng;
        // TODO: This need to happen when a player connects.
        this.createWorld();
    }

    update(dt: number): void {
        for (const ent of this.entities) {
            ent.update(dt);
        }
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent.done) {
                this.entities.splice(i, 1);
                console.log(`Done: ${ent.type} ${ent.id}`);
            }
        }

        // if (this.rng() < 0.01) {
        //     // Add a new thingo?
        //     const newEnt = new Holdable(this, uuidv4());
        //     newEnt.holdableType = choose(holdableTypes, this.rng);
        //     newEnt.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
        //     newEnt.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
        //     this.entities.push(newEnt);
        // }
    }

    getEntitiesAsObjects({skipDecor = false}: {skipDecor?: boolean} = {}): any[] {
        if (skipDecor) {
            return this.entities.filter(e => e.type !== "decor").map(e => e.toObject());
        }
        return this.entities.map(ent => ent.toObject());
    }

    updateEntitiesFromClient(clientEntities: any) {
        for (const serverEntity of clientEntities) {
            // TODO: This could be more efficient.
            const existing = this.entities.find(e => e.id === serverEntity.id);
            if (existing) {
                existing.updateFromObject(serverEntity);
            }
            else {
                const newEnt = createEntityFromObject(this, serverEntity);
                if (newEnt) {
                    this.entities.push(newEnt);
                    console.log(`New: ${newEnt.type} ${newEnt.id}`);
                }
            }
        }
    }

    createWorld() {
        this.entities = [];

        // Don't create the player here.

        const cat = new Cat(this, uuidv4());
        cat.midX = physFromPx(pxWorldWidth / 2);
        cat.maxY = physFromPx(0);
        this.entities.push(cat);

        const houseOffsets = [
            {x: 0, y: 0},
            {x: -100, y: 100},
            {x: 100, y: 100},
        ]

        for (const houseOffset of houseOffsets) {
            const house = new House(this, uuidv4());
            house.midX = physFromPx(pxWorldWidth / 2 + houseOffset.x);
            house.maxY = physFromPx(pxWorldHeight + houseOffset.y);
            this.entities.push(house);
        }

        // Path added on the client.

        // Add a bunch of holdable things.
        for (let i = 0; i < 20; i++) {
            const holdable = new Holdable(this, uuidv4());
            holdable.holdableType = choose(holdableTypes, this.rng);
            holdable.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            holdable.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.entities.push(holdable);
        }

        // Add a bunch of trees
        for (let i = 0; i < 40; i++) {
            const tree = new Tree(this, uuidv4());
            tree.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            tree.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.entities.push(tree);
        }

        // // Add decor
        // for (let i = 0; i < 50; i++) {
        //     const decor = new Decor(this, uuidv4());
        //     decor.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
        //     decor.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
        //     this.entities.push(decor);
        // }
    }

}
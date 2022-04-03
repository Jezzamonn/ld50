import { physFromPx, physScale, pxFromPhys, pxGameHeight, pxGameWidth } from "../../common/common";
import { RegularKeys } from "../../common/keys";
import { choose, rgb } from "../../common/util";
import { Cat } from "../../common/game/ent/cat";
import { Decor } from "../../common/game/ent/decor";
import { Entity } from "../../common/game/ent/entity";
import { Holdable, holdableTypes } from "../../common/game/ent/holdable";
import { Mouse } from "../../common/game/ent/mouse";
import { Tree } from "../../common/game/ent/tree";
import { v4 as uuidv4 } from "uuid";

const restartKeys = ["KeyR"];

export class ClientGame {

    keys: RegularKeys;
    rng: () => number;

    entities: Entity[] = [];
    player!: Mouse;

    constructor(keys: RegularKeys, rng: () => number) {
        this.keys = keys;
        this.rng = rng;

        this.createWorld();
    }

    // TODO: Move this to the server
    createWorld() {
        this.entities = [];

        // Create the player.... TODO: figure out how to manage this server side.
        const mouse = new Mouse(this, uuidv4());
        mouse.midX = physFromPx(pxGameWidth / 2);
        mouse.minY = physFromPx(pxGameHeight / 2);
        this.entities.push(mouse);
        this.player = mouse;
    }

    update(dt: number) {
        this.handlePlayerInput(dt);

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

    handlePlayerInput(dt: number) {
        if (this.keys.anyWasPressedThisFrame(restartKeys)) {
            this.createWorld();
        }
        this.player.handleInput(this.keys, dt);
    }

    updateEntitiesFromServer(serverEntities: any) {
        const encounteredIds = new Set<string>();
        for (const serverEntity of serverEntities) {
            encounteredIds.add(serverEntity.id);
            if (serverEntity.id === this.player.id) {
                continue;
            }
            // TODO: This could be more efficient.
            const existing = this.entities.find(e => e.id === serverEntity.id);
            if (existing) {
                existing.updateFromObject(serverEntity);
            }
            else {
                const newEnt = this.createEntityFromServer(serverEntity);
                if (newEnt) {
                    newEnt.updateFromObject(serverEntity);

                    this.entities.push(newEnt);
                }
            }
        }

        for (const ent of this.entities) {
            if (ent === this.player) {
                continue;
            }
            if (!encounteredIds.has(ent.id)) {
                ent.done = true;
            }
        }
    }

    createEntityFromServer(obj: any): Entity | undefined {
        switch (obj.type) {
            case "cat":
                return new Cat(this, obj.id);
            case "mouse":
                return new Mouse(this, obj.id);
            case "tree":
                return new Tree(this, obj.id);
            case "decor":
                return new Decor(this, obj.id);
            case "holdable":
                return new Holdable(this, obj.id);
            default:
                console.error(`Unknown entity type: ${obj.type}`);
                return undefined;
        }
    }

    render(context: CanvasRenderingContext2D) {
        context.resetTransform();

        this.renderBg(context);

        context.translate(
            pxFromPhys(-this.player.midX) + pxGameWidth / 2,
            pxFromPhys(-this.player.midY) + pxGameHeight / 2);

        // Sort the entities by y position
        this.entities.sort((a, b) => a.maxY - b.maxY);

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

    static loadAllImages() {
        Mouse.loadImage();
        Cat.loadImage();
        Holdable.loadImage();
        Tree.loadImage();
        Decor.loadImage();
    }
}
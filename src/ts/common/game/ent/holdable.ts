import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, pxFromPhys, spriteScale } from "../../common";
import { choose, lerp } from "../../util";
import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Entity } from "./entity";
import { House } from "./house";
import { Tree } from "./tree";
import { v4 as uuidv4 } from "uuid";

export const holdableTypes = ['grass', 'rock', 'wood', 'wool'];

const spawnSpeed = physFromPx(2 / frameLength);
const spawnZSpeed = physFromPx(1 / frameLength);

export class Holdable extends Entity {

    holdableType: string;
    thrown = false;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.debugColor = '#3e8948'
        this.type = 'holdable';
        this.holdableType = 'grass';

        this.dampAcceleration = physFromPx(50 / frameLength);
    }

    get distractionLength() {
        switch (this.holdableType) {
            case 'grass':
                return 3;
            case 'rock':
                return 5;
            case 'wood':
                return 3;
            case 'wool':
                return 30;
            default:
                return 0;
        }
    }

    update(dt: number): void {
        this.animCount += dt;

        if (this.z > -0.1) {
            this.dampX(dt);
            this.dampY(dt);
        }
        this.moveX(dt);
        this.moveY(dt);
        this.moveZ(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        super.render(context);

        if (this.z < -0.1) {
            Aseprite.drawAnimation({
                context,
                image: 'holdable',
                animationName: 'shadow',
                time: this.animCount,
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

        Aseprite.drawAnimation({
            context,
            image: 'holdable',
            animationName: this.holdableType,
            time: this.animCount,
            position: {
                x: pxFromPhys(this.midX),
                y: pxFromPhys(this.maxY + this.z),
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: spriteScale,
        });
    }

    onEntityCollision(other: Entity): void {
        if (!this.thrown) {
            return;
        }
        // Kill trees
        if (this.holdableType === 'rock' && other instanceof Tree) {
            // Kills trees. Lol.
            other.done = true;
            this.dx = 0;
            this.dy = 0;

            // Spawn a bunch of holdable things. But I think this only happens on the server?
            if (this.game.isServer) {
                for (let i = 0; i < 3; i++) {
                    const holdableType = choose(['grass', 'wood'], Math.random);
                    const holdable = new Holdable(this.game, uuidv4());
                    holdable.holdableType = holdableType;
                    holdable.x = other.x;
                    holdable.y = other.y;
                    holdable.dx = lerp(-spawnSpeed, spawnSpeed, Math.random());
                    holdable.dy = lerp(-spawnSpeed, spawnSpeed, Math.random());
                    holdable.dz = -spawnZSpeed;

                    this.game.entities.push(holdable);
                }
            }
        }
        // Grass becomes a new tree if it hits a tree
        if (this.holdableType === 'grass' && other instanceof Tree) {
            this.done = true;

            const tree = new Tree(this.game, uuidv4());
            tree.x = this.x;
            tree.y = this.y;
            this.game.entities.push(tree);
        }
    }

    toObject() {
        return Object.assign(super.toObject(), {
            holdableType: this.holdableType,
            thrown: this.thrown,
        });
    }

    updateFromObject(obj: any, smooth: boolean = false) {
        super.updateFromObject(obj, smooth);
        this.holdableType = obj.holdableType;
        this.thrown = obj.thrown;
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat || other instanceof Tree || other instanceof House;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'holdable', basePath: 'sprites/'});
    }
}
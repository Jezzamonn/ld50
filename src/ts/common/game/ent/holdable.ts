import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, pxFromPhys, spriteScale } from "../../common";
import { choose, lerp } from "../../util";
import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Entity } from "./entity";
import { House } from "./house";
import { Tree } from "./tree";
import { v4 as uuidv4 } from "uuid";
import { Sounds } from "../../sounds";
import { Mon } from "./mon";

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

    canCollideWith(other: Entity): boolean {
        return (
            other.type === 'cat' ||
            other.type === 'tree' ||
            other.type === 'house' ||
            other.type === 'mon'
        );
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
            case 'small-wool':
                return 20;
            case 'fish':
                return 20;
            case 'painted-fish':
                return 25;
            case 'cat':
            case 'house':
                return 60;
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
        let bounce = false;

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

            // play sound on the client??
            if (!this.game.isServer) {
                Sounds.playSound('explode', { volume: 0.3 });
            }
        }
        // Grass becomes a new tree if it hits a tree
        else if (this.holdableType === 'grass' && other instanceof Tree) {
            this.done = true;

            const tree = new Tree(this.game, uuidv4());
            tree.x = this.x;
            tree.y = this.y;
            this.game.entities.push(tree);

            // Trees make explosions sounds when they grow, right?
            if (!this.game.isServer) {
                Sounds.playSound('explode', { volume: 0.3 });
            }
        }
        // Wood becomes a fish if it hits a house
        else if (this.holdableType === 'wood' && other instanceof House) {
            this.holdableType = 'fish';
            // bounce back
            bounce = true;

            if (!this.game.isServer) {
                Sounds.playSound('walk', { volume: 0.5 });
            }
        }
        // Fish becomes a painted fish if it hits a house
        else if (this.holdableType === 'fish' && other instanceof House) {
            this.holdableType = 'painted-fish';
            // bounce back
            bounce = true;

            if (!this.game.isServer) {
                Sounds.playSound('walk', { volume: 0.5 });
            }
        }

        // Wool becomes a small wool if it hits a mon
        else if (this.holdableType === 'wool' && other instanceof Mon) {
            if (this.game.isServer) {

                console.log('make wool?');

                other.woolCount--;

                const holdable = new Holdable(this.game, uuidv4());
                holdable.holdableType = 'small-wool';
                holdable.midX = other.midX;
                holdable.maxY = other.maxY;
                holdable.dx = 0.5 * -this.dx;
                holdable.dy = 0.5 * -this.dy;
                holdable.dz = -spawnZSpeed;
                this.game.entities.push(holdable);

                if (other.woolCount === 0) {
                    other.done = true;
                }
            }

            if (!this.game.isServer) {
                Sounds.playSound('walk', { volume: 0.5 });
            }
        }
        // Rocks kill mons :(
        else if (this.holdableType === 'rock' && other instanceof Mon) {
            other.done = true;

            if (!this.game.isServer) {
                Sounds.playSound('explode', { volume: 0.3 });
            }
        }

        if (bounce) {
            this.dx = -0.5 * this.dx;
            this.dy = -0.5 * this.dy;
        }
        else {
            this.dx = 0;
            this.dy = 0;
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

    land(): void {
        super.land();
        // dz is negative after bouncing.
        if (!this.game.isServer && this.dz < -10 / frameLength) {
            Sounds.playSound('walk', { volume: 0.3 });
        }
    }

    static loadImage() {
        Aseprite.loadImage({name: 'holdable', basePath: 'sprites/'});
    }
}
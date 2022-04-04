import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, physScale, pxFromPhys, spriteScale } from "../../common";
import { Sounds } from "../../sounds";
import { clampedSlurp } from "../../util";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { House } from "./house";
import { Mouse } from "./mouse";

export class Cat extends Entity {

    moveSpeed = physFromPx(0.6 / frameLength);
    distractionCount = 0;
    atHouse = false;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = physFromPx(120);
        this.height = physFromPx(180);
        this.type = 'cat';
    }

    canCollideWith(other: Entity): boolean {
        return (
            other.type === 'holdable' ||
            other.type === 'mouse' ||
            other.type === 'house'
        );
    }

    update(dt: number): void {
        if (this.distractionCount > dt) {
            this.distractionCount -= dt;
        }
        else {
            this.distractionCount = 0;
        }

        if (this.distractionCount === 0) {
            this.dy = this.moveSpeed;
        }
        else {
            this.dy = 0;
        }

        this.moveY(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'cat',
            animationName: this.getAnimationName(),
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

    getAnimationName(): string {
        if (this.distractionCount > 0) {
            return 'distracted';
        }
        return 'idle';
    }

    onEntityCollision(other: Entity): void {
        if (other instanceof Holdable) {
            other.done = true;
            this.distractionCount = other.distractionLength;

            if (!this.game.isServer) {
                // Louder depending on how good of a distraction it was.
                Sounds.playSound('meow', {
                    volume: clampedSlurp(0.2, 1, this.distractionCount / 30),
                });
            }
        }
        else if (other instanceof Mouse) {
            other.done = true;
            this.distractionCount = 2;
            this.game.toUpdate.push(other);

            if (!this.game.isServer) {
                Sounds.playSound('gameover', { volume: 0.5 });
            }
        }
        else if (other instanceof House) {
            this.atHouse = true;
            this.distractionCount = 1;
        }

        if (this.atHouse) {
            if (!this.game.gameOver) {
                console.log('Game over!');
                if (!this.game.isServer) {
                    Sounds.playSound('gameover', { volume: 0.5 });
                }
            }
            this.game.gameOver = true;
        }
    }

    toObject() {
        return Object.assign(super.toObject(), {
            distractionCount: this.distractionCount,
            atHouse: this.atHouse,
        });
    }

    updateFromObject(obj: any, smooth?: boolean): void {
        super.updateFromObject(obj, smooth);
        this.distractionCount = obj.distractionCount;
        this.atHouse ||= obj.atHouse;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'cat', basePath: 'sprites/'});
    }
}
import { ClientGame } from "../../../client/game/client-game";
import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, physFromSpritePx, Point, pxFromPhys, pxWorldWidth, spriteScale } from "../../common";
import { clamp, lerp } from "../../util";
import { EntityList } from "../entity-list";
import { Entity } from "./entity";

const maxWalkSpeed = physFromPx(2 / frameLength);
const maxWalkDist = physFromPx(200);

export class Mon extends Entity {

    walkTarget?: Point;
    woolCount = 3;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = physFromSpritePx(14);
        this.height = physFromSpritePx(10);
        this.type = 'mon';
    }

    canCollideWith(other: Entity): boolean {
        return (
            other.type === 'cat' ||
            other.type === 'tree' ||
            other.type === 'house' ||
            other.type === 'mon'
        );
    }

    render(context: CanvasRenderingContext2D): void {
        // super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'mon',
            animationName: this.walkTarget ? 'run' : 'idle',
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

    update(dt: number): void {
        if (this.walkTarget) {
            const xDist = this.walkTarget.x - this.midX;
            const yDist = this.walkTarget.y - this.maxY;

            this.dx = clamp(xDist, -maxWalkSpeed, maxWalkSpeed);
            this.dy = clamp(yDist, -maxWalkSpeed, maxWalkSpeed);

            if (Math.abs(xDist) + Math.abs(yDist) < maxWalkSpeed) {
                this.walkTarget = undefined;
            }
        }
        if (this.game.isServer) {
            if (!this.walkTarget || this.game.rng() < 0.01) {
                this.walkTarget = {
                    x: this.midX + lerp(-maxWalkDist, maxWalkDist, this.game.rng()),
                    y: this.midY + lerp(-maxWalkDist, maxWalkDist, this.game.rng()),
                };
            }
        }

        // if (this.game instanceof ClientGame) {
        //     const distToPlayerX = this.midX - this.game.player.midX;
        //     const distToPlayerY = this.midY - this.game.player.midY;
        //     console.log(`distToPlayerX: ${distToPlayerX}, distToPlayerY: ${distToPlayerY}`);
        // }

        super.update(dt);

        // Too far away = die
        if (Math.abs(this.midX) > physFromPx(pxWorldWidth * 2) || Math.abs(this.maxY) > physFromPx(pxWorldWidth * 2)) {
            this.done = true;
        }
    }

    toObject() {
        return {
            ...super.toObject(),
            walkTarget: this.walkTarget,
            woolCount: this.woolCount,
        };
    }

    updateFromObject(obj: any, smooth?: boolean): void {
        super.updateFromObject(obj, smooth);

        this.walkTarget = obj.walkTarget;
        this.woolCount = obj.woolCount;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'mon', basePath: 'sprites/'});
    }

}
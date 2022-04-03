import { Aseprite } from "../../aseprite-js";
import { frameLength, physFromPx, Point, pxFromPhys, spriteScale } from "../../common";
import { RegularKeys } from "../../keys";
import { clamp } from "../../util";
import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { Tree } from "./tree";

const UP_KEYS = ["KeyW", "ArrowUp"];
const DOWN_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const ACTION_KEYS = ["Space"];

export class Mouse extends Entity {

    maxWalkSpeed = physFromPx(3 / frameLength);
    walkAcceleration = physFromPx(50 / frameLength);
    throwSpeed = physFromPx(4 / frameLength);
    throwZSpeed = physFromPx(2 / frameLength);

    rollSpeed = physFromPx(8 / frameLength);
    rollCount = 0;
    rollTime = 0.2;

    zHeight = physFromPx(30);

    holding?: Entity;

    facingDirection: Point = { x: 1, y: 0 };

    isMoving = false;
    flipped = false;

    constructor(game: EntityList, id: string) {
        super(game, id);

        this.width = physFromPx(20);
        this.height = physFromPx(10);
        this.debugColor = undefined;
        this.type = 'mouse';

        this.dampAcceleration = physFromPx(20 / frameLength);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat || (other instanceof Holdable && other.isOnGround()) || other instanceof Tree;
    }

    update(dt: number): void {
        // TODO: I suppose this could load things from the server??
        if (this.rollCount > 0) {
            this.rollCount -= dt;
        }

        this.animCount += dt;
        this.moveX(dt);
        this.moveY(dt)

        if (this.holding) {
            this.holding.midX = this.midX;
            this.holding.maxY = this.maxY;
            this.holding.z = this.z - this.zHeight;
        }
    }

    render(context: CanvasRenderingContext2D) {
        super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'mouse',
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
            flippedX: this.flipped,
        });

        this.holding?.render(context);
    }

    getAnimationName() {
        if (this.rollCount > 0) {
            return 'dash';
        }
        if (this.isMoving) {
            return 'run';
        }
        return 'idle';
    }

    handleInput(keys: RegularKeys, dt: number): void {
        if (keys.anyWasPressedThisFrame(ACTION_KEYS)) {
            this.doAction();
        }

        if (this.rollCount <= 0) {
            this.handleWalkingInput(keys, dt);
        }
    }

    doAction() {
        if (this.holding) {
            this.putDown();
        }
        else {
            const pickedUp = this.tryPickup();
            if (pickedUp) {
                return;
            }
            this.roll();
        }
    }

    handleWalkingInput(keys: RegularKeys, dt: number) {
        let xInput = 0;
        let yInput = 0;
        if (keys.anyIsPressed(LEFT_KEYS)) {
            xInput--;
        }
        if (keys.anyIsPressed(RIGHT_KEYS)) {
            xInput++;
        }
        if (keys.anyIsPressed(UP_KEYS)) {
            yInput--;
        }
        if (keys.anyIsPressed(DOWN_KEYS)) {
            yInput++;
        }
        if (xInput != 0 || yInput != 0) {
            // This doesn't handle diagonal movement well.
            this.facingDirection = {
                x: xInput,
                y: yInput,
            }
        }

        this.isMoving = false;

        if (xInput != 0) {
            this.dx += xInput * this.walkAcceleration * dt;
            this.dx = clamp(this.dx, -this.maxWalkSpeed, this.maxWalkSpeed);

            this.flipped = xInput < 0;
            this.isMoving = true;
        }
        else {
            this.dampX(dt);
        }

        if (yInput != 0) {
            this.dy += yInput * this.walkAcceleration * dt;
            this.dy = clamp(this.dy, -this.maxWalkSpeed, this.maxWalkSpeed);

            this.isMoving = true;
        }
        else {
            this.dampY(dt);
        }
    }

    tryPickup(): boolean {
        for (const ent of this.game.entities) {
            if (!(ent instanceof Holdable)) {
                continue;
            }
            if (ent.done) {
                continue;
            }
            if (this.isTouching(ent, this.width / 2)) {
                this.holding = ent;
                // The game will remove this entity
                ent.done = true;
                this.game.toUpdate.push(ent);
                return true;
            }
        }
        return false
    }

    putDown() {
        if (!this.holding) {
            return;
        }
        this.holding.done = false;
        this.holding.dx = this.throwSpeed * this.facingDirection.x + 0.5 * this.dx;
        this.holding.dy = this.throwSpeed * this.facingDirection.y + 0.5 * this.dy;
        this.holding.dz = -this.throwZSpeed;
        this.game.entities.push(this.holding);
        this.game.toUpdate.push(this.holding);
        this.holding = undefined;
    }

    roll() {
        // TODO: Cooldown?
        if (this.rollCount > 0) {
            return;
        }
        this.rollCount = this.rollTime;
        this.dx = this.rollSpeed * this.facingDirection.x;
        this.dy = this.rollSpeed * this.facingDirection.y;
    }

    toObject() {
        return Object.assign(super.toObject(), {
            isMoving: this.isMoving,
            flipped: this.flipped,
            rollCount: this.rollCount,
        });
    }

    updateFromObject(obj: any) {
        super.updateFromObject(obj);
        this.isMoving = obj.isMoving;
        this.flipped = obj.flipped;
        this.rollCount = obj.rollCount;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'mouse', basePath: 'sprites/'});
    }


}
import { Aseprite } from "../../../common/aseprite-js";
import { frameLength, physFromPx, Point, pxFromPhys } from "../../../common/common";
import { clamp } from "../../../common/util";
import { Game } from "../game";
import { Cat } from "./cat";
import { Entity } from "./entity";
import { Holdable } from "./holdable";

const UP_KEYS = ["KeyW", "ArrowUp"];
const DOWN_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const ACTION_KEYS = ["Space"];

export class Mouse extends Entity {

    maxWalkSpeed = physFromPx(3 / frameLength);
    walkAcceleration = physFromPx(50 / frameLength);
    throwSpeed = physFromPx(6 / frameLength);

    rollSpeed = physFromPx(6 / frameLength);
    rollCount = 0;
    rollTime = 0.3;

    holding?: Entity;

    lastDirection: Point = {
        x: 1, y: 0,
    }

    constructor(game: Game) {
        super(game);

        this.width = physFromPx(20);
        this.height = physFromPx(20);

        this.dampAcceleration = physFromPx(20 / frameLength);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat || (other instanceof Holdable && other.isOnGround());
    }

    update(dt: number): void {
        // TODO: I suppose this could load things from the server??
        if (this.rollCount > 0) {
            this.rollCount -= dt;
        }

        this.animCount += dt;
        this.handleInput(dt);
        this.moveX(dt);
        this.moveY(dt)

        if (this.holding) {
            this.holding.midX = this.midX;
            this.holding.maxY = this.maxY;
            this.holding.z = this.z - this.height;
        }
    }

    render(context: CanvasRenderingContext2D) {
        if (this.rollCount > 0) {
            this.debugColor = '#3e8948'
        }
        else {
            this.debugColor = '#ff0000'
        }
        super.render(context);

        Aseprite.drawAnimation({
            context,
            image: 'mouse',
            animationName: 'run',
            time: this.animCount,
            position: {
                x: pxFromPhys(this.midX),
                y: pxFromPhys(this.maxY),
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: 2
        });

        this.holding?.render(context);
    }

    handleInput(dt: number): void {
        if (this.game.keys.anyWasPressedThisFrame(ACTION_KEYS)) {
            this.doAction();
        }

        if (this.rollCount <= 0) {
            this.handleWalkingInput(dt);
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

    handleWalkingInput(dt: number) {
        let xInput = 0;
        let yInput = 0;
        if (this.game.keys.anyIsPressed(LEFT_KEYS)) {
            xInput--;
        }
        if (this.game.keys.anyIsPressed(RIGHT_KEYS)) {
            xInput++;
        }
        if (this.game.keys.anyIsPressed(UP_KEYS)) {
            yInput--;
        }
        if (this.game.keys.anyIsPressed(DOWN_KEYS)) {
            yInput++;
        }
        if (xInput != 0 || yInput != 0) {
            // This doesn't handle diagonal movement well.
            this.lastDirection = {
                x: xInput,
                y: yInput,
            }
        }

        if (xInput != 0) {
            this.dx += xInput * this.walkAcceleration * dt;
            this.dx = clamp(this.dx, -this.maxWalkSpeed, this.maxWalkSpeed);
        }
        else {
            this.dampX(dt);
        }

        if (yInput != 0) {
            this.dy += yInput * this.walkAcceleration * dt;
            this.dy = clamp(this.dy, -this.maxWalkSpeed, this.maxWalkSpeed);
        }
        else {
            this.dampY(dt);
        }
    }

    tryPickup(): boolean {
        const holdable = this.game.getEntitiesOfType(Holdable);
        for (const ent of holdable) {
            if (ent.done) {
                continue;
            }
            if (this.isTouching(ent, this.width / 2)) {
                this.holding = ent;
                // The game will remove this entity
                ent.done = true;
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
        this.holding.dx = this.throwSpeed * this.lastDirection.x;
        this.holding.dy = this.throwSpeed * this.lastDirection.y;
        this.game.entities.push(this.holding);
        this.holding = undefined;
    }

    roll() {
        // TODO: Cooldown?
        if (this.rollCount > 0) {
            return;
        }
        this.rollCount = this.rollTime;
        this.dx = this.rollSpeed * this.lastDirection.x;
        this.dy = this.rollSpeed * this.lastDirection.y;
    }

    static loadImage() {
        Aseprite.loadImage({name: 'mouse', basePath: 'sprites/'});
    }


}
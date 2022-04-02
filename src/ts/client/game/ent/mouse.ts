import { frameLength } from "../../../common/common";
import { clamp } from "../../../common/util";
import { Game } from "../game";
import { Entity } from "./entity";
import { Holdable } from "./holdable";

const UP_KEYS = ["KeyW", "ArrowUp"];
const DOWN_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const ACTION_KEYS = ["Space"]

export class Mouse extends Entity {

    maxWalkSpeed = 200 / frameLength;
    walkAcceleration = 50 / frameLength;
    walkDeacceleration = 20 / frameLength;

    holding?: Entity;

    constructor(game: Game) {
        super(game);

        this.width = 20;
        this.height = 20;
    }

    update(dt: number): void {
        // TODO: I suppose this could load things from the server??
        this.handleInput(dt);
        this.moveX(dt);
        this.moveY(dt)

        if (this.holding) {
            this.holding.midX = this.midX;
            this.holding.maxY = this.minY;
        }
    }

    render(context: CanvasRenderingContext2D) {
        super.render(context);
        this.holding?.render(context);
    }

    handleInput(dt: number): void {
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

        if (xInput != 0) {
            this.dx += xInput * this.walkAcceleration * dt;
            this.dx = clamp(this.dx, -this.maxWalkSpeed * dt, this.maxWalkSpeed * dt);
        }
        else {
            if (this.dx > this.walkDeacceleration * dt) {
                this.dx -= this.walkDeacceleration * dt;
            }
            else if (this.dx < -this.walkDeacceleration * dt) {
                this.dx += this.walkDeacceleration * dt;
            }
            else {
                this.dx = 0;
            }
        }

        if (yInput != 0) {
            this.dy += yInput * this.walkAcceleration * dt;
            this.dy = clamp(this.dy, -this.maxWalkSpeed * dt, this.maxWalkSpeed * dt);
        }
        else {
            if (this.dy > this.walkDeacceleration * dt) {
                this.dy -= this.walkDeacceleration * dt;
            }
            else if (this.dy < -this.walkDeacceleration * dt) {
                this.dy += this.walkDeacceleration * dt;
            }
            else {
                this.dy = 0;
            }
        }

        if (this.game.keys.anyWasPressedThisFrame(ACTION_KEYS)) {
            if (this.holding) {
                this.putDown();
            }
            else {
                this.tryPickup();
            }
        }
    }

    tryPickup() {
        const holdable = this.game.getEntitiesOfType(Holdable);
        for (const ent of holdable) {
            if (ent.done) {
                continue;
            }
            if (this.isTouching(ent)) {
                this.holding = ent;
                ent.done = true;
                // The game should remove this entity
            }
        }
    }

    putDown() {
        if (!this.holding) {
            return;
        }
        this.holding.done = false;
        this.game.entities.push(this.holding);
        this.holding = undefined;
    }


}
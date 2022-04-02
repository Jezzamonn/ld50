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

    rollMultiple = 2;
    rollCount = 0;
    rollTime = 0.3;

    holding?: Entity;

    constructor(game: Game) {
        super(game);

        this.width = 20;
        this.height = 20;

        this.dampAmount = 20;
    }

    update(dt: number): void {
        // TODO: I suppose this could load things from the server??
        if (this.rollCount > 0) {
            this.rollCount -= dt;
        }

        this.handleInput(dt);
        this.moveX(dt);
        this.moveY(dt)

        if (this.holding) {
            this.holding.midX = this.midX;
            this.holding.maxY = this.minY;
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

        if (xInput != 0) {
            this.dx += xInput * this.walkAcceleration * dt;
            this.dx = clamp(this.dx, -this.maxWalkSpeed * dt, this.maxWalkSpeed * dt);
        }
        else {
            this.dampX(dt);
        }

        if (yInput != 0) {
            this.dy += yInput * this.walkAcceleration * dt;
            this.dy = clamp(this.dy, -this.maxWalkSpeed * dt, this.maxWalkSpeed * dt);
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
            if (this.isTouching(ent)) {
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
        this.holding.dx = 2 * this.dx;
        this.holding.dy = 2 * this.dy;
        this.game.entities.push(this.holding);
        this.holding = undefined;
    }

    roll() {
        // TODO: Cooldown?
        if (this.rollCount > 0) {
            return;
        }
        this.rollCount = this.rollTime;
        // IDK if this makes sense.
        this.dx *= this.rollMultiple;
        this.dy *= this.rollMultiple;
    }


}
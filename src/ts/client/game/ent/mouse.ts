import { frameLength } from "../../../common/common";
import { clamp } from "../../../common/util";
import { Game } from "../game";
import { Entity } from "./entity";

const UP_KEYS = ["KeyW", "ArrowUp"];
const DOWN_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];

export class Mouse extends Entity {

    maxWalkSpeed = 200;
    walkAcceleration = 50;
    walkDeacceleration = 20;

    update(dt: number): void {
        // TODO: Make this smooth.
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
            this.dx += xInput * this.walkAcceleration;
            this.dx = clamp(this.dx, -this.maxWalkSpeed, this.maxWalkSpeed);
        }
        else {
            if (this.dx > this.walkDeacceleration) {
                this.dx -= this.walkDeacceleration;
            }
            else if (this.dx < -this.walkDeacceleration) {
                this.dx += this.walkDeacceleration;
            }
            else {
                this.dx = 0;
            }
        }

        if (yInput != 0) {
            this.dy += yInput * this.walkAcceleration;
            this.dy = clamp(this.dy, -this.maxWalkSpeed, this.maxWalkSpeed);
        }
        else {
            if (this.dy > this.walkDeacceleration) {
                this.dy -= this.walkDeacceleration;
            }
            else if (this.dy < -this.walkDeacceleration) {
                this.dy += this.walkDeacceleration;
            }
            else {
                this.dy = 0;
            }
        }

        this.moveX(dt);
        this.moveY(dt)
    }

}
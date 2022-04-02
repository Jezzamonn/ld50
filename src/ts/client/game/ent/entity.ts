import { frameLength, physFromPx, Point, pxFromPhys } from "../../../common/common";
import { Game } from "../game";

const pushSpeed = physFromPx(1 / frameLength);

export class Entity {

    game: Game;
    done: boolean = false;

    x: number = 0;
    y: number = 0;
    z: number = 0;
    dx: number = 0;
    dy: number = 0;
    dz: number = 0;
    gravity: number = physFromPx(10 / frameLength);
    width = physFromPx(10);
    height = physFromPx(10);
    animCount = 0;

    dampAcceleration = physFromPx(10 / frameLength);

    debugColor? = '#fef';

    constructor(game: Game) {
        this.game = game;
    }

    update(dt: number): void {
        this.animCount += dt;

        this.dampX(dt);
        this.dampY(dt);
        this.moveX(dt);
        this.moveY(dt);
        this.moveZ(dt);
    }

    moveX(dt: number): void {
        let pushDir = 0;
        const touchingAtStart = new Set();
        for (const ent of this.game.entities) {
            if (ent !== this && this.canCollideWith(ent)) {
                if (this.isTouching(ent)) {
                    touchingAtStart.add(ent);

                    if (this.midX < ent.midX) {
                        pushDir--;
                    }
                    else {
                        pushDir++;
                    }
                }
            }
        }

        this.x += (this.dx + pushSpeed * pushDir) * dt;
        this.x = Math.round(this.x);

        for (const ent of this.game.entities) {
            if (ent !== this && this.canCollideWith(ent) && !touchingAtStart.has(ent)) {
                if (this.isTouching(ent)) {
                    if (this.dx > 0) {
                        this.maxX = ent.minX;
                    }
                    else if (this.dx < 0) {
                        this.minX = ent.maxX;
                    }
                }
            }
        }
    }

    moveY(dt: number): void {
        let pushDir = 0;
        const touchingAtStart = new Set();
        for (const ent of this.game.entities) {
            if (ent !== this && this.canCollideWith(ent)) {
                if (this.isTouching(ent)) {
                    touchingAtStart.add(ent);

                    if (this.midY < ent.midY) {
                        pushDir--;
                    }
                    else {
                        pushDir++;
                    }
                }
            }
        }

        this.y += (this.dy + pushSpeed * pushDir) * dt;
        this.y = Math.round(this.y);

        for (const ent of this.game.entities) {
            if (ent !== this && this.canCollideWith(ent)) {
                if (this.isTouching(ent)) {
                    if (this.dy > 0) {
                        this.maxY = ent.minY;
                    }
                    else if (this.dy < 0) {
                        this.minY = ent.maxY;
                    }
                }
            }
        }
    }

    moveZ(dt: number): void {
        this.dz += this.gravity * dt;
        this.z += this.dz * dt;
        if (this.z > 0) {
            this.z = 0;
            // Bounce!
            this.dz = -0.2 * this.dz;
        }
    }

    dampX(dt: number): void {
        if (this.dx > this.dampAcceleration * dt) {
            this.dx -= this.dampAcceleration * dt;
        }
        else if (this.dx < -this.dampAcceleration * dt) {
            this.dx += this.dampAcceleration * dt;
        }
        else {
            this.dx = 0;
        }
    }

    dampY(dt: number): void {
        if (this.dy > this.dampAcceleration * dt) {
            this.dy -= this.dampAcceleration * dt;
        }
        else if (this.dy < -this.dampAcceleration * dt) {
            this.dy += this.dampAcceleration * dt;
        }
        else {
            this.dy = 0;
        }
    }

    render(context: CanvasRenderingContext2D): void {
        if (this.debugColor) {
            context.fillStyle = this.debugColor;
            context.fillRect(
                pxFromPhys(this.x),
                pxFromPhys(this.y + this.z),
                pxFromPhys(this.width),
                pxFromPhys(this.height));
        }
    }

    isTouching(other: Entity, margin: number = 0): boolean {
        return (
            this.x + this.width + margin > other.x &&
            this.x - margin < other.x + other.width &&
            this.y + this.height + margin > other.y &&
            this.y - margin < other.y + other.height
        );
    }

    isTouchingPoint(point: Point, margin: number = 0): boolean {
        return (
            this.x + this.width + margin > point.x &&
            this.x - margin < point.x &&
            this.y + this.height + margin > point.y &&
            this.y - margin < point.y
        );
    }

    canCollideWith(other: Entity): boolean {
        return false;
    }

    isOnGround(): boolean {
        return this.z === 0 && this.dz < (0.1 / frameLength);
    }

    get minX(): number {
        return this.x;
    }

    get midX(): number {
        return this.x + this.width / 2;
    }

    get maxX(): number {
        return this.x + this.width;
    }

    get minY(): number {
        return this.y;
    }

    get midY(): number {
        return this.y + this.height / 2;
    }

    get maxY(): number {
        return this.y + this.height;
    }

    set minX(x: number) {
        this.x = x;
    }

    set midX(x: number) {
        this.x = x - this.width / 2;
    }

    set maxX(x: number) {
        this.x = x - this.width;
    }

    set minY(y: number) {
        this.y = y;
    }

    set midY(y: number) {
        this.y = y - this.height / 2;
    }

    set maxY(y: number) {
        this.y = y - this.height;
    }
}
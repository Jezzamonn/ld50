import { frameLength, Point } from "../../../common/common";
import { Game } from "../game";

export class Entity {

    game: Game;
    done: boolean = false;

    x: number = 0;
    y: number = 0;
    z: number = 0;
    dx: number = 0;
    dy: number = 0;
    dz: number = 0;
    gravity: number = 10 / frameLength;
    width = 10;
    height = 10;

    dampAcceleration = 10 / frameLength;

    debugColor = '#fef';

    constructor(game: Game) {
        this.game = game;
    }

    update(dt: number): void {
        this.dampX(dt);
        this.dampY(dt);
        this.moveX(dt);
        this.moveY(dt);
        this.moveZ(dt);
    }

    moveX(dt: number): void {
        this.x += this.dx * dt;
    }

    moveY(dt: number): void {
        this.y += this.dy * dt;
    }

    moveZ(dt: number): void {
        this.dz += this.gravity * dt;
        this.z += this.dz * dt;
        if (this.z > 0) {
            this.z = 0;
            // Bounce!
            this.dz = -0.5 * this.dz;
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
            context.fillRect(this.x, this.y + this.z, this.width, this.height);
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
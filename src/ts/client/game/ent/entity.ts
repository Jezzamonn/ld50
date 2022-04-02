import { frameLength, Point } from "../../../common/common";
import { Game } from "../game";

export class Entity {

    game: Game;
    done: boolean = false;

    x: number = 0;
    y: number = 0;
    dx: number = 0;
    dy: number = 0;
    width = 10;
    height = 10;

    dampAmount = 7;

    debugColor = '#fef';

    constructor(game: Game) {
        this.game = game;
    }

    update(dt: number): void {
        this.dampX(dt);
        this.dampY(dt);
        this.moveX(dt);
        this.moveY(dt);
    }

    moveX(dt: number): void {
        this.x += this.dx * dt;
    }

    moveY(dt: number): void {
        this.y += this.dy * dt;
    }

    dampX(dt: number): void {
        this.dx *= Math.exp(-this.dampAmount * dt);
    }

    dampY(dt: number): void {
        this.dy *= Math.exp(-this.dampAmount * dt);
    }

    render(context: CanvasRenderingContext2D): void {
        if (this.debugColor) {
            context.fillStyle = this.debugColor;
            context.fillRect(this.x, this.y, this.width, this.height);
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
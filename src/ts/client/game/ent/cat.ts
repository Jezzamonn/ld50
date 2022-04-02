import { frameLength } from "../../../common/common";
import { Game } from "../game";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { Mouse } from "./mouse";

export class Cat extends Entity {

    moveSpeed = 1 / frameLength;

    constructor(game: Game) {
        super(game);

        this.width = 50;
        this.height = 50;
        this.pushIfTouching = false;
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Mouse || other instanceof Holdable;
    }

    update(dt: number): void {
        this.dy = this.moveSpeed;

        this.moveY(dt);
    }
}
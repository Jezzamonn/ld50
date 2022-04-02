import { frameLength, physFromPx, physScale } from "../../../common/common";
import { Game } from "../game";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { Mouse } from "./mouse";

export class Cat extends Entity {

    moveSpeed = physFromPx(0.3 / frameLength);

    constructor(game: Game) {
        super(game);

        this.width = physFromPx(50);
        this.height = physFromPx(50);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Mouse || other instanceof Holdable;
    }

    update(dt: number): void {
        this.dy = this.moveSpeed;

        this.moveY(dt);
    }
}
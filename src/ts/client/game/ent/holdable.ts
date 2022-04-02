import { frameLength, physFromPx } from "../../../common/common";
import { Game } from "../game";
import { Cat } from "./cat";
import { Entity } from "./entity";

export class Holdable extends Entity {
    constructor(game: Game) {
        super(game);

        this.debugColor = '#3e8948'

        this.dampAcceleration = physFromPx(20 / frameLength);
    }

    update(dt: number): void {
        this.animCount += dt;

        if (this.z > -0.1) {
            this.dampX(dt);
            this.dampY(dt);
        }
        this.moveX(dt);
        this.moveY(dt);
        this.moveZ(dt);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat;
    }
}
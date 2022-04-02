import { frameLength } from "../../../common/common";
import { Game } from "../game";
import { Cat } from "./cat";
import { Entity } from "./entity";

export class Holdable extends Entity {
    constructor(game: Game) {
        super(game);

        this.debugColor = '#3e8948'
    }

    get othersCanCollide(): boolean {
        return this.z === 0 && this.dz < (0.1 / frameLength);
    }

    canCollideWith(other: Entity): boolean {
        return other instanceof Cat;
    }
}
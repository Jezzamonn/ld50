import { Game } from "../game";
import { Entity } from "./entity";

export class Holdable extends Entity {
    constructor(game: Game) {
        super(game);

        this.debugColor = '#3e8948'
    }
}
import { Game } from "../game";
import { Entity } from "./entity";

export class Cat extends Entity {

    constructor(game: Game) {
        super(game);

        this.width = 50;
        this.height = 50;
    }
}
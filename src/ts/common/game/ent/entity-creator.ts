import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Decor } from "./decor";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { Mouse } from "./mouse";
import { Tree } from "./tree";

export function createEntityFromObject(game: EntityList, obj: any) {
    let entity: Entity | undefined;
    switch (obj.type) {
        case "cat":
            entity = new Cat(game, obj.id);
            break;
        case "mouse":
            entity = new Mouse(game, obj.id);
            break;
        case "tree":
            entity = new Tree(game, obj.id);
            break;
        case "decor":
            entity = new Decor(game, obj.id);
            break;
        case "holdable":
            entity = new Holdable(game, obj.id);
            break;
        default:
            console.error(`Unknown entity type: ${obj.type}`);
            return undefined;
    }
    entity.updateFromObject(obj);
    return entity;
}
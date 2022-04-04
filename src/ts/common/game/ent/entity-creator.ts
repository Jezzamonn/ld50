import { EntityList } from "../entity-list";
import { Cat } from "./cat";
import { Decor } from "./decor";
import { Entity } from "./entity";
import { Holdable } from "./holdable";
import { House } from "./house";
import { Mon } from "./mon";
import { Mouse } from "./mouse";
import { Path } from "./path";
import { Timer } from "./timer";
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
        case "house":
            entity = new House(game, obj.id);
            break;
        case "path":
            entity = new Path(game, obj.id);
            break;
        case "timer":
            entity = new Timer(game, obj.id);
            break;
        case "mon":
            entity = new Mon(game, obj.id);
            break;
        default:
            console.error(`Unknown entity type: ${obj.type}`);
            return undefined;
    }
    entity.updateFromObject(obj);
    return entity;
}
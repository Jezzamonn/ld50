import { Entity } from "../common/game/ent/entity";
import { EntityList } from "../common/game/entity-list";

export class ServerGame implements EntityList {
    entities: Entity[] = [];

    update(dt: number): void {
        for (const ent of this.entities) {
            ent.update(dt);
        }
    }
}
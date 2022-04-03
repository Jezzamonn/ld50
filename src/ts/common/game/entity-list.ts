import { Entity } from "./ent/entity";

export interface EntityList {
    entities: Entity[];

    // On the client: Entities to send to the server.
    // On the server: unused.
    toUpdate: Entity[];
}
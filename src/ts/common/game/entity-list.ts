import { Entity } from "./ent/entity";

// TODO: Rename to base game or something
// TODO: Put sounds in here so we can use null sounds or something on the server.
export interface EntityList {
    entities: Entity[];

    // On the client: Entities to send to the server.
    // On the server: unused.
    toUpdate: Entity[];

    gameOver: boolean;

    isServer: boolean;

    rng: () => number;
}
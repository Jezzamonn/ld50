import { ACTION_KEYS, MUTE_KEYS, physFromPx, physFromSpritePx, physScale, pxFromPhys, pxGameHeight, pxGameWidth, pxWorldHeight, pxWorldWidth } from "../../common/common";
import { RegularKeys } from "../../common/keys";
import { choose, lerp, rgb } from "../../common/util";
import { Cat } from "../../common/game/ent/cat";
import { Decor } from "../../common/game/ent/decor";
import { Entity } from "../../common/game/ent/entity";
import { Holdable, holdableTypes } from "../../common/game/ent/holdable";
import { Mouse } from "../../common/game/ent/mouse";
import { Tree } from "../../common/game/ent/tree";
import { v4 as uuidv4 } from "uuid";
import { createEntityFromObject } from "../../common/game/ent/entity-creator";
import { House } from "../../common/game/ent/house";
import { Path } from "../../common/game/ent/path";
import { Sounds } from "../../common/sounds";

export class ClientGame {

    keys: RegularKeys;
    rng: () => number;

    entities: Entity[] = [];
    toUpdate: Entity[] = [];
    decorEntities: Entity[] = [];
    player!: Mouse;

    gameOver = false;
    gameOverCount = 0;

    isServer = false;

    resetFn?: () => void;

    constructor(keys: RegularKeys, rng: () => number) {
        this.keys = keys;
        this.rng = rng;

        this.entities = [];

        this.createPlayer();
    }

    createPlayer() {
        let playerId = sessionStorage.getItem('kitastrophe-player-id');
        if (!playerId) {
            playerId = uuidv4();
            sessionStorage.setItem('kitastrophe-player-id', playerId);
        }

        const mouse = new Mouse(this, playerId);
        if (Math.random() < 0.5) {
            mouse.midX = physFromPx(lerp(0.4 * pxWorldWidth, 0.45 * pxWorldWidth, Math.random()));
        }
        else {
            mouse.midX = physFromPx(lerp(0.55 * pxWorldWidth, 0.6 * pxWorldWidth, Math.random()));
        }
        mouse.minY = physFromPx(lerp(0, 0.1 * pxWorldHeight, Math.random()));
        this.entities.push(mouse);
        this.player = mouse;

        // Client side decor!
        // Add decor
        for (let i = 0; i < 100; i++) {
            const decor = new Decor(this, uuidv4());
            decor.midX = physFromPx(Math.round(this.rng() * pxWorldWidth));
            decor.maxY = physFromPx(Math.round(this.rng() * pxWorldHeight));
            this.decorEntities.push(decor);
        }

        // Path too, what the heck.
        for (let i = 0; i < 8; i++) {
            const path = new Path(this, uuidv4());
            path.midX = physFromPx(pxWorldWidth / 2);
            path.maxY = physFromPx(pxWorldHeight - 200) - i * physFromSpritePx(75);
            this.decorEntities.push(path);
        }
    }

    update(dt: number) {
        if (this.gameOver) {
            this.gameOverCount += dt;
        }

        this.handlePlayerInput(dt);

        for (const ent of this.entities) {
            ent.update(dt);
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent.done) {
                this.entities.splice(i, 1);
                console.log(`Done: ${ent.type} ${ent.id}`);
            }
        }

        this.keys.resetFrame();

        // Slowmo the sound if gameover
        Sounds.updatePlaybackRate(this.gameOver ? 0.5 : 1, dt);
    }

    handlePlayerInput(dt: number) {
        if (this.keys.anyWasPressedThisFrame(ACTION_KEYS)) {
            Sounds.startSongIfNotAlreadyPlaying();
        }
        if (this.gameOverCount > 2 && this.keys.anyWasPressedThisFrame(ACTION_KEYS)) {
            // Reset the game somehow.
            if (this.resetFn) {
                this.resetFn();
            }
        }

        this.player.handleInput(this.keys, dt);
    }

    entityIsQueuedForUpdate(id: string) {
        return this.toUpdate.some(e => e.id === id);
    }

    updateEntitiesFromServer(serverEntities: any) {
        const encounteredIds = new Set<string>();
        for (const serverEntity of serverEntities) {
            encounteredIds.add(serverEntity.id);
            if (serverEntity.id === this.player.id) {
                continue;
            }
            // Also could be more efficient
            if (this.entityIsQueuedForUpdate(serverEntity.id)) {
                continue;
            }
            // TODO: This could be more efficient.
            const existing = this.entities.find(e => e.id === serverEntity.id);
            if (existing) {
                existing.updateFromObject(serverEntity, true);
            }
            else {
                const newEnt = createEntityFromObject(this, serverEntity);
                if (newEnt) {
                    this.entities.push(newEnt);
                }
            }
        }

        for (const ent of this.entities) {
            if (ent === this.player) {
                continue;
            }
            // Also could be more efficient
            if (this.entityIsQueuedForUpdate(ent.id)) {
                continue;
            }
            if (!encounteredIds.has(ent.id)) {
                ent.done = true;
            }
        }
    }

    getServerUpdateData() {
        const data = [];
        if (!this.player.done) {
            data.push(this.player.toObject());
        }
        data.push(...this.toUpdate.map(e => e.toObject()));
        this.toUpdate = [];
        return data;
    }

    render(context: CanvasRenderingContext2D) {
        context.resetTransform();

        this.renderBg(context);

        this.applyCamera(context);

        const allRenderables = [...this.entities, ...this.decorEntities];

        // Sort the entities by y position
        allRenderables.sort((a, b) => a.maxY - b.maxY);

        for (const ent of allRenderables) {
            ent.render(context);
        }
    }

    applyCamera(context: CanvasRenderingContext2D) {
        if (this.player.done || this.gameOver) {
            const cat = this.entities.find(e => e.type === 'cat');
            if (cat) {
                this.centerCameraOn(context, cat);
            }
            else {
                this.centerCameraOn(context, this.player);
            }
        }
        else {
            this.centerCameraOn(context, this.player);
        }
    }

    centerCameraOn(context: CanvasRenderingContext2D, entity: Entity) {
        context.translate(
            pxFromPhys(-entity.midX) + pxGameWidth / 2,
            pxFromPhys(-entity.midY) + pxGameHeight / 2);
    }

    renderBg(context: CanvasRenderingContext2D) {
        context.save();
        context.resetTransform();
        context.fillStyle = '#7dcc6c'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }

    static loadAllImages() {
        Mouse.loadImage();
        Cat.loadImage();
        Holdable.loadImage();
        Tree.loadImage();
        Decor.loadImage();
        House.loadImage();
        Path.loadImage();
    }

    static loadAllSounds() {
        Sounds.loadSound({name: 'explode', path: 'sfx/'});
        Sounds.loadSound({name: 'gameover', path: 'sfx/'});
        Sounds.loadSound({name: 'meow', path: 'sfx/'});
        Sounds.loadSound({name: 'restart', path: 'sfx/'});
        Sounds.loadSound({name: 'walk', path: 'sfx/'});
        Sounds.loadSound({name: 'dash', path: 'sfx/'});

        // For reference, this song is 92.3076923077 seconds long.
        Sounds.loadSound({name: 'main', path: 'music/'});
    }
}
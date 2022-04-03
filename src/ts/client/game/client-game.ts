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
    playerDeadCount = 0;

    get canRespawn() {
        return this.player.done && this.playerDeadCount > 1;
    }

    gameOver = false;
    gameOverCount = 0;

    get canRestart() {
        return this.gameOverCount > 2;
    }

    isServer = false;

    resetFn?: () => void;

    constructor(keys: RegularKeys, rng: () => number) {
        this.keys = keys;
        this.rng = rng;

        this.entities = [];

        this.createPlayer();
        this.createDecor();
    }

    createPlayer() {
        let playerId = localStorage.getItem('kitastrophe-player-id');
        if (!playerId) {
            playerId = uuidv4();
            localStorage.setItem('kitastrophe-player-id', playerId);
        }

        const mouse = new Mouse(this, playerId);
        if (Math.random() < 0.5) {
            mouse.midX = physFromPx(lerp(0.35 * pxWorldWidth, 0.4 * pxWorldWidth, Math.random()));
        }
        else {
            mouse.midX = physFromPx(lerp(0.5 * pxWorldWidth, 0.65 * pxWorldWidth, Math.random()));
        }
        mouse.minY = physFromPx(lerp(0, 0.1 * pxWorldHeight, Math.random()));
        this.entities.push(mouse);
        this.player = mouse;
    }

    createDecor() {
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

        if (this.player.done) {
            this.playerDeadCount += dt;
        }

        const gameOverElem = document.querySelector('.gameover');
        gameOverElem?.classList.toggle('hidden', !this.gameOver);

        const restartElem = document.querySelector('.restart-text');
        restartElem?.classList.toggle('hidden', !this.canRestart);

        const respawnElem = document.querySelector('.respawn-text');
        respawnElem?.classList.toggle('hidden', !(this.canRespawn && !this.canRestart));

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

            if (this.canRestart) {
                if (this.resetFn) {
                    this.resetFn();
                }
            }
            else if (this.canRespawn) {
                this.playerDeadCount = 0;
                this.createPlayer();
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

        const cameraFocus = this.getCameraFocus();
        this.centerCameraOn(context, cameraFocus);
        const centerPoint = {
            x: pxFromPhys(cameraFocus.midX),
            y: pxFromPhys(cameraFocus.midY),
        }

        const allRenderables = [...this.entities, ...this.decorEntities];

        // Sort the entities by y position
        allRenderables.sort((a, b) => a.maxY - b.maxY);

        for (const ent of allRenderables) {
            if (!ent.canRender(centerPoint)) {
                continue;
            }
            ent.render(context);
        }
    }

    getCameraFocus() {
        if (this.player.done || this.gameOver) {
            const cat = this.entities.find(e => e.type === 'cat');
            if (cat) {
                return cat;
            }
        }
        return this.player;
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
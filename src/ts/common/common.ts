export interface Point {
    x: number;
    y: number;
}

export const frameLength = 1 / 60;

export const physScale = 64;

export const pxGameWidth = 800;
export const pxGameHeight = 600;

export const pxWorldWidth = 800 * 2;
export const pxWorldHeight = 600 * 2;

export const spriteScale = 2;

export const UP_KEYS = ["KeyW", "ArrowUp"];
export const DOWN_KEYS = ["KeyS", "ArrowDown"];
export const LEFT_KEYS = ["KeyA", "ArrowLeft"];
export const RIGHT_KEYS = ["KeyD", "ArrowRight"];
export const ACTION_KEYS = ["Space"];

export function physFromPx(px: number): number {
    return px * physScale;
}

export function pxFromPhys(phys: number): number {
    return Math.round(phys / physScale);
}

export function physFromSpritePx(spx: number): number {
    return physFromPx(spx * spriteScale);
}
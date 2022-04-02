export interface Point {
    x: number;
    y: number;
}

export const frameLength = 1 / 60;

export const physScale = 64;

export const pxGameWidth = 800;
export const pxGameHeight = 600;

export const spriteScale = 2;

export function physFromPx(px: number): number {
    return px * physScale;
}

export function pxFromPhys(phys: number): number {
    return Math.round(phys / physScale);
}
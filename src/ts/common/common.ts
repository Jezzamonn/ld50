export interface Point {
    x: number;
    y: number;
}

export const frameLength = 1 / 60;

export const physScale = 64;

export function physFromPx(px: number): number {
    return px * physScale;
}

export function pxFromPhys(phys: number): number {
    return Math.round(phys / physScale);
}
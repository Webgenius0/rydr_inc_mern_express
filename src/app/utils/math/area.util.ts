export function polygonAreaAbs(points: { x: number; y: number }[]) {
    let sum = 0;

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        sum += p1.x * p2.y - p2.x * p1.y;
    }

    return Math.abs(sum) / 2; // mm²
}

export function mm2ToM2(mm2: number) {
    return mm2 / 1_000_000;
}

export function round2(n: number) {
    return Math.round(n * 100) / 100;
}
// MVP: client confirm না থাকায় default mapping
export const SHAPE_LARGE_CUT_MAP: Record<string, number> = {
    SQUARE_PANEL: 0,
    L_PANEL: 1,
    PLUS_PANEL: 4,
    T_PANEL: 2, // temp
    THREE_PANEL_T_LAYOUT: 2, // temp
};

export function getLargeCutCount(shapeName: string) {
    return SHAPE_LARGE_CUT_MAP[shapeName] ?? 0;
}
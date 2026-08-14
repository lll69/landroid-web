export type KitKatPlugin = {
    createDessertCaseView: (c: HTMLCanvasElement) => Promise<[start: () => void, stop: () => void]>;
    createPlatLogoActivity: (c: HTMLCanvasElement, enterDessertCase: () => void) => Promise<[start: () => void, stop: () => void]>;
}

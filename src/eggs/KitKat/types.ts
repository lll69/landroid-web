export type KitKatPlugin = {
    showDessertCaseView: (c: HTMLCanvasElement) => Promise<() => void>;
}

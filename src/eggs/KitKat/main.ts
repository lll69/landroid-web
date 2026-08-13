import { DessertCaseView } from "./DessertCaseView";
import { KitKatPlugin } from "./types";

const { cancelAnimationFrame, requestAnimationFrame } = window;
const { round } = Math;

((window as any).KitKatPlugin as KitKatPlugin) = {
    showDessertCaseView: async (c: HTMLCanvasElement) => {
        const [initAsync, start, stop, tick, onSizeChanged, onClick] = DessertCaseView(c);
        function resize() {
            const { width, height } = c.getBoundingClientRect();
            const ratio = window.devicePixelRatio;
            const cw = round(width * ratio), ch = round(height * ratio);
            c.width = cw;
            c.height = ch;
            onSizeChanged(cw, ch);
        }
        let animFrame = -1;
        function anim(t: number) {
            tick(t);
            animFrame = requestAnimationFrame(anim);
        }
        c.style["webkitTapHighlightColor"] = "transparent";
        c.style.touchAction = "none";
        const handler = (e: MouseEvent) => {
            const { width, height } = c.getBoundingClientRect();
            onClick(e.clientX / width * c.width, e.clientY / height * c.height);
        };
        c.addEventListener("pointerup", handler);
        await initAsync();
        resize();
        new ResizeObserver(resize).observe(c);
        start();
        anim(performance.now());
        return () => {
            stop();
            cancelAnimationFrame(animFrame);
            c.removeEventListener("pointerup", handler);
        };
    },
};

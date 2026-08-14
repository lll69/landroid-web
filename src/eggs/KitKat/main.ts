import { DessertCaseView } from "./DessertCaseView";
import { PlatLogoActivityKitKat } from "./PlatLogoActivity";
import { KitKatPlugin } from "./types";

const { cancelAnimationFrame, requestAnimationFrame } = window;
const { round } = Math;

const DEFAULT_LONG_PRESS_TIMEOUT = 500;

((window as any).KitKatPlugin as KitKatPlugin) = {
    createDessertCaseView: async (c: HTMLCanvasElement) => {
        const [initAsync, start, stop, tick, onSizeChanged, onClick] = DessertCaseView(c);
        let resizeObserver: ResizeObserver | undefined;
        let animFrame = -1;
        function resize() {
            const { width, height } = c.getBoundingClientRect();
            const ratio = window.devicePixelRatio;
            const cw = round(width * ratio), ch = round(height * ratio);
            c.width = cw;
            c.height = ch;
            onSizeChanged(cw, ch);
        }
        function anim(t: number) {
            tick(t);
            animFrame = requestAnimationFrame(anim);
        }
        const handler = (e: MouseEvent) => {
            const { width, height } = c.getBoundingClientRect();
            onClick(e.clientX / width * c.width, e.clientY / height * c.height);
        };
        await initAsync();
        return [
            () => { // start
                c.style["webkitTapHighlightColor"] = "transparent";
                c.style.touchAction = "none";
                c.addEventListener("pointerup", handler);
                resize();
                (resizeObserver = new ResizeObserver(resize)).observe(c);
                start();
                anim(performance.now());
            },
            () => { // stop
                stop();
                if (resizeObserver) resizeObserver.disconnect();
                cancelAnimationFrame(animFrame);
                c.removeEventListener("pointerup", handler);
            }
        ];
    },
    createPlatLogoActivity: async (c: HTMLCanvasElement, enterDessertCase: () => void) => {
        const [initAsync, start, tick, onSizeChanged, onClick] = PlatLogoActivityKitKat(c, enterDessertCase);
        let resizeObserver: ResizeObserver | undefined;
        let animFrame = -1, down = false, longTimeout: any = -1;
        function resize() {
            const { width, height } = c.getBoundingClientRect();
            const ratio = window.devicePixelRatio;
            const cw = round(width * ratio), ch = round(height * ratio);
            c.width = cw;
            c.height = ch;
            onSizeChanged(cw, ch);
        }
        function anim(t: number) {
            tick(t);
            animFrame = requestAnimationFrame(anim);
        }
        function longPress() {
            clearTimeout(longTimeout);
            down = false;
            onClick(true);
        }
        const handler = (e: MouseEvent) => {
            switch (e.type) {
                case "pointerdown":
                    down = true;
                    clearTimeout(longTimeout);
                    longTimeout = setTimeout(longPress, DEFAULT_LONG_PRESS_TIMEOUT);
                    break;
                case "pointercancel":
                    down = false;
                    clearTimeout(longTimeout);
                    break;
                case "pointerup":
                    if (down) {
                        down = false;
                        clearTimeout(longTimeout);
                        onClick(false);
                    }
                    break;
                case "contextmenu":
                    e.preventDefault();
                    break;
            }
        };
        await initAsync();
        return [
            () => { // start
                c.style["webkitTapHighlightColor"] = "transparent";
                c.style.touchAction = "none";
                c.addEventListener("pointerdown", handler);
                c.addEventListener("pointerup", handler);
                c.addEventListener("pointercancel", handler);
                c.addEventListener("contextmenu", handler);
                resize();
                (resizeObserver = new ResizeObserver(resize)).observe(c);
                start();
                anim(performance.now());
            },
            () => { // stop
                if (resizeObserver) resizeObserver.disconnect();
                cancelAnimationFrame(animFrame);
                clearTimeout(longTimeout);
                c.removeEventListener("pointerdown", handler);
                c.removeEventListener("pointerup", handler);
                c.removeEventListener("pointercancel", handler);
                c.removeEventListener("contextmenu", handler);
            }
        ];
    },
};

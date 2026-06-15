/*
 * Copyright (C) 2010 The Android Open Source Project
 * Copyright (C) 2012 The Android Open Source Project
 * Copyright 2025-2026 lll69
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import j_jandycane from "../imgs/j_jandycane";
import j_redbean0 from "../imgs/j_redbean0";
import j_redbean1 from "../imgs/j_redbean1";
import j_redbean2 from "../imgs/j_redbean2";
import j_redbeandroid from "../imgs/j_redbeandroid";
const { cos, floor, PI, random, sin, sqrt, trunc } = Math;
const { requestAnimationFrame, cancelAnimationFrame } = window;

/**
 * Defines the default duration in milliseconds before a press turns into
 * a long press
 */
const DEFAULT_LONG_PRESS_TIMEOUT = 500;

let isPressed = false;
let longPressTimeout: any;
const content = document.querySelector("img")!;

function longPress() {
    isPressed = false;
    content.remove();
    loadAsync();
}

function onTouch(e: PointerEvent | TouchEvent) {
    switch (e.type) {
        case "pointerdown":
            e.preventDefault();
            isPressed = true;
            clearTimeout(longPressTimeout);
            longPressTimeout = setTimeout(longPress, DEFAULT_LONG_PRESS_TIMEOUT);
            content.setPointerCapture((e as PointerEvent).pointerId);
            break;
        case "touchstart":
            e.preventDefault();
            isPressed = true;
            clearTimeout(longPressTimeout);
            longPressTimeout = setTimeout(longPress, DEFAULT_LONG_PRESS_TIMEOUT);
            break;
        case "pointerup":
        case "touchend":
            e.preventDefault();
            if (isPressed) {
                isPressed = false;
                clearTimeout(longPressTimeout);
                content.src = "j_platlogo.webp";
                setTimeout(() => alert("Android 4." + (floor(random() * 3) + 1) + "\nJELLY BEAN"), 0);
            }
            break;
        case "pointercancel":
        case "touchcancel":
            e.preventDefault();
            if (isPressed) {
                isPressed = false;
                clearTimeout(longPressTimeout);
            }
            break;
    }
}

content.addEventListener("pointerdown", onTouch);
content.addEventListener("pointerup", onTouch);
content.addEventListener("pointercancel", onTouch);
content.addEventListener("touchstart", onTouch);
content.addEventListener("touchend", onTouch);
content.addEventListener("touchcancel", onTouch);
document.body.addEventListener("contextmenu", e => e.preventDefault());

function lerp(a: number, b: number, f: number): number {
    return (b - a) * f + a;
}

function randfrange(a: number, b: number): number {
    return lerp(a, b, random());
}

function randsign(): number {
    return random() >= 0.5 ? 1 : -1;
}

function flip() {
    return random() >= 0.5;
}

function pick<E>(array: Array<E>): E | null {
    if (array.length === 0) return null;
    return array[floor(random() * array.length)];
}

function mag(x: number, y: number) {
    return sqrt(x * x + y * y);
}

function clamp(x: number, a: number, b: number) {
    return ((x < a) ? a : ((x > b) ? b : x));
}

const createElementNS: typeof document.createElementNS = document.createElementNS.bind(document);
const mainDiv = document.getElementById("main") as HTMLDivElement;

const NUM_BEANS = 40;
const MIN_SCALE = 0.2;
const MAX_SCALE = 1;

const LUCKY = 0.001;

const MAX_RADIUS = 576 * MAX_SCALE;

const imgMap = {
    "j_redbean0": j_redbean0,
    "j_redbean1": j_redbean1,
    "j_redbean2": j_redbean2,
    "j_redbeandroid": j_redbeandroid,
    "j_jandycane": j_jandycane,
};

const widthMap = {
    "j_redbean0": 256,
    "j_redbean1": 256,
    "j_redbean2": 256,
    "j_redbeandroid": 256,
    "j_jandycane": 131,
};

const heightMap = {
    "j_redbean0": 256,
    "j_redbean1": 256,
    "j_redbean2": 256,
    "j_redbeandroid": 256,
    "j_jandycane": 256,
};

const BEANS = [
    "j_redbean0",
    "j_redbean0",
    "j_redbean0",
    "j_redbean0",
    "j_redbean1",
    "j_redbean1",
    "j_redbean2",
    "j_redbean2",
    "j_redbeandroid",
];

const COLORS = [
    0xFF00CC00,
    0xFFCC0000,
    0xFF0000CC,
    0xFFFFFF00,
    0xFFFF8000,
    0xFF00CCFF,
    0xFFFF0080,
    0xFF8000FF,
    0xFFFF8080,
    0xFF8080FF,
    0xFFB0C0D0,
    0xFFDDDDDD,
    0xFF333333,
];
const COLOR_IDS = [
    "FxFF00CC00",
    "FxFFCC0000",
    "FxFF0000CC",
    "FxFFFFFF00",
    "FxFFFF8000",
    "FxFF00CCFF",
    "FxFFFF0080",
    "FxFF8000FF",
    "FxFFFF8080",
    "FxFF8080FF",
    "FxFFB0C0D0",
    "FxFFDDDDDD",
    "FxFF333333",
];

const svgNS = "http://www.w3.org/2000/svg";
const filterSvgEl = createElementNS(svgNS, "svg");
function createColorFilters() {
    const svgEl = filterSvgEl;
    // @ts-ignore
    svgEl.setAttribute("width", 0);
    // @ts-ignore
    svgEl.setAttribute("height", 0);
    svgEl.style.display = "none";
    const defsEl = createElementNS(svgNS, "defs");
    svgEl.appendChild(defsEl);
    for (let i = 0; i < COLORS.length; i++) {
        const filterEl = createElementNS(svgNS, "filter");
        filterEl.id = COLOR_IDS[i];
        const color = COLORS[i];
        const cmEl = createElementNS(svgNS, "feColorMatrix");
        cmEl.setAttribute("type", "matrix");
        const r = ((color & 0x00FF0000) >> 16) / 0xFF;
        const g = ((color & 0x0000FF00) >> 8) / 0xFF;
        const b = ((color & 0x000000FF)) / 0xFF;
        cmEl.setAttribute("values", `${r} 0 0 0 0 ${g} 1 0 0 0 ${b} 0 1 0 0 0 0 0 1 0`);
        filterEl.appendChild(cmEl);
        defsEl.appendChild(filterEl);
    }
    //document.body.appendChild(svgEl);
}

const imageDataMap: { [name: string]: ImageData } = {};

function b64ToBlob(b64: string) {
    const resultStr = atob(b64.substring("data:image/webp;base64,".length));
    const resultLen = resultStr.length;
    const resultArr = new Uint8Array(resultLen);
    for (let i = 0; i < resultLen; i++) {
        resultArr[i] = resultStr.charCodeAt(i);
    }
    return new Blob([resultArr], { type: "image/webp" });
}

async function createImageData() {
    const canvasEl: HTMLCanvasElement = document.createElement("canvas");
    const ctx = canvasEl.getContext("2d", { willReadFrequently: true })!;
    for (const name in imgMap) {
        const imgData: string = imgMap[name];
        const imgBitmap = await createImageBitmap(b64ToBlob(imgData));
        const width = imgBitmap.width;
        const height = imgBitmap.height;
        canvasEl.width = width;
        canvasEl.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(imgBitmap, 0, 0);
        const resultData = ctx.getImageData(0, 0, width, height);
        imageDataMap[name] = resultData;
    }
}

function getColorARGBForCoord(image: ImageData, x: number, y: number) {
    const red = y * (image.width * 4) + x * 4;
    const data = image.data;
    return (data[red] << 16) | (data[red + 1] << 8) | (data[red + 2]) | (data[red + 3] << 24);
}

class Bean {
    x: number;
    y: number;
    a: number;

    va: number;
    vx: number;
    vy: number;

    r: number;

    z: number;

    h: number;
    w: number;

    grabbed = false;
    grabx: number;
    graby: number;
    //grabtime: number;
    grabx_offset: number;
    graby_offset: number;

    board: Board;
    imgData: ImageData;
    svgEl: SVGSVGElement;

    setX: number = 0;
    setY: number = 0;
    setRotation: number = 0;
    setScale: number = 1;

    constructor(board: Board) {
        this.board = board;
        this.svgEl = createElementNS(svgNS, "svg");
        const handler = this.onTouchEvent.bind(this);
        this.svgEl.addEventListener("pointermove", handler);
        this.svgEl.addEventListener("pointercancel", handler);
        this.svgEl.addEventListener("pointerup", handler);
        (this.svgEl as any).dataBean = this;
    }

    private pickBean() {
        let beanId = pick(BEANS)!;
        if (randfrange(0, 1) <= LUCKY) {
            beanId = "j_jandycane";
        }
        const imgData: string = imgMap[beanId];
        const imgWidth: number = widthMap[beanId];
        const imgHeight: number = heightMap[beanId];
        this.w = imgWidth;
        this.h = imgHeight;
        const svgNS = "http://www.w3.org/2000/svg";
        const svgEl = this.svgEl;
        svgEl.style.position = "fixed";
        svgEl.style.touchAction = "none";
        svgEl.innerHTML = "";
        // @ts-ignore
        svgEl.setAttribute("width", imgWidth);
        // @ts-ignore
        svgEl.setAttribute("height", imgHeight);
        svgEl.setAttribute("viewBox", `0 0 ${imgWidth} ${imgHeight}`);
        const imageEl = createElementNS(svgNS, "image");
        svgEl.appendChild(imageEl);
        imageEl.setAttribute("href", imgData);
        // @ts-ignore
        imageEl.setAttribute("width", imgWidth);
        // @ts-ignore
        imageEl.setAttribute("height", imgHeight);
        // bean.setTargetDensity(480);// fix Bean size
        if (beanId !== "j_jandycane") {
            const color = pick(COLOR_IDS)!;
            imageEl.setAttribute("filter", `url(#${color})`);
            svgEl.appendChild(filterSvgEl.getElementById(color)!.cloneNode(true));
        } else {
            imageEl.setAttribute("filter", "");
        }
        this.imgData = imageDataMap[beanId];
        this.svgEl = svgEl;
    }

    public reset() {
        this.pickBean();

        const scale = lerp(MIN_SCALE, MAX_SCALE, this.z);
        this.setScale = scale;

        this.r = 0.3 * Math.max(this.h, this.w) * scale;

        this.a = (randfrange(0, 360));
        this.va = randfrange(-30, 30);

        this.vx = randfrange(-40, 40) * this.z;
        this.vy = randfrange(-40, 40) * this.z;
        const boardh = this.board.height;
        const boardw = this.board.width;
        console.log("BeanBag", "reset: w=", this.w, "h=", this.h);
        if (flip()) {
            this.x = (this.vx < 0 ? boardw + 2 * this.r : -this.r * 4);
            this.y = (randfrange(0, boardh - 3 * this.r) * 0.5 + ((this.vy < 0) ? boardh * 0.5 : 0));
        } else {
            this.y = (this.vy < 0 ? boardh + 2 * this.r : -this.r * 4);
            this.x = (randfrange(0, boardw - 3 * this.r) * 0.5 + ((this.vx < 0) ? boardw * 0.5 : 0));
        }
    }

    public update(dt: number) {
        if (this.grabbed) {
            // final float interval = (SystemClock.uptimeMillis() - grabtime) / 1000f;
            this.vx = (this.vx * 0.75) + ((this.grabx - this.x) / dt) * 0.25;
            this.x = this.grabx;
            this.vy = (this.vy * 0.75) + ((this.graby - this.y) / dt) * 0.25;

            this.y = this.graby;
        } else {
            this.x = (this.x + this.vx * dt);
            this.y = (this.y + this.vy * dt);
            this.a = (this.a + this.va * dt);
        }
    }

    /* overlap has never been used
    public overlap(other: Bean) {
        const dx = (this.x - other.x);
        const dy = (this.y - other.y);
        return mag(dx, dy) - this.r - other.r;
    }*/

    // Changed
    // filter touch events for transparent pixels.
    isTouchedBean(ex: number, ey: number) {
        const imgData = this.imgData;
        if (!imgData) return false;
        const sx = imgData.width / (this.w/* * this.setScale*/);
        const sy = imgData.height / (this.h/* * this.setScale*/);
        const x = trunc(ex * sx);
        const y = trunc(ey * sy);
        if (x < 0 || y < 0 || x > imgData.width || y > imgData.height) {
            return false;
        }
        const color = getColorARGBForCoord(imgData, x, y);
        return (color >>> 24) > 0;
    }

    public onTouchEvent(e: PointerEvent) {
        switch (e.type) {
            case "pointerdown":
                // called from Board
                // if (!this.isTouchedBean(e.offsetX, e.offsetY)) {
                //     break;
                // }
                this.svgEl.setPointerCapture(e.pointerId);
                this.grabbed = true;
                this.grabx_offset = e.pageX - this.x;
                this.graby_offset = e.pageY - this.y;
                this.va = 0;
            // fall
            case "pointermove":
                this.grabx = e.pageX - this.grabx_offset;
                this.graby = e.pageY - this.graby_offset;
                //this.grabtime = e.timeStamp;
                break;
            case "pointercancel":
            case "pointerup":
                this.grabbed = false;
                const a = randsign() * clamp(mag(this.vx, this.vy) * 0.33, 0, 1080);
                this.va = randfrange(a * 0.5, a);
                break;
        }
    }

    getPivotX() {
        return this.w / 2;
    }

    getPivotY() {
        return this.h / 2;
    }
}

class Board {
    beans: Array<Bean> = [];
    width: number;
    height: number;
    mAnim: number | undefined;
    dispatching = false;

    constructor() {
        const clientRect = document.body.getBoundingClientRect();
        this.width = clientRect.width;
        this.height = clientRect.height;
    }

    removeAllViews() {
        this.beans.forEach(child => child.svgEl.remove());
        this.beans.length = 0;
    }

    private reset() {
        //android.util.Log.d("Nyandroid", "board reset");
        this.removeAllViews();

        for (let i = 0; i < NUM_BEANS; i++) {
            const nv = new Bean(this);
            this.beans.push(nv);
            mainDiv.appendChild(nv.svgEl);
            nv.z = (i / NUM_BEANS);
            nv.z *= nv.z;
            nv.reset();
            nv.x = (randfrange(0, this.width));
            nv.y = (randfrange(0, this.height));
        }

        if (this.mAnim !== undefined) {
            cancelAnimationFrame(this.mAnim);
        }

        let lastTime = performance.now();
        const animation = (totalTime: number) => {
            const deltaTime = totalTime - lastTime;
            lastTime = totalTime;
            this.onTimeUpdate(deltaTime);
            this.updateViews();
            this.mAnim = requestAnimationFrame(animation);
        }
        return animation;
    }

    onTimeUpdate(deltaTime: number) {
        const beans = this.beans;
        const len = beans.length;
        for (let i = 0; i < len; i++) {
            const nv = beans[i];
            nv.update(deltaTime / 1000);

            /* overlap has never been used
            for (let j = i + 1; j < len; j++) {
                const nv2 = beans[j];
                const overlap = nv.overlap(nv2);
            }*/

            nv.setRotation = (nv.a);
            nv.setX = (nv.x - nv.getPivotX());
            nv.setY = (nv.y - nv.getPivotY());

            if (nv.x < -MAX_RADIUS
                || nv.x > this.width + MAX_RADIUS
                || nv.y < -MAX_RADIUS
                || nv.y > this.height + MAX_RADIUS) {
                nv.reset();
            }
        }
    }

    updateViews() {
        for (const b of this.beans) {
            const el = b.svgEl;
            // @ts-ignore
            el.setAttribute("width", b.w);
            // @ts-ignore
            el.setAttribute("height", b.h);
            el.style.transform = `translate(${b.setX}px,${b.setY}px) rotate(${b.setRotation}deg) scale(${b.setScale})`;
        }
    }

    onSizeChanged(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    startAnimation() {
        this.stopAnimation();
        const animation = this.reset();
        this.mAnim = requestAnimationFrame(animation);
    }

    stopAnimation() {
        if (this.mAnim !== undefined) {
            cancelAnimationFrame(this.mAnim);
            this.mAnim = undefined;
        }
    }

    onPointerDown(e: PointerEvent) {
        if (this.dispatching) return;
        for (const element of document.elementsFromPoint(e.clientX, e.clientY)) {
            const bean = (element as any).dataBean;
            if (bean instanceof Bean) {
                const centerX = bean.setX + bean.getPivotX();
                const centerY = bean.setY + bean.getPivotY();
                const r1 = e.clientX - centerX;
                const i1 = e.clientY - centerY;
                const angle = bean.setRotation * PI / 180;
                const r2 = cos(-angle), i2 = sin(-angle);
                const rotatedOffX = r1 * r2 - i1 * i2;
                const rotatedOffY = r1 * i2 + r2 * i1;
                const viewX = (bean.getPivotX() + rotatedOffX / bean.setScale);
                const viewY = (bean.getPivotY() + rotatedOffY / bean.setScale);
                if (bean.isTouchedBean(viewX, viewY)) {
                    this.dispatching = true;
                    bean.onTouchEvent(e);
                    this.dispatching = false;
                    return;
                }
            }
        }
    }
}

async function loadAsync() {
    await createImageData();
    createColorFilters();
    const board = new Board();
    mainDiv.addEventListener("pointerdown", board.onPointerDown.bind(board));
    new ResizeObserver(function () {
        const clientRect = document.body.getBoundingClientRect();
        board.onSizeChanged(clientRect.width, clientRect.height);
    }).observe(document.body);
    board.startAnimation();
}

export { };

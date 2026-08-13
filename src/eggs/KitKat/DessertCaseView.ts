/*
 * Copyright (C) 2013 The Android Open Source Project
 * Copyright 2026 lll69
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

import k_dessert_android from "../imgs/k_dessert_android";
import k_dessert_cupcake from "../imgs/k_dessert_cupcake";
import k_dessert_dandroid from "../imgs/k_dessert_dandroid";
import k_dessert_donut from "../imgs/k_dessert_donut";
import k_dessert_donutburger from "../imgs/k_dessert_donutburger";
import k_dessert_eclair from "../imgs/k_dessert_eclair";
import k_dessert_flan from "../imgs/k_dessert_flan";
import k_dessert_froyo from "../imgs/k_dessert_froyo";
import k_dessert_gingerbread from "../imgs/k_dessert_gingerbread";
import k_dessert_honeycomb from "../imgs/k_dessert_honeycomb";
import k_dessert_ics from "../imgs/k_dessert_ics";
import k_dessert_jandycane from "../imgs/k_dessert_jandycane";
import k_dessert_jellybean from "../imgs/k_dessert_jellybean";
import k_dessert_keylimepie from "../imgs/k_dessert_keylimepie";
import k_dessert_kitkat from "../imgs/k_dessert_kitkat";
import k_dessert_petitfour from "../imgs/k_dessert_petitfour";
import k_dessert_zombiegingerbread from "../imgs/k_dessert_zombiegingerbread";
import { AccelerateInterpolator } from "../shared/AccelerateInterpolator";
import { DecelerateInterpolator } from "../shared/DecelerateInterpolator";
import { IAnimatableView } from "../shared/IAnimatableView";
import { SkHSVToColor } from "../shared/SkColor";
import { ViewAnimation } from "../shared/ViewAnimation";

const { clearTimeout, createImageBitmap, parseFloat, performance, setTimeout } = window;
const { imul, max, min, PI, random, random: frand, trunc } = Math;
const now = performance.now.bind(performance);

const START_DELAY = 5000;
const DELAY = 2000;
const DURATION = 500;
const k_dessert_case_cell_size = 192;
const SCALE = 0.25; // natural display size will be SCALE*mCellSize
const PROB_2X = 0.33;
const PROB_3X = 0.1;
const PROB_4X = 0.01;

const PASTRIES = [
    k_dessert_kitkat,      // used with permission
    k_dessert_android,     // thx irina
];

const PASTRIES_INDEX = [
    0,
    1,
];

const RARE_PASTRIES = [
    k_dessert_cupcake,     // 2009
    k_dessert_donut,       // 2009
    k_dessert_eclair,      // 2009
    k_dessert_froyo,       // 2010
    k_dessert_gingerbread, // 2010
    k_dessert_honeycomb,   // 2011
    k_dessert_ics,         // 2011
    k_dessert_jellybean,   // 2012
];

const RARE_PASTRIES_INDEX = [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
];

const XRARE_PASTRIES = [
    k_dessert_petitfour,   // the original and still delicious

    k_dessert_donutburger, // remember kids, this was long before cronuts

    k_dessert_flan,
    //     sholes final approach
    //     landing gear punted to flan
    //     runway foam glistens
    //         -- mcleron

    k_dessert_keylimepie,  // from an alternative timeline
];

const XRARE_PASTRIES_INDEX = [
    10,
    11,
    12,
    13,
];

const XXRARE_PASTRIES = [
    k_dessert_zombiegingerbread, // thx hackbod
    k_dessert_dandroid,    // thx morrildl
    k_dessert_jandycane,   // thx nes
];

const XXRARE_PASTRIES_INDEX = [
    14,
    15,
    16,
];

const NUM_PASTRIES = PASTRIES.length + RARE_PASTRIES.length
    + XRARE_PASTRIES.length + XXRARE_PASTRIES.length;

function b64ToBlob(b64: string) {
    if (!b64.startsWith("data:image/webp;base64,")) throw new Error("Invalid WEBP: " + b64.substring(0, "data:image/webp;base64,".length));
    const resultStr = atob(b64.substring("data:image/webp;base64,".length));
    const resultLen = resultStr.length;
    const resultArr = new Uint8Array(resultLen);
    for (let i = 0; i < resultLen; i++) {
        resultArr[i] = resultStr.charCodeAt(i);
    }
    return new Blob([resultArr], { type: "image/webp" });
}

function frand2(a: number, b: number) {
    return (frand() * (b - a) + a);
}

function irand(a: number, b: number) {
    return trunc(frand2(a, b));
}

function pick<T>(a: T[]): T {
    return a[trunc(random() * a.length)];
}

const hsv = [0, 1, .85];

function random_color() {
    //  return 0xFF000000 | (int) (Math.random() * (float) 0xFFFFFF); // totally random
    const COLORS = 12;
    hsv[0] = imul(irand(0, COLORS), trunc(360 / COLORS));
    return SkHSVToColor(255, hsv);
}

function colorToRgbaString(color: number) {
    return "rgba(" +
        ((color >>> 16) & 0xff) + "," +
        ((color >>> 8) & 0xff) + "," +
        ((color) & 0xff) + "," +
        (((color >>> 24) & 0xff) / 0xff) + ")";
}

function strToPoint(str: string) {
    const parts = str.split(",");
    return [parseFloat(parts[0]), parseFloat(parts[1])];
}

function pointToStr(point: number[]) {
    return point[0] + "," + point[1];
}

class ChildView implements IAnimatableView {
    onClick?: (() => void);
    bgColorRgba: number[];
    drawable?: ImageBitmap;
    span: number;
    pos?: number[];

    currX: number;
    currY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    alpha: number;

    startAnim: (anim: ViewAnimation) => void;
    currentAnim?: ViewAnimation;

    constructor(startAnim: (anim: ViewAnimation) => void) {
        this.bgColorRgba = [0, 0, 0, 0];
        this.span = 0;

        this.currX = 0;
        this.currY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.alpha = 1;

        this.startAnim = startAnim;
    }

    animate() {
        if (this.currentAnim) {
            this.currentAnim.cancel();
        }
        return this.currentAnim = new ViewAnimation(this);
    }
}

export function DessertCaseView(canvas: HTMLCanvasElement) {
    let mStarted = false;
    let mCellSize = 0;
    let mWidth = 0, mHeight = 0;
    let mRows = 0, mColumns = 0;
    let mJuggleTimeout: any = -1;
    let canvasScale = 1;
    const mDrawables = Array<ImageBitmap>(NUM_PASTRIES);
    let mCells: (ChildView | undefined)[] = [];
    const mFreeList = new Set<string>();
    const ctx = canvas.getContext("2d")!;
    const children: ChildView[] = [];
    const animList: ViewAnimation[] = [];

    function getChildCount() {
        return children.length;
    }

    function getChildAt(index: number) {
        return children[index];
    }

    function removeAllViewsInLayout() {
        children.length = 0;
    }

    function addView(child: ChildView) {
        children.push(child);
    }

    function bringChildToFront(child: ChildView) {
        const idx = children.indexOf(child);
        if (idx != -1) {
            children.splice(idx, 1);
            children.push(child);
        }
    }

    function removeView(child: ChildView) {
        const idx = children.indexOf(child);
        if (idx != -1) {
            children.splice(idx, 1);
        }
    }

    function mJuggle() {
        const N = getChildCount();
        if (N > 0) {
            const K = 1; //irand(1,3);
            for (let i = 0; i < K; i++) {
                const child = getChildAt(trunc(random() * N));
                place2(child, true);
            }

            fillFreeList0();
        }

        if (mStarted) {
            mJuggleTimeout = setTimeout(mJuggle, DELAY);
        }
    }

    async function initAsync() {
        mStarted = false;
        mCellSize = trunc(k_dessert_case_cell_size * (window.devicePixelRatio || 1));

        const canvasInit: HTMLCanvasElement = document.createElement("canvas");
        canvasInit.width = canvasInit.height = mCellSize;
        const ctxInit = canvasInit.getContext("2d", { willReadFrequently: true })!;
        let i = 0;
        for (const list of [PASTRIES, RARE_PASTRIES, XRARE_PASTRIES, XXRARE_PASTRIES]) {
            for (const res of list) {
                const blob = b64ToBlob(res);
                const loaded = await createImageBitmap(blob);
                ctxInit.clearRect(0, 0, mCellSize, mCellSize);
                ctxInit.drawImage(loaded, 0, 0, mCellSize, mCellSize);
                loaded.close();
                mDrawables[i++] = await convertToAlphaMaskAsync(ctxInit);
            }
        }
    }

    function getPixelR(image: ImageData, x: number, y: number) {
        const red = y * (image.width * 4) + x * 4;
        const data = image.data;
        return data[red];
    }

    function setPixel(image: ImageData, x: number, y: number, pixel: number) {
        const red = y * (image.width * 4) + x * 4;
        const data = image.data;
        data[red + 3] = (pixel >>> 24) & 0xff;
        data[red] = (pixel >>> 16) & 0xff;
        data[red + 1] = (pixel >>> 8) & 0xff;
        data[red + 2] = (pixel) & 0xff;
    }

    async function convertToAlphaMaskAsync(ctxInit: CanvasRenderingContext2D) {
        const imgData = ctxInit.getImageData(0, 0, mCellSize, mCellSize);
        for (let i = 0; i < mCellSize; i++) {
            for (let j = 0; j < mCellSize; j++) {
                const alpha = getPixelR(imgData, i, j);
                setPixel(imgData, i, j, (alpha << 24) | 0xffffff);
            }
        }
        return await createImageBitmap(imgData);
    }

    function start() {
        if (!mStarted) {
            mStarted = true;
            fillFreeList(DURATION * 4);
        }
        mJuggleTimeout = setTimeout(mJuggle, START_DELAY);
    }

    function stop() {
        mStarted = false;
        clearTimeout(mJuggleTimeout);
    }

    function onSizeChanged(w: number, h: number) {
        if (mWidth == w && mHeight == h) return;

        const wasStarted = mStarted;
        if (wasStarted) {
            stop();
        }

        mWidth = w;
        mHeight = h;

        mCells.length = 0;
        removeAllViewsInLayout();
        mFreeList.clear();

        mRows = trunc(mHeight / mCellSize / SCALE);
        mColumns = trunc(mWidth / mCellSize / SCALE);

        mCells.length = mRows * mColumns;

        let scaleS = 1;
        if (mWidth > 0 && mHeight > 0 && mCellSize > 0) {
            scaleS = max(
                mWidth / (mCellSize * mColumns * 1),
                mHeight / (mCellSize * mRows * 1)
            );
        }
        canvasScale = scaleS;

        for (let j = 0; j < mRows; j++) {
            for (let i = 0; i < mColumns; i++) {
                mFreeList.add(i + "," + j);
            }
        }

        if (wasStarted) {
            start();
        }
        draw();
    }

    function fillFreeList0() {
        fillFreeList(DURATION);
    }

    function fillFreeList(animationLen: number) {
        while (mFreeList.size) {
            const pt = mFreeList.values().next().value as string;
            mFreeList.delete(pt);
            const ptParts = pt.split(",");
            const i = parseFloat(ptParts[0]);
            const j = parseFloat(ptParts[1]);

            if (mCells[j * mColumns + i]) continue;
            const v = new ChildView(startAnim);
            v.onClick = function () {
                place2(v, true);
                setTimeout(fillFreeList0, DURATION / 2);
            };

            const c = random_color();
            v.bgColorRgba[0] = (c >>> 16) & 0xff;
            v.bgColorRgba[1] = (c >>> 8) & 0xff;
            v.bgColorRgba[2] = (c) & 0xff;
            v.bgColorRgba[3] = ((c >>> 24) & 0xff) / 0xff;

            const which = frand();
            let d: ImageBitmap | undefined;
            if (which < 0.0005) {
                d = mDrawables[(pick(XXRARE_PASTRIES_INDEX))];
            } else if (which < 0.005) {
                d = mDrawables[(pick(XRARE_PASTRIES_INDEX))];
            } else if (which < 0.5) {
                d = mDrawables[(pick(RARE_PASTRIES_INDEX))];
            } else if (which < 0.7) {
                d = mDrawables[(pick(PASTRIES_INDEX))];
            } else {
                d = undefined;
            }
            if (d != undefined) {
                v.drawable = d;
            }
            addView(v);
            place(v, pt, false);
            if (animationLen > 0) {
                const s = v.span;
                v.scaleX = (0.5 * s);
                v.scaleY = (0.5 * s);
                v.alpha = (0);
                v.animate().scaleX(s).scaleY(s).alpha(1).setDuration(animationLen).start();
            }
        }
    }

    function place2(v: ChildView, animate: boolean) {
        place(v, (irand(0, mColumns) + "," + irand(0, mRows)), animate);
    }

    const tmpSet = new Set<ChildView>();

    function place(v: ChildView, pt: string, animate: boolean) {
        const ptParts = pt.split(",");
        const i = parseFloat(ptParts[0]);
        const j = parseFloat(ptParts[1]);
        const rnd = frand();
        if (v.pos != undefined) {
            for (const oc of getOccupied(v)) {
                mFreeList.add(oc[0] + "," + oc[1]);
                mCells[oc[1] * mColumns + oc[0]] = undefined;
            }
        }
        let scale = 1;
        if (rnd < PROB_4X) {
            if (!(i >= mColumns - 3 || j >= mRows - 3)) {
                scale = 4;
            }
        } else if (rnd < PROB_3X) {
            if (!(i >= mColumns - 2 || j >= mRows - 2)) {
                scale = 3;
            }
        } else if (rnd < PROB_2X) {
            if (!(i == mColumns - 1 || j == mRows - 1)) {
                scale = 2;
            }
        }

        v.pos = strToPoint(pt);
        v.span = scale;

        tmpSet.clear();

        const occupied = getOccupied(v);
        for (const oc of occupied) {
            const squatter = mCells[oc[1] * mColumns + oc[0]];
            if (squatter != undefined) {
                tmpSet.add(squatter);
            }
        }

        for (const squatter of tmpSet) {
            for (const sq of getOccupied(squatter)) {
                mFreeList.add(pointToStr(sq));
                mCells[sq[1] * mColumns + sq[0]] = undefined;
            }
            if (squatter != v) {
                squatter.pos = undefined;
                if (animate) {
                    squatter.animate()
                        .scaleX(0.5).scaleY(0.5).alpha(0)
                        .setDuration(DURATION)
                        .setInterpolator(AccelerateInterpolator.getInstance())
                        .setEndListener(() => removeView(squatter))
                        .start();
                } else {
                    removeView(squatter);
                }
            }
        }

        for (const oc of occupied) {
            mCells[oc[1] * mColumns + oc[0]] = v;
            mFreeList.delete(pointToStr(oc));
        }

        const rot = irand(0, 4) * 90;

        if (animate) {
            bringChildToFront(v);
            v.animate()
                .scaleX(scale)
                .scaleY(scale)
                .rotation(rot)
                .x(i * mCellSize + (scale - 1) * mCellSize / 2)
                .y(j * mCellSize + (scale - 1) * mCellSize / 2)
                .alpha(1)
                .setInterpolator(DecelerateInterpolator.getInstance())
                .setDuration(DURATION)
                .start()
        } else {
            v.currX = (i * mCellSize + (scale - 1) * mCellSize / 2);
            v.currY = (j * mCellSize + (scale - 1) * mCellSize / 2);
            v.scaleX = (scale);
            v.scaleY = (scale);
            v.rotation = (rot);
        }
    }

    function getOccupied(v: ChildView): number[][] {
        const scale = v.span;
        const pt = v.pos;
        if (pt == undefined || scale == 0) return [];

        const result = Array<number[]>(scale * scale);
        let p = 0;
        for (let i = 0; i < scale; i++) {
            for (let j = 0; j < scale; j++) {
                result[p++] = [pt[0] + i, pt[1] + j];
            }
        }
        return result;
    }

    function startAnim(anim: ViewAnimation) {
        anim.startTime = now();
        animList.push(anim);
    }

    function tick(time: number) {
        let i = 0;
        while (i < animList.length) {
            const anim = animList[i];
            if (!anim.tick(time)) {
                animList.splice(i, 1);
            } else {
                i++;
            }
        }
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, mWidth, mHeight);
        ctx.save();
        ctx.scale(canvasScale, canvasScale);
        ctx.translate(0.5 * (mWidth - mCellSize * mColumns * canvasScale) / canvasScale, 0.5 * (mHeight - mCellSize * mRows * canvasScale) / canvasScale)
        for (const child of children) {
            ctx.save();
            const centerX = child.currX + mCellSize / 2;
            const centerY = child.currY + mCellSize / 2;
            const w = mCellSize * child.scaleX, h = mCellSize * child.scaleY, x = centerX - w / 2, y = centerY - h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(child.rotation * PI / 180);
            ctx.translate(-centerX, -centerY);
            ctx.globalAlpha = child.alpha;
            ctx.fillStyle = "rgba(" + child.bgColorRgba.join(",") + ")";
            ctx.fillRect(x, y, w, h);
            const imgSize = min(w, h);
            if (child.drawable) {
                ctx.drawImage(child.drawable, centerX - imgSize / 2, centerY - imgSize / 2, imgSize, imgSize);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        ctx.restore();
    }

    function onClick(x: number, y: number) {
        const offX = 0.5 * (mWidth - mCellSize * mColumns * canvasScale) / canvasScale;
        const offY = 0.5 * (mHeight - mCellSize * mRows * canvasScale) / canvasScale;
        const downX = x / canvasScale - offX;
        const downY = y / canvasScale - offY;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            const centerX = child.currX + mCellSize / 2;
            const centerY = child.currY + mCellSize / 2;
            const w = mCellSize * child.scaleX, h = mCellSize * child.scaleY, x = centerX - w / 2, y = centerY - h / 2;
            if (downX >= x && downX <= x + w && downY >= y && downY <= y + w) {
                if (child.onClick) {
                    child.onClick();
                    break;
                }
            }
        }
    }

    return [initAsync, start, stop, tick, onSizeChanged, onClick] as [typeof initAsync, typeof start, typeof stop, typeof tick, typeof onSizeChanged, typeof onClick];
}

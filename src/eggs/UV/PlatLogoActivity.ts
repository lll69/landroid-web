/*
 * Copyright (C) 2020 The Android Open Source Project
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
 *
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

import { lerp } from "../../MathHelpers";
import { MAX_WARP, MIN_WARP, Starfield } from "./StarField";
const { min, random, round, trunc } = Math;
const { clearTimeout, postMessage, requestAnimationFrame, setTimeout } = window;

let setHashEnabled = false;

onmessage = (e: MessageEvent) => {
    if (e.origin === location.origin) {
        if (e.data.type === "setHashEnabled") {
            setHashEnabled = true;
        }
    }
}

export default (url: string) => {
    const LAUNCH_TIME = 5000;

    const canvas = document.querySelector("canvas")!;
    const content = document.querySelector("img")!;
    const div = document.querySelector("div")!;
    const ctx = canvas.getContext("2d")!;
    let isPressed = false;
    let mLaunchNextStage = -1;
    let mWarpAnim = -1;

    const mStarfield = new Starfield(devicePixelRatio * 2);
    mStarfield.setVelocity(
        200 * (random() - 0.5),
        200 * (random() - 0.5));

    function stopWarp() {
        mWarpAnim = -1;
        mStarfield.setWarp(1);
        clearTimeout(mLaunchNextStage);
    }

    function startWarp() {
        stopWarp();
        mWarpAnim = performance.now();
        mLaunchNextStage = setTimeout(() => {
            stopWarp();
            if (setHashEnabled && parent !== null) {
                parent.postMessage({ type: "setHash", hash: "#" + url });
            } else {
                window.open("./#" + url, "_top");
            }
        }, LAUNCH_TIME + 1000);
    }

    function onTouch(e: PointerEvent | TouchEvent | KeyboardEvent) {
        switch (e.type) {
            case "pointerdown":
                e.preventDefault();
                if (!isPressed) {
                    isPressed = true;
                    startWarp();
                }
                content.setPointerCapture((e as PointerEvent).pointerId);
                break;
            case "pointerup":
            case "pointercancel":
                e.preventDefault();
                if (isPressed) {
                    isPressed = false;
                    stopWarp();
                }
                break;
            case "keydown":
                if ((e as KeyboardEvent).key === " ") {
                    e.preventDefault();
                    if (!(e as KeyboardEvent).repeat && !isPressed) {
                        isPressed = true;
                        startWarp();
                    }
                }
                break;
            case "keyup":
                if ((e as KeyboardEvent).key === " ") {
                    e.preventDefault();
                    if (!(e as KeyboardEvent).repeat && isPressed) {
                        isPressed = false;
                        stopWarp();
                    }
                }
                break;
        }
    }

    content.addEventListener("pointerdown", onTouch);
    content.addEventListener("pointerup", onTouch);
    content.addEventListener("keydown", onTouch);
    content.addEventListener("keyup", onTouch);
    document.body.addEventListener("keydown", onTouch);
    document.body.addEventListener("keyup", onTouch);
    canvas.addEventListener("keydown", onTouch);
    canvas.addEventListener("keyup", onTouch);
    content.addEventListener("pointercancel", onTouch);
    content.addEventListener("contextmenu", e => e.preventDefault());

    function drawStarfield() {
        mStarfield.draw(ctx);
    }

    function onCanvasResize() {
        const { width: w, height: h } = canvas.getBoundingClientRect();
        const cw = round(w * devicePixelRatio), ch = round(h * devicePixelRatio);
        canvas.width = cw;
        canvas.height = ch;
        mStarfield.onBoundsChange(0, 0, cw, ch);
        drawStarfield();
    }
    new ResizeObserver(onCanvasResize).observe(canvas);

    function onDivResize() {
        const { width, height } = canvas.getBoundingClientRect();
        const imgWidth = trunc(min(width, height) * 0.75);
        content.style.width = content.style.height = imgWidth + "px";
    }
    new ResizeObserver(onDivResize).observe(canvas);

    let lastTime = performance.now();
    function anim(time: number) {
        const dt = time - lastTime;
        lastTime = time;
        if (mWarpAnim !== -1) {
            const animDt = time - mWarpAnim;
            const percent = min(animDt / LAUNCH_TIME, 1);
            mStarfield.setWarp(lerp(MIN_WARP, MAX_WARP, percent));
        }
        mStarfield.update(dt);
        const warpFrac = (mStarfield.getWarp() - MIN_WARP) / (MAX_WARP - MIN_WARP);
        content.style.transform =
            "translate(" +
            (random() * warpFrac * 5 * devicePixelRatio) + "px," +
            (random() * warpFrac * 5 * devicePixelRatio) + "px)";
        drawStarfield();
        requestAnimationFrame(anim);
    }

    onDivResize();
    onCanvasResize();
    requestAnimationFrame(anim);
    content.focus();
}
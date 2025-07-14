/*
 * Copyright 2025 lll69
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

import { CanvasHelper } from "./CanvasHelper";
import { DEFAULT_CAMERA_ZOOM, getCamZoom, MainActivity, RandomSeedType, setCamZoom, setDynamicZoom, setFixedRandomSeed, setRandomSeedType } from "./MainActivity";

const unsupportedFeatures: Array<String> = [];
if (typeof BigInt === "undefined") {
    unsupportedFeatures.push("BigInt");
}
if (typeof String.prototype.matchAll === "undefined") {
    unsupportedFeatures.push("String.prototype.matchAll");
}
if (unsupportedFeatures.length > 0) {
    alert("Your browser does not support the following features: " + unsupportedFeatures + ".\nThe app will exit now.");
    throw new Error("Unsupported features: " + unsupportedFeatures);
}

const canvas = document.getElementById("canvasMain") as HTMLCanvasElement;
const canvasContext: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
let manualZoom = false;
if (!canvasContext) {
    alert("Unable to get canvas 2d context.\nThe app will exit now.");
    throw new Error("Unable to get canvas 2d context");
}
const helper = new CanvasHelper(canvasContext);

function loadParams() {
    const hash = location.hash;
    const params = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();
    const zoomParam = params.get("zoom");
    setDynamicZoom(zoomParam === "dynamic");
    manualZoom = zoomParam === "manual";
    if (!manualZoom && zoomParam !== "dynamic") {
        setCamZoom(DEFAULT_CAMERA_ZOOM);
    }
    const seedStr = params.get("seed");
    if (seedStr) {
        if (seedStr === "evergreen") {
            setRandomSeedType(RandomSeedType.Evergreen);
        } else if (seedStr === "daily") {
            setRandomSeedType(RandomSeedType.Daily);
        } else try {
            const SEED_MAX = 9223372036854775807n;
            const SEED_MIN = -9223372036854775808n;
            let seed = BigInt(seedStr);
            if (seed > SEED_MAX) seed = SEED_MAX;
            if (seed < SEED_MIN) seed = SEED_MIN;
            setRandomSeedType(RandomSeedType.Fixed);
            setFixedRandomSeed(seed);
        } catch (e) {
            console.log(e);
        }
    }
}
loadParams();
window.addEventListener("hashchange", loadParams);

const activity = MainActivity(document.getElementById("topText")!!, document.getElementById("bottomText")!!);
const pointerInput = activity.pointerInput;
const drawFn = activity.draw;

function animation(millis: number) {
    drawFn(millis, canvasContext, helper);
    requestAnimationFrame(animation);
}

document.getElementById("loading")!!.hidden = true;

function onCanvasResize() {
    const clientRect = canvas.getBoundingClientRect();
    canvas.width = Math.round(clientRect.width * window.devicePixelRatio);
    canvas.height = Math.round(clientRect.height * window.devicePixelRatio);
}

canvas.hidden = false;
canvas.addEventListener("touchstart", pointerInput);
canvas.addEventListener("touchmove", pointerInput);
canvas.addEventListener("touchend", pointerInput);
canvas.addEventListener("touchcancel", pointerInput);
canvas.addEventListener("pointerdown", pointerInput);
canvas.addEventListener("pointermove", pointerInput);
canvas.addEventListener("pointerup", pointerInput);
canvas.addEventListener("pointercancel", pointerInput);

let isTwoFingerDown = false;
let downZoom = 0;
let downDistance = 0;

function handleZoom(e: TouchEvent) {
    if (!isTwoFingerDown) {
        if (e.type === "touchstart" && e.touches.length === 2) {
            isTwoFingerDown = true;
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            downZoom = getCamZoom();
            downDistance = Math.sqrt(dx * dx + dy * dy);
            e.preventDefault();
        }
    } else {
        if (e.type === "touchstart") {
            if (e.touches.length !== 2) {
                isTwoFingerDown = false;
            }
        } else if (e.type === "touchend" || e.type === "touchcancel") {
            isTwoFingerDown = false;
        } else if (e.type === "touchmove") {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const newDistance = Math.sqrt(dx * dx + dy * dy);
            if (manualZoom) setCamZoom(downZoom * newDistance / downDistance);
            e.preventDefault();
        }
    }
}

canvas.addEventListener("touchstart", handleZoom);
canvas.addEventListener("touchmove", handleZoom);
canvas.addEventListener("touchend", handleZoom);
canvas.addEventListener("touchcancel", handleZoom);

function handleWheel(e: WheelEvent) {
    if (manualZoom) {
        e.preventDefault();
        setCamZoom(getCamZoom() * (1 - e.deltaY / 1000));
    }
}

document.addEventListener("wheel", handleWheel);

setTimeout(function () {
    onCanvasResize();
    new ResizeObserver(onCanvasResize).observe(canvas);
    const isConfirmed = confirm("This project is licensed under the Apache License 2.0.\nThis project is not affiliated with Android or Google.\n\nClick OK to continue running this app, or click Cancel to close this app.");
    if (isConfirmed) {
        setTimeout(() => requestAnimationFrame(animation), 0);
    }
}, 0);

/*
 * Copyright (C) 2023 The Android Open Source Project
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

import { SYSTEM } from "@thi.ng/random";
import { sprintf } from "sprintf-js";
import { Spacecraft, StarClassNames, UniverseConst } from "./Universe";
import { VisibleUniverse, ZoomedDrawScope } from "./VisibleUniverse";
import { Namer } from "./Namer";
import { Colors } from "./Colors";
import { Vec2_makeWithAngleMag } from "./Vec2";
import { clamp, lexp } from "./Maths";
import { CanvasHelper } from "./CanvasHelper";

const TEST_UNIVERSE = false

export const enum RandomSeedType {
    Fixed = 0,
    Daily = 1,
    Evergreen = 2
}

let RANDOM_SEED_TYPE = RandomSeedType.Daily;

let FIXED_RANDOM_SEED = 5038n;
export const DEFAULT_CAMERA_ZOOM = 1;
const MIN_CAMERA_ZOOM = 250 / UniverseConst.UNIVERSE_RANGE; // 0.0025f
const MAX_CAMERA_ZOOM = 5;
const TOUCH_CAMERA_PAN = false;
const TOUCH_CAMERA_ZOOM = true;
let DYNAMIC_ZOOM = false;

let camZoom = DEFAULT_CAMERA_ZOOM;

const PI = Math.PI;
const atan2 = Math.atan2;
const cos = Math.cos;
const floor = Math.floor;
const max = Math.max;
const min = Math.min;
const random = Math.random;
const sin = Math.sin;
const sqrt = Math.sqrt;

function absN(num: bigint): bigint {
    return num >= 0 || num === -9223372036854775808n ? num : -num;
}

function dailySeed(): number {
    let today = new Date();
    return today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
}

function randomSeed(): bigint {
    switch (RANDOM_SEED_TYPE) {
        case RandomSeedType.Fixed: return absN(FIXED_RANDOM_SEED);
        case RandomSeedType.Daily: return absN(BigInt(dailySeed()));
        default: return absN(((BigInt(SYSTEM.int()) << 32n) | BigInt(SYSTEM.int())) % 10_000_000n);
    }
}

function toLocalPx(sz: number): number {
    return sz * window.devicePixelRatio;
}

function Telemetry(universe: VisibleUniverse, topText: HTMLElement, bottomText: HTMLElement) {
    let topVisible = false;
    let bottomVisible = false;
    let startMillis = -1;
    const topTextNode = document.createTextNode("");
    topText.appendChild(topTextNode);
    const bottomTextNode = document.createTextNode("");
    bottomText.appendChild(bottomTextNode);
    let frames = 0;
    let lastFpsTime = 0;
    let fps = 0;
    return (millis: number) => {
        if (startMillis === -1) {
            startMillis = millis;
            return;
        }
        let millisDelta = millis - startMillis;
        if (!bottomVisible) {
            if (millisDelta >= 2000) {
                bottomText.hidden = false;
                bottomText.style.opacity = 1 as any;
                bottomVisible = true;
            } else if (millisDelta > 1000) {
                bottomText.hidden = false;
                bottomText.style.opacity = (random() * (millis - 1000) / 1000) as any;
            }
        }
        if (!topVisible) {
            if (millisDelta >= 3000) {
                topText.hidden = false;
                topText.style.opacity = String(1);
                topVisible = true;
            } else if (millisDelta > 2000) {
                topText.hidden = false;
                topText.style.opacity = String((random() * (millis - 2000) / 1000));
            }
        }
        if (millis - lastFpsTime >= 1000) {
            fps = frames * 1000 / (millis - lastFpsTime);
            lastFpsTime = millis;
            frames = 0;
        }
        frames++;
        const star = universe.star;
        const explored = universe.planets
            .filter(it => it.explored)
            .map(it => "  BODY: " + it.name + "\n" +
                "  TYPE: " + it.description + "\n" +
                "  ATMO: " + it.atmosphere + "\n" +
                " FAUNA: " + it.fauna + "\n" +
                " FLORA: " + it.flora + "\n");
        const topString = "  STAR: " + star.name + " (UDC-" + (universe.randomSeed % 100_000n) + ")\n" +
            " CLASS: " + StarClassNames[star.cls] + "\n" +
            "RADIUS: " + floor(star.radius) + "\n" +
            sprintf("  MASS: %.3e\n", star.mass) +
            "BODIES: " + explored.length + " / " + universe.planets.length + "\n" +
            "   FPS: " + fps.toFixed(1) + "\n" +
            "  vFPS: " + (1 / universe.dt).toFixed(0)
            + "\n\n"
            + explored.join("\n");
        topTextNode.textContent = topString;
        const ship = universe.ship;
        const closest = universe.closestPlanet();
        const distToClosest = floor(closest.pos.distance(ship.pos));
        let bottomString = "";
        if (ship.landing !== null) {
            bottomString += "LND: " + ship.landing.planet.name;
        } else if (distToClosest < 10_000) {
            bottomString += "ALT: " + distToClosest;
        }
        if (ship.thrust.x !== 0 || ship.thrust.y !== 0) {
            if (bottomString.length > 0) bottomString += "\n";
            bottomString += "THR: " + (ship.thrust.mag() * 100).toFixed(0) + "%";
        }
        if (bottomString.length > 0) bottomString += "\n";
        bottomString += "POS: " + ship.pos.str() + "\n";
        bottomString += "VEL: " + ship.velocity.mag().toFixed(0);
        bottomTextNode.textContent = bottomString;
    }
}

export function FlightStick(
    minRadius: number,
    maxRadius: number,
    color: string,
    onStickChanged: (x: number, y: number) => void
) {
    let originX: number;
    let originY: number;
    let targetX: number;
    let targetY: number;
    let isDown: boolean = false;

    function pointerInput(e: Event) {
        if (!isDown) {
            if (e.type === "touchstart") {
                if ((e as TouchEvent).touches.length === 1) {
                    const touch = (e as TouchEvent).touches[0];
                    originX = targetX = touch.clientX * window.devicePixelRatio;
                    originY = targetY = touch.clientY * window.devicePixelRatio;
                    isDown = true;
                    e.preventDefault();
                }
            } else if (e.type === "pointerdown") {
                originX = targetX = (e as PointerEvent).clientX * window.devicePixelRatio;
                originY = targetY = (e as PointerEvent).clientY * window.devicePixelRatio;
                isDown = true;
                e.preventDefault();
                (e.target as Element).setPointerCapture((e as PointerEvent).pointerId);
            }
        } else {
            if (e.type === "touchend" || e.type === "touchcancel" || e.type === "pointerup" || e.type === "pointercancel") {
                isDown = false;
                onStickChanged(0, 0);
                e.preventDefault();
            } else if (e.type === "touchmove") {
                const touch = (e as TouchEvent).touches[0];
                targetX = touch.clientX * window.devicePixelRatio;
                targetY = touch.clientY * window.devicePixelRatio;
                onStickChanged(targetX - originX, targetY - originY);
                e.preventDefault();
            } else if (e.type === "pointermove") {
                targetX = (e as PointerEvent).clientX * window.devicePixelRatio;
                targetY = (e as PointerEvent).clientY * window.devicePixelRatio;
                onStickChanged(targetX - originX, targetY - originY);
                e.preventDefault();
            } else if (e.type === "touchstart") {
                if ((e as TouchEvent).touches.length > 1) {
                    isDown = false;
                    onStickChanged(0, 0);
                }
            }
        }
    }
    return {
        pointerInput: pointerInput,
        draw: (context: CanvasRenderingContext2D, helper: CanvasHelper) => {
            if (isDown) {
                const deltaX = targetX - originX;
                const deltaY = targetY - originY;
                const mag = min(maxRadius, sqrt(deltaX * deltaX + deltaY * deltaY));
                const r = max(minRadius, mag);
                const a = atan2(deltaY, deltaX);
                context.strokeStyle = color;
                context.lineWidth = 2;
                if (mag < minRadius) {
                    const density = (window.visualViewport ? (window.visualViewport.scale || 1) : 1);
                    context.setLineDash([density, density * 2]);
                }
                context.beginPath();
                context.arc(originX, originY, r, 0, PI * 2);
                context.stroke();
                helper.clearLineDash();
                context.beginPath();
                context.moveTo(originX, originY);
                context.lineTo(originX + cos(a) * mag, originY + sin(a) * mag);
                context.stroke();
            }
        }
    };
}

function Spaaaace(
    u: VisibleUniverse,
    zoomedDrawScope: ZoomedDrawScope
) {
    let cameraZoom = camZoom;
    let cameraOffsetX = 0;
    let cameraOffsetY = 0;

    const centerFracX = 0.5;
    const centerFracY = 0.5;

    return (context: CanvasRenderingContext2D, helper: CanvasHelper) => {
        const canvasWidth = context.canvas.width;
        const canvasHeight = context.canvas.height;
        context.fillStyle = Colors.Eigengrau;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        //        val normalizedDist = clamp(distToNearestSurf, 50f, 50_000f) / 50_000f
        if (DYNAMIC_ZOOM) {
            const closest = u.closestPlanetForZoom();
            const distToNearestSurf = max(0, (u.ship.pos.distance(closest.pos)) - closest.radius * 1.2);
            //            cameraZoom = lerp(0.1f, 5f, smooth(1f-normalizedDist))
            cameraZoom = clamp(500 / distToNearestSurf, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM);
        } else if (!TOUCH_CAMERA_ZOOM) cameraZoom = DEFAULT_CAMERA_ZOOM;
        else cameraZoom = camZoom;
        if (!TOUCH_CAMERA_PAN) {
            const follow = u.follow;
            if (follow !== null) {
                cameraOffsetX = -follow.pos.x;
                cameraOffsetY = -follow.pos.y;
            } else {
                cameraOffsetX = cameraOffsetY = 0;
            }
        }

        // cameraZoom: metersToPixels
        // visibleSpaceSizeMeters: meters
        // cameraOffset: meters ≈ vector pointing from ship to (0,0) (e.g. -pos)
        const visibleSpaceSizeMeterWidth = canvasWidth / cameraZoom; // meters x meters
        const visibleSpaceSizeMeterHeight = canvasHeight / cameraZoom; // meters x meters
        const visibleSpaceRectMeterLeft = -cameraOffsetX - visibleSpaceSizeMeterWidth * centerFracX;
        const visibleSpaceRectMeterTop = -cameraOffsetY - visibleSpaceSizeMeterHeight * centerFracY;
        const visibleSpaceRectMeterRight = visibleSpaceRectMeterLeft + visibleSpaceSizeMeterWidth;
        const visibleSpaceRectMeterBottom = visibleSpaceRectMeterTop + visibleSpaceSizeMeterHeight;
        const visibleSpaceRectMeterCenterX = visibleSpaceRectMeterLeft + (visibleSpaceSizeMeterWidth / 2);
        const visibleSpaceRectMeterCenterY = visibleSpaceRectMeterTop + (visibleSpaceSizeMeterHeight / 2);

        let gridStep = 1000;
        const dp32 = toLocalPx(32);
        while (gridStep * cameraZoom < dp32) gridStep *= 10;

        context.save();
        context.scale(cameraZoom, cameraZoom);
        context.translate(
            (-visibleSpaceRectMeterCenterX + canvasWidth * 0.5 / cameraZoom),
            (-visibleSpaceRectMeterCenterY + canvasHeight * 0.5 / cameraZoom)
        );
        helper.x = visibleSpaceRectMeterLeft;
        helper.y = visibleSpaceRectMeterTop;
        helper.width = visibleSpaceSizeMeterWidth;
        helper.height = visibleSpaceSizeMeterHeight;
        helper.radius = sqrt((visibleSpaceSizeMeterWidth * visibleSpaceSizeMeterWidth + visibleSpaceSizeMeterHeight * visibleSpaceSizeMeterHeight) / 4);
        // All coordinates are space coordinates now.

        // debug outer frame
        // drawRect(
        //     Colors.Eigengrau2,
        //     visibleSpaceRectMeters.topLeft,
        //     visibleSpaceRectMeters.size,
        //     style = Stroke(width = 10f / cameraZoom)
        // )

        var x = floor(visibleSpaceRectMeterLeft / gridStep) * gridStep;
        context.strokeStyle = Colors.Eigengrau2;
        while (x < visibleSpaceRectMeterRight) {
            context.lineWidth = (((x % (gridStep * 10) === 0)) ? 3 : 1.5) / cameraZoom;
            context.beginPath();
            context.moveTo(x, visibleSpaceRectMeterTop);
            context.lineTo(x, visibleSpaceRectMeterBottom);
            context.stroke();
            x += gridStep;
        }

        var y = floor(visibleSpaceRectMeterTop / gridStep) * gridStep;
        while (y < visibleSpaceRectMeterBottom) {
            context.lineWidth = (((y % (gridStep * 10) === 0)) ? 3 : 1.5) / cameraZoom;
            context.beginPath();
            context.moveTo(visibleSpaceRectMeterLeft, y);
            context.lineTo(visibleSpaceRectMeterRight, y);
            context.stroke();
            y += gridStep;
        }

        zoomedDrawScope.zoom = cameraZoom;
        zoomedDrawScope.context = context;
        zoomedDrawScope.helper = helper;
        zoomedDrawScope.drawUniverse(u);

        context.restore();
    }
}

export function getCamZoom(): number {
    return camZoom;
}

export function setCamZoom(zoom: number) {
    camZoom = clamp(zoom, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM);
}

export function setDynamicZoom(dynamic: boolean) {
    DYNAMIC_ZOOM = dynamic;
}

export function setRandomSeedType(type: RandomSeedType) {
    RANDOM_SEED_TYPE = type;
}

export function setFixedRandomSeed(seed: bigint) {
    FIXED_RANDOM_SEED = seed;
}

export function MainActivity(topText: HTMLElement, bottomText: HTMLElement) {
    const universe = new VisibleUniverse(new Namer(), randomSeed());
    const zoomedDrawScope = new ZoomedDrawScope();

    if (TEST_UNIVERSE) {
        universe.initTest();
    } else {
        universe.initRandom();
    }

    const space = Spaaaace(universe, zoomedDrawScope);

    const minRadius = toLocalPx(50);
    const maxRadius = toLocalPx(100);

    const flightStick = FlightStick(
        minRadius,
        maxRadius,
        Colors.Green,
        (x, y) => {
            if (universe.follow instanceof Spacecraft) {
                const ship = universe.follow as Spacecraft;
                if (x === 0 && y === 0) {
                    ship.thrust.x = 0;
                    ship.thrust.y = 0;
                } else {
                    const a = atan2(y, x);
                    ship.angle = a;

                    const m = sqrt(x * x + y * y);
                    if (m < minRadius) {
                        // within this radius, just reorient
                        ship.thrust.x = 0;
                        ship.thrust.y = 0;
                    } else {
                        Vec2_makeWithAngleMag(
                            ship.thrust,
                            a,
                            clamp(lexp(minRadius, maxRadius, m), 0, 1)
                        );
                    }
                }
            }
        }
    );
    const flightStickDraw = flightStick.draw;
    const telemetry = Telemetry(universe, topText, bottomText);

    return {
        pointerInput: flightStick.pointerInput,
        draw: (millis: number, context: CanvasRenderingContext2D, helper: CanvasHelper) => {
            universe.simulateFrame(millis);
            space(context, helper);
            flightStickDraw(context, helper);
            telemetry(millis);
        }
    };
}

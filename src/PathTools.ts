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

const PI = Math.PI;
const cos = Math.cos;
const sin = Math.sin;

export function createPolygon(radius: number, sides: number, offX: number, offY: number): Path2D {
    const path = new Path2D();
    path.moveTo(radius + offX, offY);
    const angleStep = PI * 2 / sides;
    for (let i = 1; i < sides; i++) {
        path.lineTo(radius * cos(angleStep * i) + offX, radius * sin(angleStep * i) + offY);
    }
    path.closePath();
    return path;
}

export function drawPolygon(context: CanvasRenderingContext2D, radius: number, sides: number) {
    context.beginPath();
    context.moveTo(radius, 0);
    const angleStep = PI * 2 / sides;
    for (let i = 1; i < sides; i++) {
        context.lineTo(radius * cos(angleStep * i), radius * sin(angleStep * i));
    }
    context.closePath();
    context.stroke();
}

export function createStar(radius1: number, radius2: number, points: number): Path2D {
    const path = new Path2D();
    const angleStep = PI * 2 / points;
    path.moveTo(radius1, 0);
    path.lineTo(radius2 * cos(angleStep * (0.5)), radius2 * sin(angleStep * (0.5)));
    for (let i = 1; i < points; i++) {
        path.lineTo(radius1 * cos(angleStep * i), radius1 * sin(angleStep * i));
        path.lineTo(radius2 * cos(angleStep * (i + 0.5)), radius2 * sin(angleStep * (i + 0.5)));
    }
    path.closePath();
    return path;
}

export const parseSvgPathData = (d: string) => new Path2D(d);

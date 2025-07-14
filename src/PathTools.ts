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

export function createPolygon(radius: number, sides: number, offX: number, offY: number): Path2D {
    const path = new Path2D();
    path.moveTo(radius + offX, offY);
    const angleStep = Math.PI * 2 / sides;
    for (let i = 1; i < sides; i++) {
        path.lineTo(radius * Math.cos(angleStep * i) + offX, radius * Math.sin(angleStep * i) + offY);
    }
    path.closePath();
    return path;
}

export function createStar(radius1: number, radius2: number, points: number): Path2D {
    const path = new Path2D();
    const angleStep = Math.PI * 2 / points;
    path.moveTo(radius1, 0);
    path.lineTo(radius2 * Math.cos(angleStep * (0.5)), radius2 * Math.sin(angleStep * (0.5)));
    for (let i = 1; i < points; i++) {
        path.lineTo(radius1 * Math.cos(angleStep * i), radius1 * Math.sin(angleStep * i));
        path.lineTo(radius2 * Math.cos(angleStep * (i + 0.5)), radius2 * Math.sin(angleStep * (i + 0.5)));
    }
    path.closePath();
    return path;
}

export function parseSvgPathData(d: String): Path2D {
    const path = new Path2D();
    for (const it of d.trim().matchAll(/([A-Z])([-.,0-9e ]+)/g)) {
        const cmd = it[1];
        const args = it[2] ? it[2].split(/\s+/).map(parseFloat) : [];
        console.log("Landroid", "cmd = " + cmd + ", args = " + args.join(","));
        switch (cmd) {
            case "M": path.moveTo(args[0], args[1]); break;
            case "C": path.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]); break;
            case "L": path.lineTo(args[0], args[1]); break;
            case "Z": path.closePath(); break;
            default: console.log("Landroid", "unsupported SVG command: " + cmd); break;
        }
    }
    return path;
}

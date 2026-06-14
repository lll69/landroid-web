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

import { Colors } from "../../Colors";
const { random, trunc } = Math;

const NUM_STARS = 34; // Build.VERSION_CODES.UPSIDE_DOWN_CAKE
const NUM_PLANES = 2;
export const MIN_WARP = 1;
export const MAX_WARP = 10; // after all these years

export class Starfield {
    private readonly mStars: number[] = Array(NUM_STARS * 4).fill(0);
    private mVx: number;
    private mVy: number;
    private mDt: number = 0;

    private readonly mSize: number;

    private mSpaceX = 0;
    private mSpaceY = 0;
    private mSpaceW = 0;
    private mSpaceH = 0;
    private mWarp: number = 1;

    private mBuffer: number;

    setWarp(warp: number) {
        this.mWarp = warp;
    }

    getWarp(): number {
        return this.mWarp;
    }

    constructor(size: number) {
        this.mSize = size;
    }

    onBoundsChange(x: number, y: number, w: number, h: number) {
        this.mBuffer = this.mSize * NUM_PLANES * 2 * MAX_WARP;
        const intBuffer = trunc(this.mBuffer);
        this.mSpaceX = x - intBuffer;
        this.mSpaceY = y - intBuffer;
        this.mSpaceW = (w += 2 * intBuffer);
        this.mSpaceH = (h += 2 * intBuffer);
        for (let i = 0; i < NUM_STARS; i++) {
            this.mStars[4 * i] = random() * w;
            this.mStars[4 * i + 1] = random() * h;
            this.mStars[4 * i + 2] = this.mStars[4 * i];
            this.mStars[4 * i + 3] = this.mStars[4 * i + 1];
        }
    }

    setVelocity(x: number, y: number) {
        this.mVx = x;
        this.mVy = y;
    }

    draw(canvas: CanvasRenderingContext2D) {
        const dtSec = this.mDt / 1000;
        const dx = (this.mVx * dtSec * this.mWarp);
        const dy = (this.mVy * dtSec * this.mWarp);

        const inWarp = this.mWarp > 1;

        canvas.fillStyle = Colors.Black;
        canvas.fillRect(this.mSpaceX, this.mSpaceY, this.mSpaceW, this.mSpaceH); // 0xFF16161D);

        canvas.save();
        if (this.mDt > 0 && this.mDt < 1000) {
            canvas.translate(
                -(this.mBuffer) + random() * (this.mWarp - 1),
                -(this.mBuffer) + random() * (this.mWarp - 1)
            );
            const w = this.mSpaceW;
            const h = this.mSpaceH;
            for (let i = 0; i < NUM_STARS; i++) {
                const plane = trunc((i / NUM_STARS) * NUM_PLANES) + 1;
                this.mStars[4 * i + 2] = (this.mStars[4 * i + 2] + dx * plane + w) % w;
                this.mStars[4 * i + 3] = (this.mStars[4 * i + 3] + dy * plane + h) % h;
                this.mStars[4 * i + 0] = inWarp ? this.mStars[4 * i + 2] - dx * this.mWarp * 2 * plane : -100;
                this.mStars[4 * i + 1] = inWarp ? this.mStars[4 * i + 3] - dy * this.mWarp * 2 * plane : -100;
            }
        }
        const slice = trunc(this.mStars.length / NUM_PLANES / 4) * 4;
        canvas.strokeStyle = Colors.White;
        canvas.lineCap = "square";
        for (let p = 0; p < NUM_PLANES; p++) {
            canvas.lineWidth = (this.mSize * (p + 1));
            const base = p * slice;
            if (inWarp) {
                for (let j = 0; j < slice; j += 4) {
                    canvas.beginPath();
                    canvas.moveTo(this.mStars[base + j], this.mStars[base + j + 1]);
                    canvas.lineTo(this.mStars[base + j + 2], this.mStars[base + j + 3]);
                    canvas.stroke();
                }
            }
            for (let j = 0; j < slice; j += 2) {
                canvas.beginPath();
                canvas.moveTo(this.mStars[base + j], this.mStars[base + j + 1]);
                canvas.lineTo(this.mStars[base + j], this.mStars[base + j + 1]);
                canvas.stroke();
            }
        }
        canvas.restore();
    }

    update(dt: number) {
        this.mDt = dt;
    }
}

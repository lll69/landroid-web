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

const emptyLineDash = [];

const PI = Math.PI;
const abs = Math.abs;
const sqrt = Math.sqrt;

function distance(x: number, y: number, x0: number, y0: number, x1: number, y1: number): number {
    return ((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) < 1e-20)
        ? sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0))
        : abs((x1 - x0) * (y0 - y) - (x0 - x) * (y1 - y0)) / sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

export class CanvasHelper {
    readonly ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    radius: number;
    x: number;
    y: number;

    constructor(context: CanvasRenderingContext2D) {
        this.ctx = context;
    }

    clearLineDash() {
        this.ctx.setLineDash(emptyLineDash);
    }

    drawCircle(color: string, width: number, x: number, y: number, radius: number) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const thisRadius = this.radius;
        if (sqrt(dx * dx + dy * dy) - radius - width > thisRadius) {
            return;
        } else if (sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) + thisRadius + width < radius) {
            return;
        }
        const context = this.ctx;
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * PI);
        context.stroke();
    }

    fillCircle(color: string, x: number, y: number, radius: number) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const thisRadius = this.radius;
        if (sqrt(dx * dx + dy * dy) - radius > thisRadius) {
            return;
        }
        const context = this.ctx;
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * PI);
        context.fill();
    }

    drawLine(color: string, width: number, x0: number, y0: number, x1: number, y1: number) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        if (distance(cx, cy, x0, y0, x1, y1) > this.radius + width) {
            return;
        }
        const context = this.ctx;
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
    }
}

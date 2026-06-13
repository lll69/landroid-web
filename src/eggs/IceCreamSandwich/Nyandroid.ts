/*);
 * Copyright (C) 2011 The Android Open Source Project
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

function lerp(a: number, b: number, f: number): number {
    return (b - a) * f + a;
}

function randfrange(a: number, b: number): number {
    return lerp(a, b, Math.random());
}

function randsign(): number {
    return Math.random() >= 0.5 ? 1 : -1;
}

function pick<E>(array: Array<E>): E | null {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

const VMAX = 1000.0;
const VMIN = 100.0;
const CAT_WIDTH = 320;
const CAT_HEIGHT = 320;
const FIXED_STARS = true;
const NUM_CATS = 20;

class FlyingCat {
    v: number;
    vr: number;

    dist: number;
    z: number;

    board: Board;
    element: HTMLDivElement;
    x: number;
    y: number;
    scale: number;

    constructor(board: Board) {
        this.board = board;
        this.element = document.createElement("div");
        this.element.className = "nyandroid";
        this.scale = 1;
    }

    getWidth(): number {
        return CAT_WIDTH * this.scale;
    }

    getHeight(): number {
        return CAT_HEIGHT * this.scale;
    }

    toString(): string {
        return "<cat (" + this.x.toFixed(1) + ", " + this.y.toFixed(1) + ") (" + this.getWidth() + " x " + this.getHeight() + ")>";
    }

    updateElement() {
        this.element.style.transform = "translate(" + this.x + "px, " + this.y + "px) scale(" + this.scale + ")";
    }

    reset() {
        const scale = lerp(0.1, 2, this.z);
        this.scale = scale;

        this.x = -scale * this.getWidth() + 1;
        this.y = randfrange(0, this.board.height - scale * this.getHeight());
        this.v = lerp(VMIN, VMAX, this.z);

        this.dist = 0;

        this.updateElement();
        // console.log("Nyandroid", "reset cat:", this);
    }

    update(dt: number) {
        this.dist += this.v * dt;
        this.x += this.v * dt;
    }
}

class Board {
    cats: Array<FlyingCat>;
    stars: Array<HTMLDivElement>;
    width: number;
    height: number;
    mAnim: number;

    constructor() {
        this.cats = [];
        this.stars = [];
        const clientRect = document.body.getBoundingClientRect();
        this.width = clientRect.width;
        this.height = clientRect.height;
    }

    removeAllViews() {
        this.cats.forEach(child => child.element.remove());
        this.stars.forEach(child => child.remove());
        this.cats.length = 0;
        this.stars.length = 0;
    }

    addStar(star: HTMLDivElement) {
        this.stars.push(star);
        document.body.appendChild(star);
    }

    addCat(cat: FlyingCat) {
        this.cats.push(cat);
        document.body.appendChild(cat.element);
    }

    private reset() {
        console.log("Nyandroid", "board reset");
        this.removeAllViews();

        if (FIXED_STARS) {
            for (let i = 0; i < 20; i++) {
                const fixedStar = document.createElement("div");
                fixedStar.className = "star";
                this.addStar(fixedStar);
                const scale = randfrange(0.1, 1);
                const x = randfrange(0, this.width);
                const y = randfrange(0, this.height);
                fixedStar.style.animationPlayState = "paused";
                fixedStar.style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
                setTimeout(() => fixedStar.style.animationPlayState = "running", randfrange(0, 1000));
            }
        }

        for (let i = 0; i < NUM_CATS; i++) {
            const nv = new FlyingCat(this);
            this.addCat(nv);
            nv.z = (i / NUM_CATS);
            nv.z *= nv.z;
            nv.reset();
            nv.x = randfrange(0, this.width);
            nv.element.style.animationPlayState = "paused";
            nv.updateElement();
            setTimeout(() => nv.element.style.animationPlayState = "running", randfrange(0, 1000));
        }

        if (this.mAnim !== undefined) {
            cancelAnimationFrame(this.mAnim);
        }
        const thisBoard = this;
        let lastTime = performance.now();
        function animation(totalTime: number) {
            const deltaTime = totalTime - lastTime;
            lastTime = totalTime;
            // setRotation(totalTime * 0.01f); // not as cool as you would think
            // android.util.Log.d("Nyandroid", "t=" + totalTime);

            for (const nv of thisBoard.cats) {
                nv.update(deltaTime / 1000);
                const catWidth = nv.getWidth() * nv.scale;
                const catHeight = nv.getHeight() * nv.scale;
                if (nv.x + catWidth < -2
                    || nv.x > thisBoard.width + 2
                    || nv.y + catHeight < -2
                    || nv.y > thisBoard.height + 2) {
                    nv.reset();
                }
                nv.updateElement();
            }
            thisBoard.mAnim = requestAnimationFrame(animation);
        }
        this.mAnim = requestAnimationFrame(animation);
    }

    postStart() {
        this.reset();
    }

    onSizeChanged(w: number, h: number) {
        // android.util.Log.d("Nyandroid", "resized: " + w + "x" + h);
        this.width = w;
        this.height = h;
        this.postStart();
    }
}

const board = new Board();

new ResizeObserver(function () {
    const clientRect = document.body.getBoundingClientRect();
    board.onSizeChanged(clientRect.width, clientRect.height);
}).observe(document.body);

board.postStart();

export { };

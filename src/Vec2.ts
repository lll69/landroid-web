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

import { sprintf } from "sprintf-js";

export class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }
    str(): string {
        return sprintf("<%+7.0f,%+7.0f>", this.x, this.y);
    }
    mag(): number {
        const x = this.x;
        const y = this.y;
        return Math.sqrt(x * x + y * y);
    }
    distance(other: Vec2): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        return Math.sqrt(x * x + y * y);
    }
    angle(): number {
        return Math.atan2(this.y, this.x);
    }
    product(f: number): Vec2 {
        return new Vec2(this.x * f, this.y * f);
    }
    static Zero(): Vec2 {
        return new Vec2(0, 0);
    }
    addSelf(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    productSelf(f: number): Vec2 {
        this.x *= f;
        this.y *= f;
        return this;
    }
}

export function Vec2_copy(dst: Vec2, src: Vec2): void {
    dst.x = src.x;
    dst.y = src.y;
}

export function Vec2_angle(a: Vec2, b: Vec2): number {
    return Math.atan2(a.y - b.y, a.x - b.x);
}

export function Vec2_makeWithAngleMag(out: Vec2, a: number, m: number): Vec2 {
    out.x = m * Math.cos(a);
    out.y = m * Math.sin(a);
    return out;
}

export function Vec2_makeWithAngleMagAdd(out: Vec2, a: number, m: number): Vec2 {
    out.x += m * Math.cos(a);
    out.y += m * Math.sin(a);
    return out;
}

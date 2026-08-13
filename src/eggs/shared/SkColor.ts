/*
 * Copyright 2006 The Android Open Source Project
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/*
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

const { imul, trunc } = Math;

const SK_Fixed1 = (1 << 16);

function SkTMin<T>(a: T, b: T): T {
    return (a < b) ? a : b;
}

function SkTMax<T>(a: T, b: T): T {
    return (b < a) ? a : b;
}

function SkScalarPin<T>(value: T, min: T, max: T): T {
    return SkTMax(SkTMin(value, max), min);
}

function SkUnitScalarClampToByte(x: number) {
    return (SkScalarPin(x, 0, 1) * 255 + 0.5) & 0xff;
}

function SkColorSetARGB(a: number, r: number, g: number, b: number) {
    return (a << 24) | (r << 16) | (g << 8) | (b << 0);
}

function SkScalarToFixed(x: number) {
    let n = x * SK_Fixed1;
    return trunc(n);
}

function SkAlpha255To256(alpha: number) {
    // this one assues that blending on top of an opaque dst keeps it that way
    // even though it is less accurate than a+(a>>7) for non-opaque dsts
    return alpha + 1;
}

function SkAlphaMul(value: number, alpha256: number) {
    return (imul((value), (alpha256)) >> 8);
}

/**
 * @param a 0-255
 * @param hsv [h, s, v]
 */
export function SkHSVToColor(a: number, hsv: number[]) {
    let s = SkUnitScalarClampToByte(hsv[1]);
    let v = SkUnitScalarClampToByte(hsv[2]);

    if (0 == s) { // shade of gray
        return SkColorSetARGB(a, v, v, v);
    }
    let hx = (hsv[0] < 0 || hsv[0] >= (360)) ? 0 : SkScalarToFixed(hsv[0] / 60);
    let f = hx & 0xFFFF;

    let v_scale = SkAlpha255To256(v);
    let p = SkAlphaMul(255 - s, v_scale);
    let q = SkAlphaMul(255 - (imul(s, f) >> 16), v_scale);
    let t = SkAlphaMul(255 - (imul(s, (SK_Fixed1 - f)) >> 16), v_scale);

    let r: number, g: number, b: number;

    switch (hx >> 16) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        default: r = v; g = p; b = q; break;
    }
    return SkColorSetARGB(a, r, g, b);
}

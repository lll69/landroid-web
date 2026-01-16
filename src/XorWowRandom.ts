/*
 * Copyright 2010-2018 JetBrains s.r.o. and Kotlin Programming Language contributors.
 * Use of this source code is governed by the Apache 2.0 license that can be found in the license/LICENSE.txt file.
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

import { ARandom } from "@thi.ng/random";

const clz32 = Math.clz32;

function takeUpperBits(num: number, bitCount: number): number {
    return (num >>> (32 - bitCount)) & ((-bitCount) >> (31));
}

function fastLog2(value: number): number {
    return 31 - clz32(value);
}

function nextBits(rnd: XorWowRandom, bitCount: number) {
    return takeUpperBits(rnd.intSigned(), bitCount);
}

/**
 * Random number generator, using Marsaglia's "xorwow" algorithm
 *
 * Cycles after 2^192 - 2^32 repetitions.
 *
 * For more details, see Marsaglia, George (July 2003). "Xorshift RNGs". Journal of Statistical Software. 8 (14). doi:10.18637/jss.v008.i14
 *
 * Available at https://www.jstatsoft.org/v08/i14/paper
 *
 */
export class XorWowRandom extends ARandom {
    private buf: Int32Array;

    constructor(seed1: number, seed2: number) {
        super();
        this.buf = new Int32Array(6);
        this.buf[0] = seed1 | 0;
        this.buf[1] = seed2 | 0;
        this.buf[2] = 0;
        this.buf[3] = 0;
        this.buf[4] = ~seed1;
        this.buf[5] = (seed1 << 10) ^ (seed2 >>> 4);
        if ((this.buf[0] | this.buf[1] | this.buf[2] | this.buf[3] | this.buf[4]) === 0) {
            throw new Error("Initial state must have at least one non-zero element.");
        }

        // some trivial seeds can produce several values with zeroes in upper bits, so we discard first 64
        for (let i = 0; i < 64; i++) { this.intSigned(); }
    }

    intSigned(): number {
        // Equivalent to the xorxow algorithm
        // From Marsaglia, G. 2003. Xorshift RNGs. J. Statis. Soft. 8, 14, p. 5
        const buf = this.buf;
        let t = buf[0];
        t ^= (t >>> 2);
        buf[0] = buf[1];
        buf[1] = buf[2];
        buf[2] = buf[3];
        const v0 = buf[4];
        buf[3] = v0;
        t = (t ^ (t << 1)) ^ v0 ^ (v0 << 4);
        buf[4] = t;
        return (t + ((buf[5] += 362437) | 0)) | 0;
    }

    int(): number {
        return this.intSigned() >>> 0;
    }

    minmaxInt(from: number, until: number): number {
        if (until <= from) throw new Error("Random range is empty: [" + from + ", " + until + ").");
        const n = (until - from) | 0;
        if (n > 0 || n === -2147483648) {
            if ((n & -n) === n) {
                const bitCount = fastLog2(n);
                return (from + nextBits(this, bitCount)) | 0;
            } else {
                let v: number;
                let bits: number;
                do {
                    bits = this.intSigned() >>> 1;
                    v = bits % n;
                } while (((bits - v + (n - 1)) | 0) < 0);
                return (from + v) | 0;
            }
        } else {
            while (true) {
                const rnd = this.intSigned();
                if (from <= rnd && rnd < until) return rnd;
            }
        }
    }

    float(norm: number = 1): number {
        return nextBits(this, 24) / (1 << 24) * norm;
    }
}

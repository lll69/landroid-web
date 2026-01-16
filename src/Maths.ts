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

const exp = Math.exp;
const pow = Math.pow;

/** smoothstep. Ken Perlin's version */
export function smooth(x: number): number {
    return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Kind of like an inverted smoothstep, but */
export function invsmoothish(x: number): number {
    return 0.25 * (pow(2 * x - 1, 5) + 1) + 0.5 * x;
}

/** Compute the fraction that progress represents between start and end (inverse of lerp). */
export function lexp(start: number, end: number, progress: number): number {
    return (progress - start) / (end - start);
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    } else if (value > max){
        return max;
    }
    return value;
}

/** Exponentially smooth current toward target by a factor of speed. */
export function expSmooth(current: number, target: number, dt: number, speed: number): number {
    return current + (target - current) * (1 - exp(-dt * speed))
}

/*
 * Copyright 2010-2025 JetBrains s.r.o. and Kotlin Programming Language contributors.
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

/**
 * Randomly shuffles elements in this array in-place using the specified [random] instance as the source of randomness.
 * 
 * See: [A modern version of Fisher-Yates shuffle algorithm](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm).
 */
export function shuffleArray<T>(arr: Array<T>, random: ARandom): void {
    for (let i = arr.length - 1; i >= 1; i--) {
        let j = random.minmaxInt(0, i + 1);
        let copy = arr[i];
        arr[i] = arr[j];
        arr[j] = copy;
    }
}

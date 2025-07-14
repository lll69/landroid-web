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

import { ARandom } from "@thi.ng/random";
import { shuffleArray } from "./Arrays";

/**
 * A bag of stones. Each time you pull one out it is not replaced, preventing duplicates. When the
 * bag is exhausted, all the stones are replaced and reshuffled.
 */
export class Bag<T> {
    items: Array<T>;
    private remaining: Array<T>;
    private next: number; // will cause a shuffle on first pull()

    constructor(items: Array<T>) {
        this.items = items;
        this.remaining = Array.from(items);
        this.next = items.length;
    }

    /** Return the next random item from the bag, without replacing it. */
    pull(rng: ARandom): T {
        if (this.next >= this.remaining.length) {
            shuffleArray(this.remaining, rng);
            this.next = 0;
        }
        return this.remaining[this.next++];
    }
}


/**
 * A loot table. The weight of each possibility is in the first of the pair; the value to be
 * returned in the second. They need not add up to 1f (we will do that for you, free of charge).
 */
export class RandomTable<T> {
    private pairs: Array<Array<number | T>>;
    private total: number;

    constructor(pairs: Array<Array<number | T>>) {
        this.pairs = pairs;
        let total = 0;
        for (let i = 0, len = pairs.length; i < len; i++) {
            total += pairs[i][0] as number;
        }
        this.total = total;
    }

    /** Select a random value from the weighted table. */
    roll(rng: ARandom): T {
        let x = rng.minmax(0, this.total);
        const pairs = this.pairs;
        const len = pairs.length;
        for (let i = 0; i < len; i++) {
            x -= pairs[i][0] as number;
            if (x < 0) return pairs[i][1] as T;
        }
        return pairs[len - 1][1] as T;
    }
}

export function chooseRandom<T>(random: ARandom, array: readonly T[]) {
    return array[random.minmaxInt(0, array.length)];
}

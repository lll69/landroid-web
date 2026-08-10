/*
 * Copyright (C) 2007 The Android Open Source Project
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

import { TimeInterpolator } from "./TimeInterpolator";

const { pow } = Math;

/**
 * An interpolator where the rate of change starts out quickly and
 * and then decelerates.
 *
 */
export class DecelerateInterpolator implements TimeInterpolator {
    mFactor: number;

    /**
     * Constructor
     *
     * @param factor Degree to which the animation should be eased. Setting factor to 1.0f produces
     *        an upside-down y=x^2 parabola. Increasing factor above 1.0f makes exaggerates the
     *        ease-out effect (i.e., it starts even faster and ends evens slower)
     */
    constructor(factor?: number) {
        this.mFactor = factor !== undefined ? factor : 1;
    }

    getInterpolation(input: number) {
        let result: number;
        if (this.mFactor == 1.0) {
            result = (1.0 - (1.0 - input) * (1.0 - input));
        } else {
            result = (1.0 - pow((1.0 - input), 2 * this.mFactor));
        }
        return result;
    }
}

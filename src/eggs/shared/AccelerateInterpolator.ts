/*
 * Copyright (C) 2006 The Android Open Source Project
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
 * An interpolator where the rate of change starts out slowly and
 * and then accelerates.
 *
 */
export class AccelerateInterpolator implements TimeInterpolator {
    readonly mFactor: number;
    readonly mDoubleFactor: number;

    /**
     * Constructor
     *
     * @param factor Degree to which the animation should be eased. Seting
     *        factor to 1.0f produces a y=x^2 parabola. Increasing factor above
     *        1.0f  exaggerates the ease-in effect (i.e., it starts even
     *        slower and ends evens faster)
     */
    constructor(factor?: number) {
        this.mFactor = factor !== undefined ? factor : 1;
        this.mDoubleFactor = 2 * this.mFactor;
    }

    getInterpolation(input: number) {
        if (this.mFactor == 1.0) {
            return input * input;
        } else {
            return pow(input, this.mDoubleFactor);
        }
    }
}

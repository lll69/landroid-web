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

const { cos, PI } = Math;

/**
 * An interpolator where the rate of change starts and ends slowly but
 * accelerates through the middle.
 */
export class AccelerateDecelerateInterpolator implements TimeInterpolator {
    getInterpolation(input: number) {
        return (cos((input + 1) * PI) / 2.0) + 0.5;
    }
}

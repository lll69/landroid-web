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
import { Namer } from "./Namer";
import { Bag } from "./Randomness";
import { Planet } from "./Universe";

export class Namer15 extends Namer {
    private readonly activities = new Bag([
        "refueling",
        "sightseeing",
        "vacationing",
        "luncheoning",
        "recharging",
        "taking up space",
        "reticulating space splines",
        "using facilities",
        "spelunking",
        "repairing",
        "herding {fauna}",
        "taming {fauna}",
        "breeding {fauna}",
        "singing lullabies to {fauna}",
        "singing lullabies to {flora}",
        "singing lullabies to the {planet}",
        "gardening {flora}",
        "collecting {flora}",
        "surveying the {planet}",
        "mapping the {planet}",
        "breathing {atmo}",
        "reprocessing {atmo}",
        "bottling {atmo}"
    ]);

    private readonly floraGenericPlurals = new Bag([
        "flora",
        "plants",
        "flowers",
        "trees",
        "mosses",
        "specimens",
        "life",
        "cells"
    ]);

    private readonly faunaGenericPlurals = new Bag([
        "fauna",
        "animals",
        "locals",
        "creatures",
        "critters",
        "wildlife",
        "specimens",
        "life",
        "cells"
    ]);

    private readonly atmoGenericPlurals = new Bag([
        "air",
        "atmosphere",
        "clouds",
        "atmo",
        "gases"
    ]);

    private readonly TEMPLATE_REGEX = /{(flora|fauna|planet|atmo)}/;

    floraPlural(rng: ARandom): string {
        return this.floraGenericPlurals.pull(rng);
    }

    faunaPlural(rng: ARandom): string {
        return this.faunaGenericPlurals.pull(rng);
    }

    atmoPlural(rng: ARandom): string {
        return this.atmoGenericPlurals.pull(rng);
    }

    describeActivity(rng: ARandom, target: Planet | null): string {
        return this.activities
            .pull(rng)
            .replace(this.TEMPLATE_REGEX, (_, it) => {
                switch (it) {
                    case "flora": return (target ? target.flora : "SOME") + " " + this.floraPlural(rng);
                    case "fauna": return (target ? target.fauna : "SOME") + " " + this.faunaPlural(rng);
                    case "atmo": return (target ? target.atmosphere : "SOME") + " " + this.atmoPlural(rng);
                    case "planet": return (target ? target.description : "SOME BODY"); // once told me
                    default: return "unknown template tag: " + it;
                }
            })
            .toUpperCase();
    }
}

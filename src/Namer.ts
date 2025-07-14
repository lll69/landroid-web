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
import { Bag, RandomTable } from "./Randomness"

const enum NamerConst {
    SUFFIX_PROB = 0.75,
    LETTER_PROB = 0.3,
    NUMBER_PROB = 0.3,
    RARE_PROB = 0.05,
}

export class Namer {
    private readonly planetDescriptors = new Bag([
        "earthy",
        "swamp",
        "frozen",
        "grassy",
        "arid",
        "crowded",
        "ancient",
        "lively",
        "homey",
        "modern",
        "boring",
        "compact",
        "expensive",
        "polluted",
        "rusty",
        "sandy",
        "undulating",
        "verdant",
        "tessellated",
        "hollow",
        "scalding",
        "hemispherical",
        "oblong",
        "oblate",
        "vacuum",
        "high-pressure",
        "low-pressure",
        "plastic",
        "metallic",
        "burned-out",
        "bucolic"
    ]);

    private readonly lifeDescriptors = new Bag([
        "aggressive",
        "passive-aggressive",
        "shy",
        "timid",
        "nasty",
        "brutish",
        "short",
        "absent",
        "teen-aged",
        "confused",
        "transparent",
        "cubic",
        "quadratic",
        "higher-order",
        "huge",
        "tall",
        "wary",
        "loud",
        "yodeling",
        "purring",
        "slender",
        "cats",
        "adorable",
        "eclectic",
        "electric",
        "microscopic",
        "trunkless",
        "myriad",
        "cantankerous",
        "gargantuan",
        "contagious",
        "fungal",
        "cattywampus",
        "spatchcocked",
        "rotisserie",
        "farm-to-table",
        "organic",
        "synthetic",
        "unfocused",
        "focused",
        "capitalist",
        "communal",
        "bossy",
        "malicious",
        "compliant",
        "psychic",
        "oblivious",
        "passive",
        "bonsai"
    ]);

    private readonly anyDescriptors = new Bag([
        "silly",
        "dangerous",
        "vast",
        "invisible",
        "superfluous",
        "superconducting",
        "superior",
        "alien",
        "phantom",
        "friendly",
        "peaceful",
        "lonely",
        "uncomfortable",
        "charming",
        "fractal",
        "imaginary",
        "forgotten",
        "tardy",
        "gassy",
        "fungible",
        "bespoke",
        "artisanal",
        "exceptional",
        "puffy",
        "rusty",
        "fresh",
        "crusty",
        "glossy",
        "lovely",
        "processed",
        "macabre",
        "reticulated",
        "shocking",
        "void",
        "undefined",
        "gothic",
        "beige",
        "mid",
        "milquetoast",
        "melancholy",
        "unnerving",
        "cheery",
        "vibrant",
        "heliotrope",
        "psychedelic",
        "nondescript",
        "indescribable",
        "tubular",
        "toroidal",
        "voxellated",
        "low-poly",
        "low-carb",
        "100% cotton",
        "synthetic",
        "boot-cut",
        "bell-bottom",
        "bumpy",
        "fluffy",
        "sous-vide",
        "tepid",
        "upcycled",
        "sous-vide",
        "bedazzled",
        "ancient",
        "inexplicable",
        "sparkling",
        "still",
        "lemon-scented",
        "eccentric",
        "tilted",
        "pungent",
        "pine-scented",
        "corduroy",
        "overengineered",
        "bioengineered",
        "impossible"
    ]);

    private readonly atmoDescriptors = new Bag([
        "toxic",
        "breathable",
        "radioactive",
        "clear",
        "calm",
        "peaceful",
        "vacuum",
        "stormy",
        "freezing",
        "burning",
        "humid",
        "tropical",
        "cloudy",
        "obscured",
        "damp",
        "dank",
        "clammy",
        "frozen",
        "contaminated",
        "temperate",
        "moist",
        "minty",
        "relaxed",
        "skunky",
        "breezy",
        "soup"
    ]);

    private readonly planetTypes = new Bag([
        "planet",
        "planetoid",
        "moon",
        "moonlet",
        "centaur",
        "asteroid",
        "space garbage",
        "detritus",
        "satellite",
        "core",
        "giant",
        "body",
        "slab",
        "rock",
        "husk",
        "planemo",
        "object",
        "planetesimal",
        "exoplanet",
        "ploonet"
    ]);

    private readonly constellations = new Bag([
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
        "Andromeda",
        "Cygnus",
        "Draco",
        "Alcor",
        "Calamari",
        "Cuckoo",
        "Neko",
        "Monoceros",
        "Norma",
        "Abnorma",
        "Morel",
        "Redlands",
        "Cupcake",
        "Donut",
        "Eclair",
        "Froyo",
        "Gingerbread",
        "Honeycomb",
        "Icecreamsandwich",
        "Jellybean",
        "Kitkat",
        "Lollipop",
        "Marshmallow",
        "Nougat",
        "Oreo",
        "Pie",
        "Quincetart",
        "Redvelvetcake",
        "Snowcone",
        "Tiramisu",
        "Upsidedowncake",
        "Vanillaicecream",
        "Android",
        "Binder",
        "Campanile",
        "Dread"
    ]);

    private readonly constellationsRare = new Bag([
        "Jandycane",
        "Zombiegingerbread",
        "Astro",
        "Bender",
        "Flan",
        "Untitled-1",
        "Expedit",
        "Petit Four",
        "Worcester",
        "Xylophone",
        "Yellowpeep",
        "Zebraball",
        "Hutton",
        "Klang",
        "Frogblast",
        "Exo",
        "Keylimepie",
        "Nat",
        "Nrp"
    ]);

    private readonly suffixes = new Bag([
        "Alpha",
        "Beta",
        "Gamma",
        "Delta",
        "Epsilon",
        "Zeta",
        "Eta",
        "Theta",
        "Iota",
        "Kappa",
        "Lambda",
        "Mu",
        "Nu",
        "Xi",
        "Omicron",
        "Pi",
        "Rho",
        "Sigma",
        "Tau",
        "Upsilon",
        "Phi",
        "Chi",
        "Psi",
        "Omega",

        "Prime",
        "Secundo",
        "Major",
        "Minor",
        "Diminished",
        "Augmented",
        "Ultima",
        "Penultima",
        "Mid",

        "Proxima",
        "Novis",

        "Plus"
    ]);

    private readonly suffixesRare = new Bag([
        "Serif",
        "Sans",
        "Oblique",
        "Grotesque",
        "Handtooled",
        "III “Trey”",
        "Alfredo",
        "2.0",
        "(Final)",
        "(Final (Final))",
        "(Draft)",
        "Con Carne",
    ]);

    private readonly planetTable = new RandomTable([[0.75, this.planetDescriptors], [0.25, this.anyDescriptors]]);

    private readonly lifeTable = new RandomTable([[0.75, this.lifeDescriptors], [0.25, this.anyDescriptors]]);

    private readonly constellationsTable =
        new RandomTable([[NamerConst.RARE_PROB, this.constellationsRare], [1 - NamerConst.RARE_PROB, this.constellations]]);

    private readonly suffixesTable = new RandomTable([[NamerConst.RARE_PROB, this.suffixesRare], [1 - NamerConst.RARE_PROB, this.suffixes]]);

    private readonly atmoTable = new RandomTable([[0.75, this.atmoDescriptors], [0.25, this.anyDescriptors]]);

    private readonly delimiterTable =
        new RandomTable([
            [15, " "],
            [3, "-"],
            [1, "_"],
            [1, "/"],
            [1, "."],
            [1, "*"],
            [1, "^"],
            [1, "#"],
            [0.1, "(^*!%@##!!"]
        ]);

    describePlanet(rng: ARandom): string {
        return this.planetTable.roll(rng).pull(rng) + " " + this.planetTypes.pull(rng)
    }

    describeLife(rng: ARandom): string {
        return this.lifeTable.roll(rng).pull(rng)
    }

    nameSystem(rng: ARandom): string {
        let parts = this.constellationsTable.roll(rng).pull(rng);
        if (rng.float() <= NamerConst.SUFFIX_PROB) {
            parts += this.delimiterTable.roll(rng);
            parts += this.suffixesTable.roll(rng).pull(rng);
            if (rng.float() <= NamerConst.RARE_PROB) {
                parts += ' ';
                parts += this.suffixesRare.pull(rng);
            }
        }
        if (rng.float() <= NamerConst.LETTER_PROB) {
            parts += this.delimiterTable.roll(rng);
            parts += String.fromCharCode(65 + rng.minmaxInt(0, 26));
            if (rng.float() <= NamerConst.RARE_PROB) parts += this.delimiterTable.roll(rng);
        }
        if (rng.float() <= NamerConst.NUMBER_PROB) {
            parts += this.delimiterTable.roll(rng);
            parts += rng.minmaxInt(2, 5039);
        }
        return parts;
    }

    describeAtmo(rng: ARandom): string {
        return this.atmoTable.roll(rng).pull(rng);
    }
}

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
        "Earthy",
        "Swamp",
        "Frozen",
        "Grassy",
        "Arid",
        "Crowded",
        "Ancient",
        "Lively",
        "Homey",
        "Modern",
        "Boring",
        "Compact",
        "Expensive",
        "Polluted",
        "Rusty",
        "Sandy",
        "Undulating",
        "Verdant",
        "Tessellated",
        "Hollow",
        "Scalding",
        "Hemispherical",
        "Oblong",
        "Oblate",
        "Vacuum",
        "High-pressure",
        "Low-pressure",
        "Plastic",
        "Metallic",
        "Burned-out",
        "Bucolic"
    ]);

    private readonly lifeDescriptors = new Bag([
        "Aggressive",
        "Passive-aggressive",
        "Shy",
        "Timid",
        "Nasty",
        "Brutish",
        "Short",
        "Absent",
        "Teen-aged",
        "Confused",
        "Transparent",
        "Cubic",
        "Quadratic",
        "Higher-order",
        "Huge",
        "Tall",
        "Wary",
        "Loud",
        "Yodeling",
        "Purring",
        "Slender",
        "Cats",
        "Adorable",
        "Eclectic",
        "Electric",
        "Microscopic",
        "Trunkless",
        "Myriad",
        "Cantankerous",
        "Gargantuan",
        "Contagious",
        "Fungal",
        "Cattywampus",
        "Spatchcocked",
        "Rotisserie",
        "Farm-to-table",
        "Organic",
        "Synthetic",
        "Unfocused",
        "Focused",
        "Capitalist",
        "Communal",
        "Bossy",
        "Malicious",
        "Compliant",
        "Psychic",
        "Oblivious",
        "Passive",
        "Bonsai"
    ]);

    private readonly anyDescriptors = new Bag([
        "Silly",
        "Dangerous",
        "Vast",
        "Invisible",
        "Superfluous",
        "Superconducting",
        "Superior",
        "Alien",
        "Phantom",
        "Friendly",
        "Peaceful",
        "Lonely",
        "Uncomfortable",
        "Charming",
        "Fractal",
        "Imaginary",
        "Forgotten",
        "Tardy",
        "Gassy",
        "Fungible",
        "Bespoke",
        "Artisanal",
        "Exceptional",
        "Puffy",
        "Rusty",
        "Fresh",
        "Crusty",
        "Glossy",
        "Lovely",
        "Processed",
        "Macabre",
        "Reticulated",
        "Shocking",
        "Void",
        "Undefined",
        "Gothic",
        "Beige",
        "Mid",
        "Milquetoast",
        "Melancholy",
        "Unnerving",
        "Cheery",
        "Vibrant",
        "Heliotrope",
        "Psychedelic",
        "Nondescript",
        "Indescribable",
        "Tubular",
        "Toroidal",
        "Voxellated",
        "Low-poly",
        "Low-carb",
        "100% cotton",
        "Synthetic",
        "Boot-cut",
        "Bell-bottom",
        "Bumpy",
        "Fluffy",
        "Sous-vide",
        "Tepid",
        "Upcycled",
        "Sous-vide",
        "Bedazzled",
        "Ancient",
        "Inexplicable",
        "Sparkling",
        "Still",
        "Lemon-scented",
        "Eccentric",
        "Tilted",
        "Pungent",
        "Pine-scented",
        "Corduroy",
        "Overengineered",
        "Bioengineered",
        "Impossible"
    ]);

    private readonly atmoDescriptors = new Bag([
        "Toxic",
        "Breathable",
        "Radioactive",
        "Clear",
        "Calm",
        "Peaceful",
        "Vacuum",
        "Stormy",
        "Freezing",
        "Burning",
        "Humid",
        "Tropical",
        "Cloudy",
        "Obscured",
        "Damp",
        "Dank",
        "Clammy",
        "Frozen",
        "Contaminated",
        "Temperate",
        "Moist",
        "Minty",
        "Relaxed",
        "Skunky",
        "Breezy",
        "Soup"
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

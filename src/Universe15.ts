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

import { Autopilot15 } from "./Autopilot15";
import { drawFlag } from "./Flag15";
import { clamp } from "./Maths";
import { Body, Simulator } from "./Physics";
import { Fuse } from "./Physics15";
import { Landing, Planet, Removable, SCALED_THRUST, Spacecraft, UniverseConst } from "./Universe";
import { Vec2_makeWithAngleMag, Vec2_makeWithAngleMagAdd } from "./Vec2";

const updateBody = Body.prototype.update;

export class Landing15 extends Landing implements Removable {
    text: string;
    private fuse: Fuse;

    constructor(ship: Spacecraft, planet: Planet, angle: number, text: string) {
        super(ship, planet, angle);
        this.text = text;
    }

    solve(sim: Simulator, dt: number): void {
        super.solve(sim, dt);
        if (drawFlag) this.fuse.update(dt);
    }

    canBeRemoved(): boolean {
        return drawFlag && this.fuse.canBeRemoved();
    }
}

export class Spacecraft15 extends Spacecraft {
    autopilot: Autopilot15 | null = null;

    update(sim: Simulator, dt: number) {
        // check for thrusters
        const thrustMag = this.thrust.mag();
        if (thrustMag > 0) {
            let deltaV = UniverseConst.MAIN_ENGINE_ACCEL * dt;
            if (SCALED_THRUST) deltaV *= clamp(thrustMag, 0, 1);

            if (this.landing !== null) {
                if (this.launchClock === 0) this.launchClock = sim.now + 1; /* @@@ TODO extract */

                if (sim.now > this.launchClock) {
                    // detach from landing site
                    this.landing.ship = null;
                    this.landing = null;
                } else {
                    deltaV = 0;
                }
            }

            // this is it. impart thrust to the ship.
            // note that we always thrust in the forward direction
            Vec2_makeWithAngleMagAdd(this.velocity, this.angle, deltaV);
        } else {
            if (this.launchClock !== 0) this.launchClock = 0;
        }

        // apply global speed limit
        if (this.velocity.mag() > UniverseConst.CRAFT_SPEED_LIMIT)
            Vec2_makeWithAngleMag(this.velocity, this.velocity.angle(), UniverseConst.CRAFT_SPEED_LIMIT);

        updateBody.call(this, sim, dt);
    }
}

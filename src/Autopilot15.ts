/*
 * Copyright (C) 2024 The Android Open Source Project
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

import { ARandom, SYSTEM } from "@thi.ng/random";
import { sprintf } from "sprintf-js";
import { expSmooth } from "./Maths";
import { Entity, Simulator } from "./Physics";
import { chooseRandom } from "./Randomness";
import { Planet, Universe, UniverseConst } from "./Universe";
import { Spacecraft15 } from "./Universe15";
import { Vec2, Vec2_angle, Vec2_makeWithAngleMag } from "./Vec2";

const enum AutopilotConst {
    BRAKING_TIME = 5,
    SIGHTSEEING_TIME = 15,
    LAUNCH_THRUST_TIME = 5,
    STRATEGY_MIN_TIME = 0.5
}


export class Autopilot15 implements Entity {
    ship: Spacecraft15;
    universe: Universe;

    enabled = false;

    target: Planet | null = null;

    landingAltitude = 0;

    nextStrategyTime = 0;

    brakingDistance = 0;

    // used by rendering
    leadingPos = Vec2.Zero();
    leadingVector = Vec2.Zero();

    rng: ARandom = SYSTEM;

    getTelemetry() {
        return ("---- AUTOPILOT ENGAGED ----\n" +
            "TGT: " + (this.target && this.target.name ? this.target.name : "SELECTING...") +
            "\nEXE: " + this.strategy + ((this.debug.length > 0) ? " (" + this.debug + ")" : ""));
    }

    private strategy: string = "NONE";
    private debug: string = "";

    constructor(ship: Spacecraft15, universe: Universe) {
        this.ship = ship;
        this.universe = universe;
    }

    update(sim: Simulator, dt: number) {
        if (!this.enabled) return;

        if (sim.now < this.nextStrategyTime) {
            return;
        }

        const currentStrategy = this.strategy;

        if (this.ship.landing !== null) {
            if (this.target !== null) {
                this.strategy = "LANDED";
                this.debug = "";
                // we just got here. see the sights.
                this.target = null;
                this.landingAltitude = 0;
                this.nextStrategyTime = sim.now + AutopilotConst.SIGHTSEEING_TIME;
            } else {
                // full power until we blast off
                Vec2_makeWithAngleMag(this.ship.thrust, this.ship.angle, 1);

                this.strategy = "LAUNCHING";
                this.debug = "";
                this.nextStrategyTime = sim.now + AutopilotConst.LAUNCH_THRUST_TIME;
            }
        } else {
            // select new target

            if (this.target === null) {
                // testing: target the first planet
                //   target = universe.planets[0]

                // target the nearest unexplored planet
                this.target =
                    this.universe.planets
                        .sort((a, b) => this.ship.pos.distance(a.pos) - this.ship.pos.distance(b.pos))
                        .find(it => !it.explored) || null;
                this.brakingDistance = 0;

                // if we've explored them all, pick one at random
                if (this.target === null) this.target = chooseRandom(this.rng, this.universe.planets);
            }

            if (this.target !== null) { // should be nonnull
                const shipV = this.ship.velocity;
                const targetV = this.target.velocity;
                const targetVectorX = (this.target.pos.x - this.ship.pos.x);
                const targetVectorY = (this.target.pos.y - this.ship.pos.y);
                const targetVectorMag = Math.sqrt(targetVectorX * targetVectorX + targetVectorY * targetVectorY);
                const altitude = targetVectorMag - this.target.radius;

                this.landingAltitude = Math.min(this.target.radius, 100);

                // the following is in the moving reference frame of the target
                const relativeVx = shipV.x - targetV.x;
                const relativeVy = shipV.y - targetV.y;
                const projection = (relativeVx * targetVectorX + relativeVy * targetVectorY) / targetVectorMag;
                const relativeSpeed = Math.sqrt(relativeVx * relativeVx + relativeVy * relativeVy) * Math.sign(projection);
                const timeToTarget = (relativeSpeed !== 0) ? altitude / relativeSpeed : 1_000;

                const newBrakingDistance =
                    AutopilotConst.BRAKING_TIME * ((relativeSpeed > 0) ? relativeSpeed : UniverseConst.MAIN_ENGINE_ACCEL);
                this.brakingDistance =
                    expSmooth(this.brakingDistance, newBrakingDistance, sim.dt, 5);

                // We're going to aim at where the target will be, but we want to make sure to
                // compute
                Vec2_makeWithAngleMag(
                    this.leadingPos,
                    this.target.velocity.angle(),
                    Math.min(altitude / 2, this.target.velocity.mag())
                ).addSelf(this.target.pos);
                this.leadingVector.x = this.leadingPos.x - this.ship.pos.x;
                this.leadingVector.y = this.leadingPos.y - this.ship.pos.y;

                if (altitude < this.landingAltitude) {
                    this.strategy = "LANDING"
                    // Strategy: zero thrust, face away, prepare for landing

                    this.ship.angle = Vec2_angle(this.ship.pos, this.target.pos); // point away from ground
                    this.ship.thrust.x = this.ship.thrust.y = 0;
                } else {
                    if (relativeSpeed < 0 || altitude > this.brakingDistance) {
                        this.strategy = "CHASING"
                        // Strategy: Make tracks. We are either a long way away, or falling behind.
                        this.ship.angle = this.leadingVector.angle();

                        Vec2_makeWithAngleMag(this.ship.thrust, this.ship.angle, 1.0);
                    } else {
                        this.strategy = "APPROACHING"
                        // Strategy: Just slow down. If we get caught in the gravity well, it will
                        // gradually start pulling us more in the direction of the planet, which
                        // will create a graceful deceleration
                        this.ship.angle = (this.ship.velocity.angle() + Math.PI);

                        // We want to bleed off velocity over time. Specifically, relativeSpeed px/s
                        // over timeToTarget seconds.
                        const decel = relativeSpeed / timeToTarget;
                        const decelThrust =
                            decel / UniverseConst.MAIN_ENGINE_ACCEL * 0.9 // not quite slowing down enough
                        Vec2_makeWithAngleMag(this.ship.thrust, this.ship.angle, decelThrust);
                    }
                }
                this.debug = sprintf("DV=%.0f D=%.0f T%+.1f", relativeSpeed, altitude, timeToTarget);
            }
            if (this.strategy !== currentStrategy) {
                this.nextStrategyTime = sim.now + AutopilotConst.STRATEGY_MIN_TIME;
            }
        }
    }

    postUpdate(sim: Simulator, dt: number) {
        // if (!this.enabled) return;
    }
}

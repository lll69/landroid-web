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

import { ARandom, SYSTEM } from "@thi.ng/random";
import { newRandom } from "./RandomKt";
import { Vec2, Vec2_copy } from "./Vec2";

const enum PhysicsConst {
    /** artificially speed up or slow down the simulation */
    TIME_SCALE = 1,

    /**
     * if it's been over 1 real second since our last timestep, don't simulate that elapsed time.
     * this allows the simulation to "pause" when, for example, the activity pauses
     */
    MAX_VALID_DT = 1,
}

export interface Entity {
    // Integrate.
    // Compute accelerations from forces, add accelerations to velocity, save old position,
    // add velocity to position.
    update(sim: Simulator, dt: number): void;

    // Post-integration step, after constraints are satisfied.
    postUpdate(sim: Simulator, dt: number): void;
}

export class Body implements Entity {
    name: string;
    readonly pos: Vec2 = Vec2.Zero();
    readonly opos: Vec2 = Vec2.Zero();
    readonly velocity: Vec2 = Vec2.Zero();

    mass: number = 0;
    angle: number = 0;
    radius: number = 0;

    collides: boolean = true;

    oangle: number = 0;

    constructor(name: string = "Unknown") {
        this.name = name;
    }

    getOmega(): number { return this.angle - this.oangle; }

    setOmega(value: number) {
        this.oangle = this.angle - value
    }

    update(sim: Simulator, dt: number) {
        if (dt <= 0) return;

        // integrate velocity
        Vec2_copy(this.opos, this.pos);
        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;

        // integrate angular velocity
        //        val wscaled = omega * timescale
        //        oangle = angle
        //        angle = (angle + wscaled) % PI2f
    }

    postUpdate(sim: Simulator, dt: number) {
        if (dt <= 0) return;
        this.velocity.x = (this.pos.x - this.opos.x) / dt;
        this.velocity.y = (this.pos.y - this.opos.y) / dt;
    }
}

export interface Constraint {
    // Solve constraints. Pick up objects and put them where they are "supposed" to be.
    solve(sim: Simulator, dt: number): void;
}

export class Container implements Constraint {
    radius: number;
    private list = new Set<Body>();
    private softness = 0.0;

    constructor(radius: number) {
        this.radius = radius;
    }

    toString(): String {
        return "Container(" + this.radius + ")";
    }

    add(p: Body) {
        this.list.add(p);
    }

    remove(p: Body) {
        this.list.delete(p);
    }

    solve(sim: Simulator, dt: number) {
        this.list.forEach(p => {
            if ((p.pos.mag() + p.radius) > this.radius) {
                const angle = p.pos.angle();
                const m = this.radius - p.radius;
                const offX = m * Math.cos(angle);
                const offY = m * Math.sin(angle);
                p.pos.x = p.pos.x * (this.softness) + offX * (1 - this.softness);
                p.pos.y = p.pos.y * (this.softness) + offY * (1 - this.softness);
            }
        })
    }
}

export class Simulator {
    readonly randomSeed: bigint;
    private wallClockMillis: number = 0;
    now: number = 0;
    dt: number = 0;
    readonly rng: ARandom;
    readonly rngForInit: ARandom;
    readonly entities = new Set<Entity>();
    readonly constraints = new Set<Constraint>();

    constructor(randomSeed: bigint) {
        this.randomSeed = randomSeed;
        this.rng = SYSTEM;
        this.rngForInit = newRandom(randomSeed);
    }

    addEntity(e: Entity) { this.entities.add(e); }
    removeEntity(e: Entity) { this.entities.delete(e); }
    addConstraint(c: Constraint) { this.constraints.add(c); }
    removeConstraint(c: Constraint) { this.constraints.delete(c); }

    updateAll(dt: number, entities: Set<Entity>) {
        entities.forEach(it => it.update(this, dt));
    }

    solveAll(dt: number, constraints: Set<Constraint>) {
        constraints.forEach(it => it.solve(this, dt));
    }

    postUpdateAll(dt: number, entities: Set<Entity>) {
        entities.forEach(it => it.postUpdate(this, dt));
    }

    step(millis: number) {
        const firstFrame = (this.wallClockMillis === 0);

        this.dt = (millis - this.wallClockMillis) / 1_000 * PhysicsConst.TIME_SCALE;
        this.wallClockMillis = millis;

        // we start the simulation on the next frame
        if (firstFrame || this.dt > PhysicsConst.MAX_VALID_DT) return;

        // simulation is running; we start accumulating simulation time
        this.now += this.dt;

        const localEntities = (this.entities);
        const localConstraints = (this.constraints);

        // position-based dynamics approach:
        // 1. apply acceleration to velocity, save positions, apply velocity to position
        this.updateAll(this.dt, localEntities);

        // 2. solve all constraints
        this.solveAll(this.dt, localConstraints);

        // 3. compute new velocities from updated positions and saved positions
        this.postUpdateAll(this.dt, localEntities);
    }
}

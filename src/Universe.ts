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

import { Deque } from "./Deque"
import { Colors } from "./Colors";
import { lerp } from "./MathHelpers";
import { clamp } from "./Maths";
import { Namer } from "./Namer";
import { Body, Constraint, Container, Entity, Simulator } from "./Physics";
import { chooseRandom } from "./Randomness";
import { Vec2, Vec2_angle, Vec2_copy, Vec2_makeWithAngleMag, Vec2_makeWithAngleMagAdd } from "./Vec2";

const PI = Math.PI;
const abs = Math.abs;
const pow = Math.pow;
const sqrt = Math.sqrt;

// in kotlin 4/3==1 (Int)
const FOUR_OVER_THREE = 1;

export const enum UniverseConst {
    UNIVERSE_RANGE = 200_000,

    NUM_PLANETS_RANGE_MIN = 1,
    NUM_PLANETS_RANGE_MAX = 10,
    STAR_RADIUS_RANGE_MIN = 1_000,
    STAR_RADIUS_RANGE_MAX = 8_000,
    PLANET_RADIUS_RANGE_MIN = 50,
    PLANET_RADIUS_RANGE_MAX = 2_000,
    PLANET_ORBIT_RANGE_MIN = (STAR_RADIUS_RANGE_MAX * 2),
    PLANET_ORBIT_RANGE_MAX = (UNIVERSE_RANGE * 0.75),

    GRAVITATION = 1e-2,
    KEPLER_CONSTANT = 50, // * 4f * PIf * PIf / GRAVITATION

    // m = d * r
    PLANETARY_DENSITY = 2.5,
    STELLAR_DENSITY = 0.5,

    SPACECRAFT_MASS = 10,

    CRAFT_SPEED_LIMIT = 5_000,
    MAIN_ENGINE_ACCEL = 1000, // thrust effect, pixels per second squared
    LAUNCH_MECO = 2, // how long to suspend gravity when launching

    TRACK_LENGTH = 10_000
}

export const SCALED_THRUST = true;

export interface Removable {
    canBeRemoved(): boolean;
}

export class Planet extends Body {
    readonly orbitCenter: Vec2;
    radius: number;
    pos: Vec2;
    speed: number;
    color: string;
    atmosphere = "";
    description = "";
    flora = "";
    fauna = "";
    explored = false;
    private readonly orbitRadius: number;
    constructor(
        orbitCenter: Vec2,
        radius: number,
        pos: Vec2,
        speed: number,
        color: string = "#FFFFFF"
    ) {
        super();
        this.orbitCenter = orbitCenter;
        this.radius = radius;
        this.pos = pos;
        this.speed = speed;
        this.color = color;
        this.orbitRadius = pos.distance(orbitCenter)
        // in kotlin 4/3==1 (Int)
        this.mass = FOUR_OVER_THREE * PI * radius * radius * radius * UniverseConst.PLANETARY_DENSITY;
    }

    update(sim: Simulator, dt: number) {
        const orbitAngle = Vec2_angle(this.pos, this.orbitCenter);
        // constant linear velocity
        Vec2_makeWithAngleMag(this.velocity, orbitAngle + PI / 2, this.speed);

        super.update(sim, dt);
    }

    postUpdate(sim: Simulator, dt: number) {
        // This is kind of like a constraint, but whatever.
        const orbitAngle = Vec2_angle(this.pos, this.orbitCenter);
        Vec2_makeWithAngleMag(this.pos, orbitAngle, this.orbitRadius)
        this.pos.x += this.orbitCenter.x;
        this.pos.y += this.orbitCenter.y;
        super.postUpdate(sim, dt)
    }
}

export const enum StarClass {
    O,
    B,
    A,
    F,
    G,
    K,
    M
}

export const StarClasses: readonly StarClass[] = Object.freeze([
    StarClass.O,
    StarClass.B,
    StarClass.A,
    StarClass.F,
    StarClass.G,
    StarClass.K,
    StarClass.M
]);

export const StarClassNames: readonly string[] = Object.freeze([
    "O",
    "B",
    "A",
    "F",
    "G",
    "K",
    "M"
]);

function starColor(cls: StarClass): string {
    switch (cls) {
        case StarClass.O: return "#6666FF";
        case StarClass.B: return "#CCCCFF";
        case StarClass.A: return "#EEEEFF";
        case StarClass.F: return "#FFFFFF";
        case StarClass.G: return "#FFFF66";
        case StarClass.K: return "#FFCC33";
        case StarClass.M: return "#FF8800";
    }
}

export class Star extends Planet {
    readonly cls: StarClass;
    radius: number;
    constructor(cls: StarClass, radius: number) {
        super(Vec2.Zero(), radius, Vec2.Zero(), 0, starColor(cls));
        this.cls = cls;
        // in kotlin 4/3==1 (Int)
        this.mass = FOUR_OVER_THREE * PI * pow(radius, 3) * UniverseConst.STELLAR_DENSITY;
        this.collides = false;
    }
    anim = 0;
    update(sim: Simulator, dt: number) {
        this.anim += dt;
    }
}

export class Universe extends Simulator {
    readonly namer: Namer;
    latestDiscovery: Planet | null = null;
    star: Star;
    ship: Spacecraft;
    planets: Array<Planet> = [];
    follow: Body | null = null;
    ringfence = new Container(UniverseConst.UNIVERSE_RANGE);

    constructor(namer: Namer, randomSeed: bigint) {
        super(randomSeed);
        this.namer = namer;
    }

    initTest() {
        const systemName = "TEST SYSTEM"
        this.star =
            new Star(
                StarClass.A,
                UniverseConst.STAR_RADIUS_RANGE_MAX,
            );
        this.star.name = "TEST SYSTEM";

        for (let it = 0; it < UniverseConst.NUM_PLANETS_RANGE_MAX; it++) {
            const thisPlanetFrac = it / (UniverseConst.NUM_PLANETS_RANGE_MAX - 1);
            const radius =
                lerp(UniverseConst.PLANET_RADIUS_RANGE_MIN, UniverseConst.PLANET_RADIUS_RANGE_MAX, thisPlanetFrac);
            const orbitRadius =
                lerp(UniverseConst.PLANET_ORBIT_RANGE_MIN, UniverseConst.PLANET_ORBIT_RANGE_MAX, thisPlanetFrac);

            const period = sqrt(orbitRadius * orbitRadius * orbitRadius / this.star.mass) * UniverseConst.KEPLER_CONSTANT;
            const speed = 2 * PI * orbitRadius / period;

            const p = new Planet(
                this.star.pos.copy(),
                radius,
                Vec2_makeWithAngleMag(Vec2.Zero(), thisPlanetFrac * PI * 2, orbitRadius).addSelf(this.star.pos),
                speed,
                Colors.Eigengrau4
            );
            console.log(
                "Landroid",
                "created planet", p, "with period", period, "and vel", speed
            );
            const num = it + 1;
            p.description = "TEST PLANET #" + num;
            p.atmosphere = "radius=" + radius;
            p.flora = "mass=" + p.mass;
            p.fauna = "speed=" + speed;
            this.planets.push(p);
            this.addEntity(p);
        }

        this.planets.sort((a, b) => a.pos.distance(this.star.pos) - b.pos.distance(this.star.pos));
        this.planets.forEach((planet, idx) => planet.name = (systemName + " " + (idx + 1)));
        this.addEntity(this.star);

        this.ship = new Spacecraft();

        Vec2_makeWithAngleMag(this.ship.pos, PI / 4, UniverseConst.PLANET_ORBIT_RANGE_MIN).addSelf(this.star.pos);
        this.ship.angle = 0;
        this.addEntity(this.ship);

        this.ringfence.add(this.ship);
        this.addConstraint(this.ringfence);

        this.follow = this.ship;
    }

    initRandom() {
        const systemName = this.namer.nameSystem(this.rngForInit);
        this.star = new Star(
            chooseRandom(this.rngForInit, StarClasses),
            this.rngForInit.minmax(UniverseConst.STAR_RADIUS_RANGE_MIN, UniverseConst.STAR_RADIUS_RANGE_MAX)
        );
        this.star.name = systemName;
        for (let it = 0, times = this.rngForInit.minmaxInt(UniverseConst.NUM_PLANETS_RANGE_MIN, UniverseConst.NUM_PLANETS_RANGE_MAX + 1); it < times; it++) {
            const radius = this.rngForInit.minmax(UniverseConst.PLANET_RADIUS_RANGE_MIN, UniverseConst.PLANET_RADIUS_RANGE_MAX);
            const orbitRadius =
                lerp(
                    UniverseConst.PLANET_ORBIT_RANGE_MIN,
                    UniverseConst.PLANET_ORBIT_RANGE_MAX,
                    this.rngForInit.float()
                );

            // Kepler's third law
            const period = sqrt(orbitRadius * orbitRadius * orbitRadius / this.star.mass) * UniverseConst.KEPLER_CONSTANT;
            const speed = 2 * PI * orbitRadius / period;

            const p = new Planet(
                this.star.pos,
                radius,
                Vec2_makeWithAngleMag(Vec2.Zero(), this.rngForInit.float() * PI * 2, orbitRadius).addSelf(this.star.pos),
                speed,
                Colors.Eigengrau4
            );
            console.log(
                "Landroid",
                "created planet", p, "with period", period, "and vel", speed
            );
            p.description = this.namer.describePlanet(this.rngForInit);
            p.atmosphere = this.namer.describeAtmo(this.rngForInit);
            p.flora = this.namer.describeLife(this.rngForInit);
            p.fauna = this.namer.describeLife(this.rngForInit);
            this.planets.push(p);
            this.addEntity(p);
        }
        this.planets.sort((a, b) => a.pos.distance(this.star.pos) - b.pos.distance(this.star.pos));
        this.planets.forEach((planet, idx) => planet.name = (systemName + " " + (idx + 1)));
        this.addEntity(this.star);

        this.ship = new Spacecraft();

        Vec2_makeWithAngleMag(
            this.ship.pos,
            this.rngForInit.float() * PI * 2,
            this.rngForInit.minmax(UniverseConst.PLANET_ORBIT_RANGE_MIN, UniverseConst.PLANET_ORBIT_RANGE_MAX)
        ).addSelf(this.star.pos);
        this.ship.angle = this.rngForInit.float() * PI * 2;
        this.addEntity(this.ship);

        this.ringfence.add(this.ship);
        this.addConstraint(this.ringfence);

        this.follow = this.ship;
    }

    updateAll(dt: number, entities: Set<Entity>) {
        // check for passing in front of the sun
        this.ship.transit = false;
        const fn = (planet: Planet) => {
            const d = planet.pos.distance(this.ship.pos);
            if (d < planet.radius) {
                if (planet instanceof Star) this.ship.transit = true
            } else if (
                this.now > this.ship.launchClock + UniverseConst.LAUNCH_MECO
            ) { // within MECO sec of launch, no gravity at all
                // simulate gravity: $ f_g = G * m1 * m2 * 1/d^2 $
                Vec2_makeWithAngleMagAdd(
                    this.ship.velocity,
                    Vec2_angle(planet.pos, this.ship.pos),
                    dt * UniverseConst.GRAVITATION * (this.ship.mass * planet.mass) / (d * d)
                );
            }
        }

        this.planets.forEach(fn);
        fn(this.star);

        super.updateAll(dt, entities);
    }

    closestPlanet(): Planet {
        const newArray = Array.from(this.planets);
        newArray.push(this.star);
        const bodiesByDist = newArray
            .map(planet => [planet.pos, planet])
            .sort((a, b) => (a[0] as Vec2).distance(this.ship.pos) - (b[0] as Vec2).distance(this.ship.pos));

        return bodiesByDist[0][1] as Planet;
    }

    closestPlanetForZoom(): Planet {
        const newArray = Array.from(this.planets);
        newArray.push(this.star);
        const bodiesByDist = newArray
            .map(planet => [planet.pos, planet])
            .sort((a, b) => ((a[0] as Vec2).distance(this.ship.pos) - (a[1] as Planet).radius * 1.2) - ((b[0] as Vec2).distance(this.ship.pos) - (b[1] as Planet).radius * 1.2));

        return bodiesByDist[0][1] as Planet;
    }

    solveAll(dt: number, constraints: Set<Constraint>) {
        if (this.ship.landing === null) {
            const planet = this.closestPlanet();

            if (planet.collides) {
                const d = (this.ship.pos.distance(planet.pos)) - this.ship.radius - planet.radius;
                const a = Vec2_angle(this.ship.pos, planet.pos);

                if (d < 0) {
                    // landing, or impact?

                    // 1. relative speed
                    const vDiff = (this.ship.velocity.distance(planet.velocity));
                    // 2. landing angle
                    const aDiff = abs(this.ship.angle - a);

                    // landing criteria
                    if (aDiff < PI / 4
                        //                        &&
                        //                        vDiff < 100f
                    ) {
                        const landing = new Landing(this.ship, planet, a);
                        this.ship.landing = landing;
                        Vec2_copy(this.ship.velocity, planet.velocity);
                        this.addConstraint(landing);

                        planet.explored = true;
                        this.latestDiscovery = planet;
                    } else {
                        const impact = Vec2_makeWithAngleMag(Vec2.Zero(), a, planet.radius).addSelf(planet.pos);
                        Vec2_makeWithAngleMag(this.ship.pos, a, planet.radius + this.ship.radius - d).addSelf(planet.pos);

                        //                        add(Spark(
                        //                            lifetime = 1f,
                        //                            style = Spark.Style.DOT,
                        //                            color = Color.Yellow,
                        //                            size = 10f
                        //                        ).apply {
                        //                            pos = impact
                        //                            opos = impact
                        //                            velocity = Vec2.Zero
                        //                        })
                        //
                        for (let it = 1; it <= 10; it++) {
                            const spark = new Spark(
                                this.rng.minmax(0.5, 2),
                                false,
                                0,
                                SparkStyle.DOT,
                                Colors.White,
                                1
                            );
                            Vec2_makeWithAngleMag(
                                spark.pos,
                                this.rng.minmax(0, 2 * PI),
                                this.rng.minmax(0.1, 0.5)
                            ).addSelf(impact);
                            Vec2_copy(spark.opos, spark.pos);
                            Vec2_makeWithAngleMag(
                                spark.velocity,
                                //                                            a +
                                // rng.nextFloatInRange(-PIf, PIf),
                                this.rng.minmax(0, 2 * PI),
                                this.rng.minmax(0.1, 0.5)
                            );
                            spark.velocity.x += this.ship.velocity.x * 0.8;
                            spark.velocity.y += this.ship.velocity.y * 0.8;
                            this.addEntity(spark);
                        }
                    }
                }
            }
        }

        super.solveAll(dt, constraints)
    }

    postUpdateAll(dt: number, entities: Set<Entity>) {
        super.postUpdateAll(dt, entities);
        entities.forEach((it: any) => {
            if ((it as Removable).canBeRemoved
                && (it as Removable).canBeRemoved()) {
                entities.delete(it);
            }
        });
    }
}

export class Landing implements Constraint {
    ship: Spacecraft | null;
    readonly planet: Planet;
    readonly angle: number;
    private landingVector: Vec2;
    constructor(ship: Spacecraft, planet: Planet, angle: number) {
        this.ship = ship;
        this.planet = planet;
        this.angle = angle;
        this.landingVector = Vec2_makeWithAngleMag(Vec2.Zero(), angle, ship.radius + planet.radius);
    }
    solve(sim: Simulator, dt: number) {
        if (this.ship !== null) {
            this.ship.pos.x = this.ship.pos.x * 0 + (this.planet.pos.x + this.landingVector.x) * 1;
            this.ship.pos.y = this.ship.pos.y * 0 + (this.planet.pos.y + this.landingVector.y) * 1; // @@@ FIXME
            this.ship.angle = this.angle;
        }
    }
}

export enum SparkStyle {
    LINE,
    LINE_ABSOLUTE,
    DOT,
    DOT_ABSOLUTE,
    RING
}

export class Spark extends Body implements Removable {
    lifetime: number;
    collides: boolean;
    mass: number;
    readonly style: SparkStyle;
    readonly color: string;
    readonly size: number;

    constructor(lifetime: number,
        collides: boolean = false,
        mass: number = 0,
        style: SparkStyle = SparkStyle.LINE,
        color: string = Colors.Gray,
        size: number = 2) {
        super();
        this.lifetime = lifetime;
        this.collides = collides;
        this.mass = mass;
        this.style = style;
        this.color = color;
        this.size = size;
    }
    update(sim: Simulator, dt: number) {
        super.update(sim, dt);
        this.lifetime -= dt;
    }
    canBeRemoved(): boolean {
        return this.lifetime < 0;
    }
    postUpdate(sim: Simulator, dt: number): void {
        // The speed of Spark is unchangeable
    }
}

export class Track {
    positions = new Deque<Vec2>(UniverseConst.TRACK_LENGTH);
    private angles = new Deque<number>(UniverseConst.TRACK_LENGTH);
    add(x: number, y: number, a: number) {
        if (this.positions.size() >= (UniverseConst.TRACK_LENGTH - 1)) {
            this.positions.removeFirst();
            this.angles.removeFirst();
            this.positions.removeFirst();
            this.angles.removeFirst();
        }
        this.positions.addLast(new Vec2(x, y));
        this.angles.addLast(a);
    }
}

export class Spacecraft extends Body {
    thrust = Vec2.Zero();
    launchClock = 0;

    transit = false;

    track = new Track();

    landing: Landing | null = null;

    constructor() {
        super();
        this.mass = UniverseConst.SPACECRAFT_MASS;
        this.radius = 12;
    }

    update(sim: Simulator, dt: number) {
        // check for thrusters
        const thrustMag = this.thrust.mag();
        if (thrustMag > 0) {
            let deltaV = UniverseConst.MAIN_ENGINE_ACCEL * dt;
            if (SCALED_THRUST) deltaV *= clamp(thrustMag, 0, 1);

            if (this.landing === null) {
                // we are free in space, so we attempt to pivot toward the desired direction
                // NOTE: no longer required thanks to FlightStick
                // angle = thrust.angle()
            } else {
                if (this.launchClock === 0) this.launchClock = sim.now + 1; /* @@@ TODO extract */

                if (sim.now > this.launchClock) {
                    // first-stage to orbit has 1000x power
                    //                    deltaV *= 1000f
                    sim.removeConstraint(this.landing);
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

        super.update(sim, dt);
    }

    postUpdate(sim: Simulator, dt: number) {
        super.postUpdate(sim, dt);

        // special effects all need to be added after the simulation step so they have
        // the correct position of the ship.
        this.track.add(this.pos.x, this.pos.y, this.angle);

        const mag = this.thrust.mag();
        if (sim.rng.float() < mag) {
            // exhaust
            const spark = new Spark(
                sim.rng.minmax(0.5, 1),
                true,
                1,
                SparkStyle.RING,
                "#FFFFFF40",
                3
            );
            Vec2_copy(spark.pos, this.pos);
            Vec2_copy(spark.opos, this.opos);
            Vec2_copy(spark.velocity, this.velocity);
            Vec2_makeWithAngleMagAdd(
                spark.velocity,
                this.angle + sim.rng.minmax(-0.2, 0.2),// -0.2,0.2
                -UniverseConst.MAIN_ENGINE_ACCEL * mag * 10 * dt
            );
            sim.addEntity(spark);
        }
    }
}

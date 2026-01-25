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
import { Colors } from "./Colors";
import { LOG } from "./Debug";
import { drawFlag } from "./Flag15";
import { lerp } from "./MathHelpers";
import { Namer15 } from "./Namer15";
import { createPolygon, drawPolygon, parseSvgPathData } from "./PathTools";
import { Constraint, Container, Simulator } from "./Physics";
import { chooseRandom } from "./Randomness";
import { Landing, Planet, Spacecraft, Spark, SparkStyle, Star, StarClass, StarClasses, UniverseConst } from "./Universe";
import { Landing15, Spacecraft15 } from "./Universe15";
import { Vec2, Vec2_angle, Vec2_copy, Vec2_makeWithAngleMag } from "./Vec2";
import { VisibleUniverse, ZoomedDrawScope } from "./VisibleUniverse";

const solveSimulator = Simulator.prototype.solveAll;

const PI = Math.PI;
const abs = Math.abs;
const sqrt = Math.sqrt;

export class ZoomedDrawScope15 extends ZoomedDrawScope {
    readonly spaceshipLegs = parseSvgPathData("\nM-7   -6.5\nl-3.5  0\nl-1   -2\nl 0    4\nl 1   -2\nZ\nM-7    6.5\nl-3.5  0\nl-1   -2\nl 0    4\nl 1   -2\nZ\n")
    readonly thrustPath = createPolygon(-3, 3, -5, 0);

    drawUniverse(universe: VisibleUniverse) {
        universe.constraints.forEach(it => {
            if (it instanceof Landing) {
                this.drawLanding(it);
            } else if (it instanceof Container) {
                this.drawContainer(it);
            }
        });
        this.drawStar(universe.star);
        universe.entities.forEach(it => {
            if (it === universe.star) return; // don't draw the star as a planet
            if (it instanceof Spark) {
                this.drawSpark(it);
            } else if (it instanceof Planet) {
                this.drawPlanet(it);
            }
        });
        const ship = universe.ship as Spacecraft15;
        const autopilot = ship.autopilot;
        if (autopilot !== null && autopilot.enabled) {
            this.drawAutopilot(autopilot);
        }
        this.drawSpacecraft(ship);
    }
    drawSpacecraft(ship: Spacecraft) {
        const context = this.context;
        const helper = this.helper;
        const oldHelperX = helper.x;
        const oldHelperY = helper.y;
        helper.x -= ship.pos.x;
        helper.y -= ship.pos.y;
        context.save();
        context.translate(ship.pos.x, ship.pos.y);
        context.rotate(ship.angle);
        // new in V: little landing legs
        if (ship.landing !== null) {
            context.strokeStyle = "#CCCCCC";
            context.lineWidth = 2 / this.zoom;
            context.stroke(this.spaceshipLegs);
        }
        // draw the ship
        context.fillStyle = Colors.Eigengrau;
        context.fill(this.spaceshipPath); // fauxpaque
        context.strokeStyle = ship.transit ? Colors.Black : Colors.White;
        context.lineWidth = 2 / this.zoom;
        context.stroke(this.spaceshipPath);
        // draw thrust
        if (ship.thrust.x !== 0 || ship.thrust.y !== 0) {
            context.strokeStyle = "#FF8800";
            context.lineJoin = "round";
            context.lineWidth = 2 / this.zoom;
            context.stroke(this.thrustPath);
        }
        context.restore();
        helper.x = oldHelperX;
        helper.y = oldHelperY;
        this.drawTrack(ship.track);
    }
    drawLanding(landing: Landing) {
        if (drawFlag) {
            const context = this.context;
            const v = Vec2_makeWithAngleMag(Vec2.Zero(), landing.angle, landing.planet.radius).addSelf(landing.planet.pos);
            const strokeWidth = 2 / this.zoom;
            const height = 80;
            context.save();
            context.translate(v.x, v.y);
            context.rotate(landing.angle);
            context.strokeStyle = Colors.Flag;
            context.lineWidth = strokeWidth;
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(height, 0);
            context.lineTo(height * 0.875, height * 0.25);
            context.lineTo(height * 0.75, 0);
            context.stroke();
            context.restore();
        }
    }
    drawAutopilot(autopilot: Autopilot15) {
        if (autopilot.target !== null) {
            const target = autopilot.target;
            const color = Colors.AutopilotTranslucent;
            const context = this.context;
            const helper = this.helper;
            const zoom = this.zoom;
            const oldHelperX = helper.x;
            const oldHelperY = helper.y;
            helper.x -= target.pos.x;
            helper.y -= target.pos.y;
            context.save();

            context.translate(target.pos.x, target.pos.y);
            context.rotate(autopilot.universe.now * 2 * PI / 10);
            context.strokeStyle = color;
            context.lineWidth = 1 / zoom;
            drawPolygon(
                context,
                target.radius + autopilot.brakingDistance,
                15 // Autopilot introduced in Android 15
            );
            context.globalAlpha = 0.25;
            helper.drawCircle(
                color,
                autopilot.landingAltitude,
                0,
                0,
                target.radius + autopilot.landingAltitude / 2
            );
            context.globalAlpha = 1;

            context.restore();
            helper.x = oldHelperX;
            helper.y = oldHelperY;
            helper.drawLine(
                color,
                1 / zoom,
                autopilot.ship.pos.x,
                autopilot.ship.pos.y,
                autopilot.leadingPos.x,
                autopilot.leadingPos.y
            );
            helper.drawCircle(
                color,
                1 / zoom,
                autopilot.leadingPos.x,
                autopilot.leadingPos.y,
                5 / zoom
            );
        }
    }
}

export class VisibleUniverse15 extends VisibleUniverse {
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
            LOG && console.log(
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

        this.ship = new Spacecraft15();

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
            LOG && console.log(
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

        this.ship = new Spacecraft15();

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
                        const landing = new Landing15(this.ship, planet, a, (this.namer as Namer15).describeActivity(this.rng, planet));
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

        solveSimulator.call(this, dt, constraints);
    }
}

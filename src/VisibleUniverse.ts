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

import { Colors } from "./Colors";
import { lerp } from "./MathHelpers";
import { clamp } from "./Maths";
import { Namer } from "./Namer";
import { createPolygon, createStar, parseSvgPathData } from "./PathTools";
import { Container } from "./Physics";
import { Landing, Planet, Spacecraft, Spark, SparkStyle, Star, Track, Universe, UniverseConst } from "./Universe";
import { Vec2, Vec2_makeWithAngleMag } from "./Vec2";

const DRAW_ORBITS = true;
const DRAW_GRAVITATIONAL_FIELDS = true;
const DRAW_STAR_GRAVITATIONAL_FIELDS = true;
const SIMPLE_TRACK_DRAWING = true

const enum VisibleUniverseConst {
    STAR_POINTS = 31,
    MIN_REFRESH_MILLIS = 24
}

const spaceshipPath = parseSvgPathData("\nM11.853 0\nC11.853 -4.418 8.374 -8 4.083 -8\nL-5.5 -8\nC-6.328 -8 -7 -7.328 -7 -6.5\nC-7 -5.672 -6.328 -5 -5.5 -5\nL-2.917 -5\nC-1.26 -5 0.083 -3.657 0.083 -2\nL0.083 2\nC0.083 3.657 -1.26 5 -2.917 5\nL-5.5 5\nC-6.328 5 -7 5.672 -7 6.5\nC-7 7.328 -6.328 8 -5.5 8\nL4.083 8\nC8.374 8 11.853 4.418 11.853 0\nZ\n");

const thrustPath = createPolygon(-3, 3, -4, 0);

/**
 * A zoomedDrawScope is one that is scaled, but remembers its zoom level, so you can correct for it
 * if you want to draw single-pixel lines. Which we do.
 */
export class ZoomedDrawScope {
    zoom: number;
    context: CanvasRenderingContext2D;

    drawUniverse(universe: VisibleUniverse) {
        // triggerDraw.value // Please recompose when this value changes.

        //        star.drawZoomed(ds, zoom)
        //        planets.forEach { p ->
        //            p.drawZoomed(ds, zoom)
        //            if (p == follow) {
        //                drawCircle(Color.Red, 20f / zoom, p.pos)
        //            }
        //        }
        //
        //        ship.drawZoomed(ds, zoom)

        universe.constraints.forEach(it => {
            if (it instanceof Landing) {
                this.drawLanding(it);
            } else if (it instanceof Container) {
                this.drawContainer(it);
            }
        });
        this.drawStar(universe.star);
        universe.entities.forEach(it => {
            if (it === universe.ship || it === universe.star) return; // draw the ship last
            if (it instanceof Spacecraft) {
                this.drawSpacecraft(it);
            } else if (it instanceof Spark) {
                this.drawSpark(it);
            } else if (it instanceof Planet) {
                this.drawPlanet(it);
            }
        });
        this.drawSpacecraft(universe.ship);
    }

    drawContainer(container: Container) {
        const context = this.context;
        context.save();
        context.strokeStyle = "#800000";
        context.lineWidth = 1 / this.zoom;
        context.setLineDash([8 / this.zoom, 8 / this.zoom]);
        context.beginPath();
        context.arc(0, 0, container.radius, 0, 2 * Math.PI);
        context.stroke();
        //    val path = Path().apply {
        //        fillType = PathFillType.EvenOdd
        //        addOval(Rect(center = Vec2.Zero, radius = container.radius))
        //        addOval(Rect(center = Vec2.Zero, radius = container.radius + 10_000))
        //    }
        //    drawPath(
        //        path = path,
        //
        //    )
        context.restore();
    }

    drawGravitationalField(planet: Planet) {
        const context = this.context;
        const rings = 8;
        for (let i = 0; i < rings; i++) {
            const force = lerp(
                200,
                0.01,
                i / rings
            ); // first rings at force = 1N, dropping off after that
            const r = Math.sqrt(UniverseConst.GRAVITATION * planet.mass * UniverseConst.SPACECRAFT_MASS / force);
            context.strokeStyle = "rgba(255,0,0," + lerp(0.5, 0.1, i / rings) + ")";
            context.lineWidth = 2 / this.zoom;
            context.beginPath();
            context.arc(planet.pos.x, planet.pos.y, r, 0, 2 * Math.PI);
            context.stroke();
        }
    }

    drawPlanet(planet: Planet) {
        const context = this.context;
        if (DRAW_ORBITS) {
            context.strokeStyle = "#00FFFF80";
            context.lineWidth = 1 / this.zoom;
            context.beginPath();
            context.arc(planet.orbitCenter.x, planet.orbitCenter.y, planet.pos.distance(planet.orbitCenter), 0, 2 * Math.PI);
            context.stroke();
        }

        if (DRAW_GRAVITATIONAL_FIELDS) {
            this.drawGravitationalField(planet);
        }


        context.fillStyle = Colors.Eigengrau;
        context.beginPath();
        context.arc(planet.pos.x, planet.pos.y, planet.radius, 0, 2 * Math.PI);
        context.fill();
        context.strokeStyle = planet.color;
        context.lineWidth = 2 / this.zoom;
        context.beginPath();
        context.arc(planet.pos.x, planet.pos.y, planet.radius, 0, 2 * Math.PI);
        context.stroke();
    }

    drawStar(star: Star) {
        const context = this.context;
        context.save();
        context.translate(star.pos.x, star.pos.y);

        context.fillStyle = star.color;
        context.beginPath();
        context.arc(0, 0, star.radius, 0, 2 * Math.PI);
        context.fill();

        if (DRAW_STAR_GRAVITATIONAL_FIELDS) this.drawGravitationalField(star);

        context.save();
        context.rotate(star.anim / 23 * Math.PI * 2);
        context.strokeStyle = star.color;
        context.lineWidth = 3 / this.zoom;
        context.lineJoin = "round";
        context.stroke(createStar(
            star.radius + 80,
            star.radius + 250,
            VisibleUniverseConst.STAR_POINTS
        ));
        context.restore();
        context.rotate(star.anim / -19 * Math.PI * 2);
        context.strokeStyle = star.color;
        context.lineWidth = 3 / this.zoom;
        context.lineJoin = "round";
        context.stroke(createStar(
            star.radius + 20,
            star.radius + 200,
            VisibleUniverseConst.STAR_POINTS + 1
        ));
        context.restore();
    }
    drawSpacecraft(ship: Spacecraft) {
        const context = this.context;
        context.save();
        context.translate(ship.pos.x, ship.pos.y);
        context.rotate(ship.angle);
        //                drawPath(
        //                    path = createStar(200f, 100f, 3),
        //                    color = Color.White,
        //                    style = Stroke(width = 2f / zoom)
        //                )
        context.fillStyle = Colors.Eigengrau;
        context.fill(spaceshipPath); // fauxpaque
        context.strokeStyle = ship.transit ? Colors.Black : Colors.White;
        context.lineWidth = 2 / this.zoom;
        context.stroke(spaceshipPath);
        if (ship.thrust.x !== 0 || ship.thrust.y !== 0) {
            context.strokeStyle = "#FF8800";
            context.lineJoin = "round";
            context.lineWidth = 2 / this.zoom;
            context.stroke(thrustPath);
        }
        //                drawRect(
        //                    topLeft = Offset(-1f, -1f),
        //                    size = Size(2f, 2f),
        //                    color = Color.Cyan,
        //                    style = Stroke(width = 2f / zoom)
        //                )
        //                drawLine(
        //                    start = Vec2.Zero,
        //                    end = Vec2(20f, 0f),
        //                    color = Color.Cyan,
        //                    strokeWidth = 2f / zoom
        //                )
        //        // DEBUG: draw velocity vector
        //        drawLine(
        //            start = pos,
        //            end = pos + velocity,
        //            color = Color.Red,
        //            strokeWidth = 3f / zoom
        //        )
        context.restore();
        this.drawTrack(ship.track);
    }
    drawLanding(landing: Landing) {
        const context = this.context;
        const v = Vec2_makeWithAngleMag(Vec2.Zero(), landing.angle, landing.planet.radius).addSelf(landing.planet.pos);
        context.strokeStyle = Colors.Red;
        context.lineWidth = 1 / this.zoom;
        context.beginPath();
        context.moveTo(v.x - 5, v.y - 5);
        context.lineTo(v.x + 5, v.y + 5);
        context.stroke();
        context.beginPath();
        context.moveTo(v.x + 5, v.y - 5);
        context.lineTo(v.x - 5, v.y + 5);
        context.stroke();
    }
    drawSpark(spark: Spark) {
        if (spark.lifetime < 0) return;
        const context = this.context;
        switch (spark.style) {
            case SparkStyle.LINE:
                if (spark.opos.x !== 0 || spark.opos.y !== 0) {
                    context.strokeStyle = spark.color;
                    context.lineWidth = spark.size;
                    context.beginPath();
                    context.moveTo(spark.opos.x, spark.opos.y);
                    context.lineTo(spark.pos.x, spark.pos.y);
                    context.stroke();
                }
                break;
            case SparkStyle.LINE_ABSOLUTE:
                if (spark.opos.x !== 0 || spark.opos.y !== 0) {
                    context.strokeStyle = spark.color;
                    context.lineWidth = spark.size / this.zoom;
                    context.beginPath();
                    context.moveTo(spark.opos.x, spark.opos.y);
                    context.lineTo(spark.pos.x, spark.pos.y);
                    context.stroke();
                }
                break;
            case SparkStyle.DOT:
                context.fillStyle = spark.color;
                context.beginPath();
                context.arc(spark.pos.x, spark.pos.y, spark.size, 0, Math.PI * 2);
                context.fill();
                break;
            case SparkStyle.DOT_ABSOLUTE:
                context.fillStyle = spark.color;
                context.beginPath();
                context.arc(spark.pos.x / this.zoom, spark.pos.y / this.zoom, spark.size, 0, Math.PI * 2);
                context.fill();
                break;
            case SparkStyle.RING:
                context.strokeStyle = spark.color;
                context.lineWidth = 1 / this.zoom;
                context.beginPath();
                context.arc(spark.pos.x, spark.pos.y, spark.size, 0, Math.PI * 2);
                context.stroke();
                break;
            //                drawPoints(listOf(pos), PointMode.Points, color, strokeWidth = 2f/zoom)
            //            drawCircle(color, 2f/zoom, pos)
        }
        //        drawCircle(Color.Gray, center = pos, radius = 1.5f / zoom)
    }
    drawTrack(track: Track) {
        const context = this.context;
        if (SIMPLE_TRACK_DRAWING) {
            context.strokeStyle = Colors.Green;
            context.lineWidth = 1 / this.zoom;
            context.beginPath();
            track.positions.forEach((point, idx) => {
                if (idx === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x, point.y);
                }
            });
            context.stroke();
            //            if (positions.size < 2) return
            //            drawPath(Path()
            //                .apply {
            //                    val p = positions[positions.size - 1]
            //                    moveTo(p.x, p.y)
            //                    positions.reversed().subList(1, positions.size).forEach { p ->
            //                        lineTo(p.x, p.y)
            //                    }
            //                },
            //                color = Color.Green, style = Stroke(1f/zoom))
        } else {
            if (track.positions.size() < 2) return;
            let prev: Vec2 | null = null;
            let a = 0.5;
            context.lineWidth = Math.max(1, 1 / this.zoom);
            track.positions.forEachReversed(pos => {
                if (prev !== null) {
                    context.strokeStyle = "rgba(0,1,0," + a + ")";
                    context.beginPath();
                    context.moveTo(prev.x, prev.y);
                    context.lineTo(pos.x, pos.y);
                    context.stroke();
                }
                prev = pos;
                a = clamp((a - 1 / UniverseConst.TRACK_LENGTH), 0, 1);
            });
        }
    }
}

export class VisibleUniverse extends Universe {
    triggerDraw: number;
    realDt: number;

    constructor(namer: Namer, randomSeed: bigint) {
        super(namer, randomSeed);
        this.triggerDraw = Infinity;
        this.realDt = Infinity;
    }

    simulateFrame(millis: number) {
        const lastDraw = this.triggerDraw;
        const dt = millis - lastDraw;
        this.triggerDraw = millis;
        this.realDt = dt;
        if (dt > VisibleUniverseConst.MIN_REFRESH_MILLIS) {
            const count = Math.ceil(dt / VisibleUniverseConst.MIN_REFRESH_MILLIS);
            for (let i = 1; i <= count; i++) {
                this.step(lastDraw + dt / count * i);
            }
        } else {
            this.step(millis);
        }
    }
}

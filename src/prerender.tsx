import { argv } from 'node:process';
import { renderToString } from 'react-dom/server';
import { ViewerApp } from './ViewerApp';

const manifest = JSON.parse(argv[2]);
const result: string[][] = [];

function renderViewer() {
    const html = "<!DOCTYPE html>\n" + renderToString(
        <html>
            <head>
                <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>LAndroid Easter Egg Planet Viewer</title>
                <link rel="shortcut icon" type="image/svg+xml" href="favicon.svg" />
                <meta name="description" content="Check the daily content of LAndroid Easter Egg (Android 14 and Android 15 Easter Egg), including the names, types, and total numbers of stars and planets. You can also view the content for past or future days." />
            </head>
            <body>
                <div id="root">
                    <ViewerApp P />
                    <noscript><center>You need to enable JavaScript to run this app.</center></noscript>
                </div>
                {(manifest.viewer as string[]).map(src => <script src={src}></script>)}
            </body>
        </html>
    );
    result.push(["viewer.html", html]);
}

function renderPlayer() {
    const html = "<!DOCTYPE html>\n" + renderToString(
        <html>
            <head>
                <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>LAndroid 14(U) Easter Egg Player</title>
                <meta name="description" content="LAndroid - Play Android 14(U) Easter Egg game online in the browser!" />
                <link rel="stylesheet" href="player.css" />
                <link rel="shortcut icon" type="image/svg+xml" href="favicon.svg" />
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="app" className="fill">
                    <canvas id="canvasMain" className="canvas fill" hidden></canvas>
                    <pre id="topText" className="top-text" hidden></pre>
                    <pre id="bottomText" className="bottom-text" hidden></pre>
                    <div id="loading" className="loading">Loading...</div>
                </div>
                <script src="playerLoad.js"></script>
                {(manifest.player as string[]).map(src => <script src={src}></script>)}
                <script defer async src="/counter.js"></script>
            </body>
        </html>
    );
    result.push(["player.html", html]);
}

function renderPlayer15() {
    const html = "<!DOCTYPE html>\n" + renderToString(
        <html>
            <head>
                <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>LAndroid 15(V) Easter Egg Player</title>
                <meta name="description" content="LAndroid - Play Android 15(V) Easter Egg game online in the browser!" />
                <link rel="stylesheet" href="player.css" />
                <link rel="shortcut icon" type="image/svg+xml" href="favicon15.svg" />
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="app" className="fill">
                    <canvas id="canvasMain" className="canvas fill" hidden></canvas>
                    <div className="top-container" id="topContainer" hidden>
                        <pre id="topText" className="container-text"></pre>
                    </div>
                    <div className="bottom-container" id="bottomContainer" hidden>
                        <pre id="autopilotText" className="container-text autopilot"></pre>
                        <pre id="bottomText" className="container-text"></pre>
                    </div>
                    <div id="loading" className="loading">Loading...</div>
                    <div id="rightContainer" className="bottom-right-container controls-hidden">
                        <div style={{ textAlign: "right" }}><button id="speedButton">1.00x</button></div>
                        <select id="zoomSelect">
                            <option>Fixed zoom</option>
                            <option>Dynamic zoom</option>
                            <option>Manual zoom</option>
                        </select>
                        <br />
                        <label className="autopilot-label"><input type="checkbox" id="autopilotCheck" />Auto Pilot</label>
                        <br />
                        <label className="autopilot-label"><input type="checkbox" id="pauseCheck" />Pause</label>
                    </div>
                    <div id="speedContainerMask" className="speed-container-hide">
                        <table><tbody><tr><td>
                            <div id="speedContainer">
                                <div id="speedIntegral"></div>
                                <div id="speedDecimal"></div>
                                <div id="speedContainerButton"><button id="butIntegral"></button><button id="butDecimal"></button></div>
                            </div>
                        </td></tr></tbody></table>
                    </div>
                </div>
                <script src="playerLoad.js"></script>
                {(manifest.player15 as string[]).map(src => <script src={src}></script>)}
                <script defer async src="/counter.js"></script>
            </body>
        </html>
    );
    result.push(["player15.html", html]);
}

function main() {
    renderViewer();
    renderPlayer();
    renderPlayer15();
}

main();
console.log(JSON.stringify(result));

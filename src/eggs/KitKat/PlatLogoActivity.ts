import k_platlogo from "../imgs/k_platlogo";
import { AccelerateInterpolator } from "../shared/AccelerateInterpolator";
import { AnticipateOvershootInterpolator } from "../shared/AnticipateOvershootInterpolator";
import { DecelerateInterpolator } from "../shared/DecelerateInterpolator";
import { IAnimatableView } from "../shared/IAnimatableView";
import { ViewAnimation } from "../shared/ViewAnimation";

const { min, PI, random } = Math;
const now = performance.now.bind(performance);

const BGCOLOR = "#ed1d24"; // 0xffed1d24

function b64ToBlob(b64: string) {
    if (!b64.startsWith("data:image/webp;base64,")) throw new Error("Invalid WEBP: " + b64.substring(0, "data:image/webp;base64,".length));
    const resultStr = atob(b64.substring("data:image/webp;base64,".length));
    const resultLen = resultStr.length;
    const resultArr = new Uint8Array(resultLen);
    for (let i = 0; i < resultLen; i++) {
        resultArr[i] = resultStr.charCodeAt(i);
    }
    return new Blob([resultArr], { type: "image/webp" });
}

class ChildViewBase implements IAnimatableView {
    currX: number;
    currY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    alpha: number;

    startAnim: (anim: ViewAnimation) => void;
    currentAnim?: ViewAnimation;

    constructor(startAnim: (anim: ViewAnimation) => void) {
        this.currX = 0;
        this.currY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.alpha = 1;

        this.startAnim = startAnim;
    }

    animate() {
        if (this.currentAnim) {
            this.currentAnim.cancel();
        }
        return this.currentAnim = new ViewAnimation(this);
    }
}

export function PlatLogoActivityKitKat(canvas: HTMLCanvasElement, enterDessertCase: () => void) {
    let mWidth = 0, mHeight = 0;
    let logoView: ChildViewBase;
    let bgView: ChildViewBase;
    let letterView: ChildViewBase;
    let tv: ChildViewBase;
    let logo: ImageBitmap;
    const animList: ViewAnimation[] = [];
    let logoShown = false;
    let clicks = 0;

    const ctx = canvas.getContext("2d")!;

    async function initAsync() {
        logo = await createImageBitmap(b64ToBlob(k_platlogo));
    }

    function onSizeChanged(w: number, h: number) {
        if (mWidth == w && mHeight == h) return;
        mWidth = w;
        mHeight = h;
        draw();
    }

    function startAnim(anim: ViewAnimation) {
        anim.startTime = now();
        animList.push(anim);
    }

    function tick(time: number) {
        let i = 0;
        while (i < animList.length) {
            const anim = animList[i];
            if (!anim.tick(time)) {
                anim.tick(time);
                animList.splice(i, 1);
            } else {
                i++;
            }
        }
        draw();
    }

    function drawText(text: string, font: string, alpha: number, rotation: number, fill: string, bottom: boolean) {
        if (alpha == 0) return;
        ctx.font = font;
        const measure = ctx.measureText(text);
        const textWidth = measure.width;
        const centerX = mWidth / 2;
        const textX = centerX - textWidth / 2;
        const textY = bottom ? (mHeight - 4 * window.devicePixelRatio) : (mHeight / 2 - (-measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent) / 2);
        const centerY = bottom ? (textY - (measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent) / 2) : (mHeight / 2);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * PI / 180);
        ctx.translate(-centerX, -centerY);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        ctx.fillText(text, textX, textY);
        ctx.restore();
    }

    function drawBg(color: string, alpha: number, scaleX: number, scaleY: number) {
        if (alpha == 0) return;
        const cx = mWidth / 2;
        const cy = mHeight / 2;
        const w = mWidth * scaleX;
        const h = mHeight * scaleY;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    }

    function drawLogo() {
        if (logoView.alpha == 0) return;
        const cx = mWidth / 2;
        const cy = mHeight / 2;
        const density = window.devicePixelRatio;
        const ratio = min(mWidth / (logo.width * density), mHeight / (logo.height * density), 1);
        const w = logo.width * density * logoView.scaleX * ratio;
        const h = logo.height * density * logoView.scaleY * ratio;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(logoView.rotation * PI / 180);
        ctx.translate(-cx, -cy);
        ctx.globalAlpha = logoView.alpha;
        ctx.drawImage(logo, cx - w / 2, cy - h / 2, w, h);
        ctx.restore();
    }

    function draw() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, mWidth, mHeight);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, mWidth, mHeight);

        drawBg(BGCOLOR, bgView.alpha, bgView.scaleX, bgView.scaleY);

        let textSize = 300 * letterView.scaleY * window.devicePixelRatio;
        drawText("K", `bold ${textSize}px sans-serif`, letterView.alpha, letterView.rotation, "white", false);

        drawLogo();

        textSize = 30 * tv.scaleY * window.devicePixelRatio;
        drawText("ANDROID 4.4", `${textSize}px sans-serif-light`, tv.alpha, tv.rotation, "white", true);
    }

    function onClick(longClick: boolean) {
        if (!logoShown) {
            if (!longClick) {
                clicks++;
                if (clicks >= 6) {
                    onClick(true);
                    return;
                }
                letterView.animate().cancel();
                const offset = letterView.rotation % 360;
                letterView.animate()
                    .rotationBy((random() > 0.5 ? 360 : -360) - offset)
                    .setInterpolator(DecelerateInterpolator.getInstance())
                    .setDuration(700).start();
            } else {
                logoShown = true;
                bgView.scaleX = (0.01);
                bgView.animate().alpha(1).scaleX(1).setStartDelay(500).start();
                letterView.animate().alpha(0).scaleY(0.5).scaleX(0.5)
                    .rotationBy(360)
                    .setInterpolator(AccelerateInterpolator.getInstance())
                    .setDuration(1000)
                    .start();
                logoView.alpha = (0);
                logoView.scaleX = (0.5);
                logoView.scaleY = (0.5);
                logoView.animate().alpha(1).scaleX(1).scaleY(1)
                    .setDuration(1000).setStartDelay(500)
                    .setInterpolator(AnticipateOvershootInterpolator.getInstance())
                    .start();
                tv.alpha = (0);
                tv.animate().alpha(1).setDuration(1000).setStartDelay(1000).start();
            }
        } else if (longClick) {
            enterDessertCase();
        }
    }

    bgView = new ChildViewBase(startAnim);
    bgView.alpha = 0;
    letterView = new ChildViewBase(startAnim);
    logoView = new ChildViewBase(startAnim);
    logoView.alpha = 0;
    tv = new ChildViewBase(startAnim);
    tv.alpha = 0;

    return [initAsync, tick, onSizeChanged, onClick] as [typeof initAsync, typeof tick, typeof onSizeChanged, typeof onClick];
}

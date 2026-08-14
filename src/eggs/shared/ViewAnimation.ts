import { lerp } from "../../MathHelpers";
import { clamp } from "../../Maths";
import { AccelerateDecelerateInterpolator } from "./AccelerateDecelerateInterpolator";
import { IAnimatableView } from "./IAnimatableView";
import { TimeInterpolator } from "./TimeInterpolator";

export class ViewAnimation {
    view: IAnimatableView;
    startX: number;
    startY: number;
    startScaleX: number;
    startScaleY: number;
    startRotation: number;
    startAlpha: number;
    endX: number;
    endY: number;
    endScaleX: number;
    endScaleY: number;
    endRotation: number;
    endAlpha: number;

    interpolator?: TimeInterpolator;
    startDelayTime: number;
    duration: number;
    endListener?: () => void;

    startTime: number;
    cancelled: boolean;

    constructor(view: IAnimatableView) {
        this.view = view;
        this.startX = this.endX = view.currX;
        this.startY = this.endY = view.currY;
        this.startScaleX = this.endScaleX = view.scaleX;
        this.startScaleY = this.endScaleY = view.scaleY;
        this.startRotation = this.endRotation = view.rotation;
        this.startAlpha = this.endAlpha = view.alpha;

        this.duration = 300;
        this.startTime = 0;
        this.startDelayTime = 0;
        this.cancelled = false;
    }

    setInterpolator(interpolator?: TimeInterpolator) {
        this.interpolator = interpolator;
        return this;
    }

    setDuration(duration: number) {
        this.duration = duration;
        return this;
    }

    setEndListener(endListener: () => void) {
        this.endListener = endListener;
        return this;
    }

    scaleX(endScaleX: number) {
        this.endScaleX = endScaleX;
        return this;
    }

    scaleY(endScaleY: number) {
        this.endScaleY = endScaleY;
        return this;
    }

    alpha(endAlpha: number) {
        this.endAlpha = endAlpha;
        return this;
    }

    rotation(endRotation: number) {
        this.endRotation = endRotation;
        return this;
    }

    rotationBy(rotation: number) {
        this.endRotation = this.startRotation + rotation;
        return this;
    }

    x(endX: number) {
        this.endX = endX;
        return this;
    }

    y(endY: number) {
        this.endY = endY;
        return this;
    }

    setStartDelay(startDelayTime: number) {
        this.startDelayTime = startDelayTime;
        return this;
    }

    start() {
        if (!this.interpolator) {
            this.interpolator = AccelerateDecelerateInterpolator.getInstance();
        }
        this.view.startAnim(this);
    }

    tick(time: number) {
        if (this.cancelled) return false;
        const dt = time - this.startTime - this.startDelayTime;
        const end = dt >= this.duration;
        const pct = end ? 1 : this.interpolator!.getInterpolation(clamp(dt, 0, this.duration) / this.duration);
        this.view.currX = lerp(this.startX, this.endX, pct);
        this.view.currY = lerp(this.startY, this.endY, pct);
        this.view.scaleX = lerp(this.startScaleX, this.endScaleX, pct);
        this.view.scaleY = lerp(this.startScaleY, this.endScaleY, pct);
        this.view.rotation = lerp(this.startRotation, this.endRotation, pct);
        this.view.alpha = clamp(lerp(this.startAlpha, this.endAlpha, pct), 0, 1);
        return !end;
    }

    cancel() {
        this.view.currX = this.endX;
        this.view.currY = this.endY;
        this.view.scaleX = this.endScaleX;
        this.view.scaleY = this.endScaleY;
        this.view.rotation = this.endRotation;
        this.view.alpha = this.endAlpha;
        this.cancelled = true;
    }
}

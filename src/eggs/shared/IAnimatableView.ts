import { ViewAnimation } from "./ViewAnimation";

export interface IAnimatableView {
    currX: number;
    currY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    alpha: number;
    startAnim: (anim: ViewAnimation) => void;
}

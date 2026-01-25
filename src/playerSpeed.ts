/*
 * Copyright 2026 lll69
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

export function initSpeedControl(setSpeed: (speed: number, text: string) => void): (() => void) {
    const maxIntegralPart = 32;
    const INTEGRAL_PAGE_SIZE = 18;
    const speedContainerMask = document.getElementById("speedContainerMask")!;
    const integralDiv = document.getElementById("speedIntegral")!;
    const decimalDiv = document.getElementById("speedDecimal")!;
    const integralButton = document.getElementById("butIntegral")!;
    const decimalButton = document.getElementById("butDecimal")!;
    const integralUpButton = document.createElement("button");
    const integralDownButton = document.createElement("button");
    const integralCloseButton = document.createElement("button");
    const decimalCloseButton = document.createElement("button");
    const integralButtons: HTMLButtonElement[] = Array(INTEGRAL_PAGE_SIZE);
    let integralPart = 1;
    let decimalPart = 0;
    let integralPageOffset = 0;
    let i: number;
    function setIntegralPart(n: number) {
        n += integralPageOffset;
        if (integralPart !== n) {
            integralPart = n;
            integralButton.textContent = String(integralPart);
            setSpeed(integralPart + decimalPart, integralButton.textContent + decimalButton.textContent);
        }
    }
    function setDecimalPart(n: number) {
        const newPart = n / 100;
        if (decimalPart !== newPart) {
            decimalPart = newPart;
            decimalButton.textContent = "." + Math.floor(n / 10) + (n % 10);
            setSpeed(integralPart + decimalPart, integralButton.textContent + decimalButton.textContent);
        }
    }
    function refreshIntegralButton() {
        integralUpButton.disabled = integralPageOffset <= 0;
        integralDownButton.disabled = integralPageOffset + INTEGRAL_PAGE_SIZE > maxIntegralPart;
    }
    function closeControl() {
        speedContainerMask.className = "speed-container-hide";
    }
    function refreshIntegralButtonText() {
        for (i = 0; i < INTEGRAL_PAGE_SIZE; i++) {
            const button = integralButtons[i];
            button.textContent = (integralPageOffset + i > maxIntegralPart) ? "" : String(integralPageOffset + i);
            button.style.visibility = (integralPageOffset + i > maxIntegralPart) ? "hidden" : "";
        }
    }
    function integralUp() {
        if (integralPageOffset > 0) {
            integralPageOffset -= INTEGRAL_PAGE_SIZE;
            refreshIntegralButton();
            refreshIntegralButtonText();
        }
    }
    function integralDown() {
        if (integralPageOffset + INTEGRAL_PAGE_SIZE <= maxIntegralPart) {
            integralPageOffset += INTEGRAL_PAGE_SIZE;
            refreshIntegralButton();
            refreshIntegralButtonText();
        }
    }
    for (i = 0; i < INTEGRAL_PAGE_SIZE; i++) {
        const part = i;
        (integralButtons[i] = document.createElement("button")).addEventListener("click", () => {
            setIntegralPart(part);
        });
    }
    for (i = 0; i < 100; i += 5) {
        const button = document.createElement("button");
        decimalDiv.appendChild(button);
        if (i === 25) {
            decimalDiv.appendChild(decimalCloseButton);
        }
        button.textContent = "." + Math.floor(i / 10) + (i % 10);
        const part = i;
        button.addEventListener("click", () => {
            setDecimalPart(part);
        });
    }
    for (i = 0; i < 6; i++) {
        integralDiv.appendChild(integralButtons[i]);
    }
    integralDiv.appendChild(integralCloseButton);
    for (i = 6; i < 12; i++) {
        integralDiv.appendChild(integralButtons[i]);
    }
    integralDiv.appendChild(integralUpButton);
    for (i = 12; i < 18; i++) {
        integralDiv.appendChild(integralButtons[i]);
    }
    integralDiv.appendChild(integralDownButton);

    integralButton.textContent = "1";
    decimalButton.textContent = ".00";
    integralUpButton.textContent = "↑";
    integralDownButton.textContent = "↓";
    integralCloseButton.textContent = decimalCloseButton.textContent = "X";
    integralUpButton.style.fontWeight = integralDownButton.style.fontWeight =
        integralCloseButton.style.fontWeight = decimalCloseButton.style.fontWeight =
        integralButton.style.fontWeight = decimalButton.style.fontWeight = "bold";
    integralCloseButton.addEventListener("click", closeControl);
    integralUpButton.addEventListener("click", integralUp);
    integralDownButton.addEventListener("click", integralDown);
    decimalCloseButton.addEventListener("click", closeControl);
    speedContainerMask.addEventListener("click", closeControl);
    document.getElementById("speedContainer")!.addEventListener("click", e => e.stopPropagation());
    integralDiv.addEventListener("mouseenter", () => {
        integralButton.className = "speed-highlight";
    });
    integralDiv.addEventListener("mouseleave", () => {
        integralButton.className = "";
    });
    decimalDiv.addEventListener("mouseenter", () => {
        decimalButton.className = "speed-highlight";
    });
    decimalDiv.addEventListener("mouseleave", () => {
        decimalButton.className = "";
    });
    refreshIntegralButton();
    refreshIntegralButtonText();
    return () => {
        integralPageOffset = 0;
        refreshIntegralButton();
        refreshIntegralButtonText();
        speedContainerMask.className = "speed-container-show";
    };
}
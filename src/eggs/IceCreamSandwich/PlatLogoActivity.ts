/*
 * Copyright (C) 2006 The Android Open Source Project
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
 * Copyright (C) 2010 The Android Open Source Project
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

/**
 * Defines the default duration in milliseconds before a press turns into
 * a long press
 */
const DEFAULT_LONG_PRESS_TIMEOUT = 500;

let mCount = 0;
let isPressed = false;
let superLongPressTimeout: any;
let setHashEnabled = false;
const content = document.querySelector("img")!!;

function superLongPress() {
    mCount++;
    if (typeof navigator.vibrate !== "undefined") {
        navigator.vibrate(50 * mCount);
    }

    const scale = 1 + 0.25 * mCount * mCount;
    content.style.transform = "scale(" + scale + ")";

    if (mCount <= 3) {
        superLongPressTimeout = setTimeout(superLongPress, DEFAULT_LONG_PRESS_TIMEOUT);
    } else {
        isPressed = false;
        if (setHashEnabled && parent !== null) {
            parent.postMessage({ type: "setHash", hash: "#Nyandroid" });
        } else {
            location.href = "Nyandroid.html";
        }
    }
}

function onTouch(e: PointerEvent | TouchEvent) {
    switch (e.type) {
        case "pointerdown":
            isPressed = true;
            clearTimeout(superLongPressTimeout);
            mCount = 0;
            superLongPressTimeout = setTimeout(superLongPress, 2 * DEFAULT_LONG_PRESS_TIMEOUT);
            e.preventDefault();
            content.setPointerCapture((e as PointerEvent).pointerId);
            break;
        case "touchstart":
            isPressed = true;
            clearTimeout(superLongPressTimeout);
            mCount = 0;
            superLongPressTimeout = setTimeout(superLongPress, 2 * DEFAULT_LONG_PRESS_TIMEOUT);
            e.preventDefault();
            break;
        case "pointerup":
        case "touchend":
            if (isPressed) {
                isPressed = false;
                clearTimeout(superLongPressTimeout);
                e.preventDefault();
                alert("Android 4.0: Ice Cream Sandwich");
            }
            break;
        case "pointercancel":
        case "touchcancel":
            if (isPressed) {
                isPressed = false;
                clearTimeout(superLongPressTimeout);
                e.preventDefault();
            }
            break;
    }
}

content.addEventListener("pointerdown", onTouch);
content.addEventListener("pointerup", onTouch);
content.addEventListener("pointercancel", onTouch);
content.addEventListener("touchstart", onTouch);
content.addEventListener("touchend", onTouch);
content.addEventListener("touchcancel", onTouch);
content.addEventListener("contextmenu", e => e.preventDefault());

onmessage = (e: MessageEvent) => {
    if (e.origin === location.origin) {
        if (e.data.type === "setHashEnabled") {
            setHashEnabled = true;
        }
    }
}

export { };

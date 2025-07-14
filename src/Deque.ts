/*
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

function internalDequeIndex(index: number, head: number, capacity: number): number {
    return (index + head) >= capacity ? (index + head) - capacity : (index + head);
}

export class Deque<T> {
    private elementData: Array<T | undefined>;
    private length: number;
    private head: number;

    constructor(initialCapacity: number) {
        this.elementData = Array(initialCapacity);
        this.length = 0;
        this.head = 0;
    }

    private incrementHead() {
        this.head++;
        if (this.head >= this.elementData.length) {
            this.head -= this.elementData.length;
        }
    }

    ensureCapacity(minCapacity: number): void {
        if (minCapacity <= this.elementData.length) return;
        this.elementData.length = minCapacity;
    }

    size(): number {
        return this.length;
    }

    removeFirst(): T {
        if (this.length === 0) {
            throw new Error("Deque is empty");
        }
        const element = this.elementData[this.head];
        this.elementData[this.head] = undefined;
        this.incrementHead();
        this.length -= 1;
        return element as T;
    }

    addLast(element: T): void {
        this.ensureCapacity(this.length + 1);
        this.elementData[internalDequeIndex(this.length, this.head, this.elementData.length)] = element;
        this.length++;
    }

    forEach(fn: (item: T, idx: number) => void): void {
        const elementData = this.elementData;
        const capacity = elementData.length;
        const length = this.length;
        let index = this.head;
        for (let i = 0; i < length; i++) {
            fn(elementData[index++] as T, i);
            if (index >= capacity) index -= capacity;
        }
    }

    forEachReversed(fn: (item: T, idx: number) => void): void {
        const elementData = this.elementData;
        const capacity = elementData.length;
        const length = this.length;
        let index = this.head + length - 1;
        if (index >= capacity) index -= capacity;
        for (let i = length - 1; i >= 0; i--) {
            fn(elementData[index--] as T, i);
            if (index < 0) index += capacity;
        }
    }
}

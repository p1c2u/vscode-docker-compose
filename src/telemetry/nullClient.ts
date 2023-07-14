"use strict";

export class NullClient {

    constructor() {
        // do nothing.
    }

    public sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
        // do nothing.
    }

}
"use strict";

export class NullClient {

    constructor() {
    }

    public sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
    }

}
"use strict";
import appInsights = require("applicationinsights");

export class AppInsightsClient {

    private client;

    constructor(hash: string) {
        this.client = new appInsights.TelemetryClient(hash);
    }

    public sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
        this.client.trackEvent({name: eventName, properties: properties});
    }

}
"use strict";
import appInsights = require("applicationinsights");

export class AppInsightsClient {

    private client;

    constructor(hash: string) {
        this.client = appInsights.getClient(hash);
    }

    public sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
        this.client.trackEvent(eventName, properties);
    }

}
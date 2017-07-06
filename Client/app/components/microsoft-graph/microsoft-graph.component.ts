import { Component, Inject, OnInit } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { Client } from '@microsoft/microsoft-graph-client';

import { SecretService } from '../../shared/secret.service';
import { AdalService } from 'ng2-adal/services/adal.service';

@Component({
    selector: 'microsoft-graph',
    templateUrl: './microsoft-graph.component.html'
})
export class MicrosoftGraphComponent implements OnInit {
    isBrowser: boolean;
    private graphClient: Client;
    private userProfile: any;
    private userSubscription: Subscription;
    private user: adal.User;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private adalService: AdalService,
        private secretService: SecretService) {
        this.isBrowser = isPlatformBrowser(platformId);
        adalService.init(secretService.adalConfig);
    }

    get isLoggedIn(): boolean {
        if (!this.isBrowser)
            return false;

        return this.adalService.userInfo.isAuthenticated;
    }

    ngOnInit() {
        // Fast exit on server-side-rendering
        if (!this.isBrowser)
            return;

        // Initialize ADAL service
        this.adalService.handleWindowCallback();
        this.userSubscription = this.adalService.getUser().subscribe((user) => { 
            this.user = user;
        });

        // Don't initialize graph client in server-side-rendering
        if (this.isLoggedIn) {
            this.adalService.acquireToken('https://graph.microsoft.com').subscribe((token) => {
                this.graphClient = Client.init({
                    authProvider: (done) => {
                        done(undefined, token);
                    }
                });

                this.graphClient.api('/me').get().then((value) => {
                    this.userProfile = value;
                }).catch((error) => {
                    console.log('Error from api call: ' + error);
                });

            }, (error) => {
                console.log('Error from acquire token call: ' + error);
            });
        }
    }

    onLogin() {
        this.adalService.login();
    }

    onLogout() {
        this.adalService.logOut();
    }
}

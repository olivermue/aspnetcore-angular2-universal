import { Injectable } from '@angular/core';

@Injectable()
export class SecretService {
    public get adalConfig(): any {
        return {
            tenant: 'aixconcept.onmicrosoft.com',
            clientId: '7858f34c-d97b-4e9d-8247-a3d5689c9c3c'
        };
    }
}

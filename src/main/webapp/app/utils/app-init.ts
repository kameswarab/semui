import { KeycloakService } from 'keycloak-angular';
import { KEY_CLOAK_URL, KEY_CLOAK_REALM_NAME, KEY_CLOAK_CLIENT_ID } from 'app/app.constants';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
    return (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await keycloak.init({
                    config: {
                        url: KEY_CLOAK_URL,
                        realm: KEY_CLOAK_REALM_NAME,
                        clientId: KEY_CLOAK_CLIENT_ID
                    },
                    initOptions: {
                        onLoad: 'login-required',
                        checkLoginIframe: false
                    },
                    enableBearerInterceptor: true,
                    bearerExcludedUrls: [],
                    bearerPrefix: 'Bearer'
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };
}

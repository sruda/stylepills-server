import { DEV_AUTH_GOOGLE_CALLBACK_URL, LOCAL_AUTH_GOOGLE_CALLBACK_URL } from './../constants/app.constants';
/************************************/
/*           DEPENDENCIES           */
/************************************/
import * as appConfig from './../constants/app.constants';


/************************************/
/*            INTERFACE             */
/************************************/
export interface IAuthConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
}

export interface IServerConfig {
    port: number;
    auth: {
        jwt: {
            secret: string
        }
    };
    googleAuth: IAuthConfig;
}

function _getCallBackUrl(env: string): string {
    switch (env) {
        case appConfig.LOCAL:
            return appConfig.LOCAL_AUTH_GOOGLE_CALLBACK_URL;
        
        case appConfig.DEV:
            return appConfig.DEV_AUTH_GOOGLE_CALLBACK_URL;
        
        case appConfig.PRD:
            return appConfig.PRD_AUTH_GOOGLE_CALLBACK_URL;

        default:
            return appConfig.LOCAL_AUTH_GOOGLE_CALLBACK_URL;
    }
}


/****************************************/
/*            SERVER CONFIG             */
/****************************************/
export function serverConfig(env: string): IServerConfig {

    return {
        port: appConfig.PORT,
        auth: {
            jwt: {
                secret: process.env.JWT_SECRET || 'This is the futureee!!!' 
            }
        },
        googleAuth: {
            clientID: appConfig.CLIENT_ID,
            clientSecret: appConfig.CLIENT_SECRET,
            callbackURL: _getCallBackUrl(env)
        }
    };

}
/***************************************/
/*            DEPENDENCIES             */
/***************************************/
import { logger } from './../core/utils/logger';

import { databaseConfig, IDatabaseConfig } from './database.config';
import { loggingConfig, ILoggingConfig } from './logging.config';
import { serverConfig, IServerConfig } from './server.config';


/***************************************/
/*            CONFIG CLASS             */
/***************************************/
class Config {
    private _env: string;
    private _databaseConfig: IDatabaseConfig;
    private _loggingConfig: ILoggingConfig;
    private _serverConfig: IServerConfig;


    /*       CONSTRUCTOR      */
    /**************************/
    constructor() {
        this._env = process.env.NODE_ENV || 'local';
        this._databaseConfig = databaseConfig(this._env);
        this._loggingConfig = loggingConfig;
        this._serverConfig = serverConfig(this._env);
    }


    /*       METHODS       */
    /***********************/

    getEnv(): string {
        return this._env;
    }

    getDatabaseConfig(): IDatabaseConfig {
        return this._databaseConfig;
    }

    getLoggingConfig(): ILoggingConfig {
        return this._loggingConfig;
    }

    getServerConfig(): IServerConfig {
        return this._serverConfig;
    }
}


/* Export Config instance */
export const config = new Config();
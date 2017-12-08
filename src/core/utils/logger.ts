import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { config } from '../../config/config';
import { transports, Logger } from 'winston';
import { Request, Response } from 'express';

let configs = config.getLoggingConfig();
configs.file.filename = `${path.join(configs.directory, '../logs')}/${configs.file.filename}`;

export const logger = new Logger({
    transports: [
        new transports.File(configs.file),
        new transports.Console(configs.console)
    ],
    exitOnError: false
});

export const skip = (req: Request, res: Response): boolean => {
    return res.statusCode >= 200;
};

export const stream = {
    write: (message: string, encoding: string): void => {
        logger.info(message);
    }
};
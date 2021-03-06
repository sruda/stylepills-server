"use strict";
/************************************/
/*           DEPENDENCIES           */
/************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
// Accepted Operators aliases
const Op = SequelizeStatic.Op;
const operatorsAliases = {
    $and: Op.and,
    $or: Op.or,
    $like: Op.like,
    $iLike: Op.iLike,
    $gt: Op.gt,
    $gte: Op.gte,
    $lt: Op.lt,
    $lte: Op.lte
};
/****************************************/
/*            DATABASE CONFIG           */
/****************************************/
function databaseConfig(env) {
    // Get Port and Host from DATABASE_URL config var
    let match = null;
    let host = null;
    let port = null;
    if (env === 'development' ||
        env === 'staging' ||
        env === 'production' ||
        env === 'alpha' ||
        env === 'beta') {
        match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        host = match[3];
        port = match[4];
    }
    switch (env) {
        case 'local':
            return {
                username: 'sergioruizdavila',
                password: 'admin',
                database: 'stylepill_dev',
                host: '127.0.0.1',
                port: process.env.PORT || 5432,
                dialect: 'postgres',
                operatorsAliases,
                define: {
                    underscored: true // NOTE: 1
                },
                logging: true // NOTE: 2
            };
        case 'development':
            return {
                use_env_variable: 'DATABASE_URL',
                username: 'ucltubusynwrsu',
                password: 'f14c4838c1b7af63fbf45f25799e8c45f319a1f4c618142f19d09fb019a8eb60',
                database: 'dcgfiqehd78k6c',
                port,
                host,
                dialect: 'postgres',
                operatorsAliases,
                define: {
                    underscored: true
                },
                logging: false
            };
        case 'staging':
            return {
                use_env_variable: 'DATABASE_URL',
                username: 'oksscfuqoffztn',
                password: 'aa7e72457d51f8326e580fef18a359f56704df41a889146e232b5590d160f331',
                database: 'd1irdaj3iqucd1',
                port,
                host,
                dialect: 'postgres',
                operatorsAliases,
                define: {
                    underscored: true
                },
                logging: true
            };
        case 'alpha':
        case 'beta':
        case 'production':
            return {
                use_env_variable: 'DATABASE_URL',
                username: 'lgitfxqxcmmqox',
                password: 'dbd65a1bc01384d08aa148ecb8e0e937b2ed15214c15e09c9a79f6e4f87661d1',
                database: 'd6g22ske5oult0',
                port,
                host,
                dialect: 'postgres',
                operatorsAliases,
                define: {
                    underscored: true
                },
                logging: false
            };
        default:
            return {
                username: 'sergioruizdavila',
                password: 'admin',
                database: 'stylepills_dev',
                host: '127.0.0.1',
                port: process.env.PORT || 5432,
                dialect: 'postgres',
                operatorsAliases,
                define: {
                    underscored: true
                },
                logging: false
            };
    }
}
exports.databaseConfig = databaseConfig;
/*
(1) Es necesario agregar este define.underscored, ya que si lo remuevo, todas las propiedades auto
generadas por Sequelize e.g. created_at, updated_at, user_id, etc. se generarian camelCase, y no es
recomendable ese Naming Conventions
references: https://www.youtube.com/watch?v=Q-hyZDW8S0E

(2) Al activarlo lo que logramos hacer es poder ver las sentencias SQL en la terminal. Esto deberia
activarse y desactivarse dependiendo lo que se necesite en su momento. (IMPORTANTE: Esto no
deshabilita el logger por consola)
*/ 
//# sourceMappingURL=database.config.js.map
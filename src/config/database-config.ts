/************************************/
/*            INTERFACE             */
/************************************/
export interface IDatabaseConfig {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: string;
    logging: boolean | Function;
}


/****************************************/
/*            DATABASE CONFIG           */
/****************************************/
/* FIXME: El comando: 
    sequelize db:migrate 
No estaba funcionando si asignaba este archivo en '.sequelizerc' como
configuracion de la base de datos. Lo correcto es que tome este mismo
archivo como configuración, pero como arrojaba error, tuve que crear un
'database-config.json', asi que cuando corro: npm run server, se configura
enciende el server tomando este archivo como config de  la base, pero cuando
quiero lanzar un migrate: sequelize db:migrate, toma la configuracion del .json.
Buscar una solucion para sea el caso que sea siempre tome este archivo.*/
export const databaseConfig: IDatabaseConfig = {
    username: 'sergioruizdavila',
    password: 'admin',
    database: 'stylepills-dev',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: true
};
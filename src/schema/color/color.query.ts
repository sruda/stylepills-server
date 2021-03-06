/************************************/
/*           DEPENDENCIES           */
/************************************/
import { models, sequelize } from './../../models/index';
import { logger } from './../../core/utils/logger';


/************************************/
/*            INTERFACES            */
/************************************/    
interface IColorArgs {
    id: number;
}


/**************************************/
/*            QUERY TYPEDEF           */
/**************************************/

export const typeDef = `
    extend type Query {
        colorById(id: ID!): Color!
    }
`;


/*******************************************/
/*             QUERY RESOLVER              */
/*******************************************/

export const resolver = {
    Query: {
        
        /**
         * @desc Get Color by Id
         * @method Method colorById
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IColorArgs} args - destructuring: id
         * @param {number} id - Color id
         * @returns {IColor} Color entity
         */
        colorById(parent: any, { id }: IColorArgs) {
            // LOG
            logger.log('info', 'Query: colorById');
            return models.Color.findById(id);
        }

    },
    Color: {
        rgba(color: any) {
            // LOG
            logger.log('info', 'Query (Color): getRgba');
            return color.getRgba();
        }
    }
};
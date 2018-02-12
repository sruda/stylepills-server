/************************************/
/*           DEPENDENCIES           */
/************************************/
import { WhereOptions } from 'sequelize';
import { Buffer } from 'buffer';

import { models, sequelize } from './../../models/index';
import { Pagination, ICursorsResult }  from './../../core/utils/pagination';

import * as appConfig from './../../core/constants/app.constants';
import { functionsUtil } from './../../core/utils/functionsUtil';
import { logger } from './../../core/utils/logger';

import { IAtomInstance } from './../../models/atom.model';


/************************************/
/*            INTERFACES            */
/************************************/    

/**
 * Arguments passed to Project queries
 */
interface IProjectQueryArgs {
    id: number;
    userId: number;
    limit: number;
}



/**************************************/
/*            QUERY TYPEDEF           */
/**************************************/

export const typeDef = `

    extend type Query {
        projectById(id: ID!): Project!
        projectsByUserId(userId: ID!): [Project!]!
        allProjects(limit: Int): [Project!]!
    }

`;


/*******************************************/
/*              QUERY RESOLVER             */
/*******************************************/

export const resolver = {

    Query: {

        /**
         * @desc Get Project by Id
         * @method Method projectById
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IProjectQueryArgs} args - destructuring: id
         * @param {number} id - Project id
         * @returns {IProject} Project entity
         */
        projectById(parent: any, { id }: IProjectQueryArgs) {
            // LOG
            logger.log('info', 'Query: projectById');
            return models.Project.findById(id);
        },


        /**
         * @desc Get Projects by User Id
         * @method Method projectsByUserId
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IProjectQueryArgs} args - destructuring: userId
         * @returns {Array<IProject>} Projects List of a specific user
         */
        projectsByUserId(
            parent: any, 
            { userId }: IProjectQueryArgs
        ) {
            // LOG
            logger.log('info', 'Query: projectsByUserId');
            return models.Project.findAll({
                where: {
                    active: true,
                    authorId: userId
                }
            });
        },


        /**
         * @desc Get all Projects
         * @method Method allProjects
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IProjectQueryArgs} args - destructuring: limit
         * @param {Int} limit - limit number of results returned
         * @returns {Array<IProject>} Projects list
         */
        allProjects(parent: any, { limit = appConfig.ATOM_SEARCH_LIMIT }: IProjectQueryArgs) {
            // LOG
            logger.log('info', 'Query: allProjects');
            return models.Project.findAll({
                limit,
                where: {
                    active: true
                }
            });
        },

    },
    Project: {
        atoms(project: any) {
            // LOG
            logger.log('info', 'Query (Project): getAtoms');
            return project.getAtoms();
        },
        colorPalette(project: any) {
            // LOG
            logger.log('info', 'Query (Project): getColorPalette');
            return project.getColorPalette();
        },
        libs(project: any) {
            // LOG
            logger.log('info', 'Query (Project): getLibs');
            return project.getLibs();
        },
        preprocessors(project: any) {
            // LOG
            logger.log('info', 'Query (Project): getPreprocessors');
            return project.getPreprocessors();
        },
        author(project: any) {
            // LOG
            logger.log('info', 'Query: (Project) getAuthor');
            return project.getAuthor();
        },
        category(project: any) {
            // LOG
            logger.log('info', 'Query: (Project) getProjectCategory');
            return project.getProjectCategory();
        }
    }
};
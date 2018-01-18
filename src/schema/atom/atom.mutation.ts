/**************************************/
/*            DEPENDENCIES            */
/**************************************/
import * as Bluebird from 'bluebird';
import { logger } from './../../core/utils/logger';

import { functionsUtil } from './../../core/utils/functionsUtil';
import { models } from './../../models/index';

import { IStatus } from './../../core/interfaces/interfaces';
import { IAtom, IAtomAttributes, IAtomInstance } from './../../models/atom.model';


/************************************/
/*            INTERFACES            */
/************************************/
interface IAtomStatus extends IStatus {
    id?: number;
}

interface ICodeProps {
    code: string;
    libs?: Array<string>;
}

interface IAtomCodeProps {
    codeType: string;
    codeProps: ICodeProps;
}

interface ICreateAtomInput {
    authorId: number;
    ownerId?: number;
    name: string;
    description?: string;
    css: string;
    html: string;
    contextualBg: string;
    download: string;
    private: boolean;
    atomCategoryId: number | string;
    projectId: number;
}

interface ICreateAtomArgs {
    input: ICreateAtomInput;
}

interface IDuplicateAtomArgs {
    atomId: number;
    userId: number;
    atomCode: Array<IAtomCodeProps> | null;
}


/*****************************************/
/*             ATOM MUTATION             */
/*****************************************/
export const typeDef = `

# Custom Status

extend type Status {
    id: ID
}

# Input

input CodeProps {
    code: String!,
    libs: [String]
}

input AtomCodeProps {
    codeType: String!,
    codeProps: CodeProps!
}

input CreateAtomInput {
    authorId: ID!
    ownerId: ID
    name: String! 
    description: String
    css: String
    html: String
    private: Boolean!
    contextualBg: String
    atomCategoryId: Int
    projectId: Int
}

# Mutations
extend type Mutation {

    createAtom(input: CreateAtomInput!): Status!

    duplicateAtom(atomId: ID!, userId: ID!, atomCode: [AtomCodeProps]): Status!

    activeAtom(
        id: ID!
    ): Status!

    deactivateAtom(
        id: ID!
    ): Status!

}

`;

export const resolver = {
    Mutation: {

        /**
         * @desc Create Atom
         * @method Method createAtom
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {ICreateAtomArgs} args - destructuring: input
         * @param {ICreateAtomInput} input - destructuring: authorId, name, css, html, 
         * contextualBg, download, private, atomCategoryId
         * @param {number} authorId - Author id
         * @param {string} name - Atom name
         * @param {string} description - Atom description
         * @param {string} css - Atom css
         * @param {string} html - Atom html
         * @param {string} contextualBg - Atom contextual background
         * @param {boolean} private - the atom is private or not
         * @param {number} atomCategoryId - the atom category
         * @param {number} projectId - project id
         * @returns {Bluebird<IStatus>} status response (OK or Error)
         */

        createAtom(parent: any, { input }: ICreateAtomArgs): Bluebird<IAtomStatus> {

            // LOG
            logger.log('info', 'Mutation: createAtom');

            // NOTE: 1
            input = functionsUtil.emptyStringsToNull(input);

            // Assign user as the owner
            input.ownerId = input.authorId;

            // Validate if atom category id is equal to 0
            const RADIX = 10;
            if (typeof input.atomCategoryId === 'string' &&
                input.atomCategoryId !== null) {
                input.atomCategoryId = parseInt(input.atomCategoryId, RADIX);
            }

            if (input.atomCategoryId === 0) {
                input.atomCategoryId = null;
            }

            // Save the new Atom on DB
            return models.Atom.create(input)
            .then(
                (result: IAtomInstance) => {

                    const ERROR_MESSAGE = 'Mutation: createAtom TODO: Identify error';

                    let response: IAtomStatus = {
                        ok: false
                    };

                    if (result.dataValues) {
                        response = {
                            ok: true,
                            id: result.dataValues.id,
                            message: 'created successfull!'
                        };
                    } else {
                        // LOG
                        logger.log('error', ERROR_MESSAGE, result);
                    }

                    return response;

                }
            ).catch(
                (err) => {

                    // LOG
                    logger.log('error', 'Mutation: createAtom', { err });

                    return {
                        ok: false
                    };
                }
            );
        },


        /**
         * @desc Duplicate Atom
         * @method Method duplicateAtom
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IDuplicateAtomArgs} args - destructuring: atomId, userId, atomCode
         * @param {number} atomId - Atom id
         * @param {number} userId - User id
         * @param {Array<IAtomCodeProperties>} atomCode - New Atom source code
         * @returns {Bluebird<IStatus>} Atom entity
         */

        duplicateAtom(parent: any, { atomId, userId, atomCode = null }: IDuplicateAtomArgs): Bluebird<IStatus> {

            // LOG
            logger.log('info', 'Mutation: duplicateAtom');

            return models.Atom.findById(
                atomId
            )
            .then(
                (result) => {

                    // Build a new atom in order to create on database
                    let newAtom = _buildNewAtom(result.dataValues, userId, atomCode);

                    return models.Atom.create(
                        newAtom
                    )
                    .then(
                        () => {
                            return {
                                ok: true,
                                message: 'duplicated successfull!'
                            };
                        }
                    ).catch(
                        (err) => {

                            // LOG
                            logger.log('error', 'Mutation: duplicateAtom', { err });

                            return {
                                ok: false
                            };
                        }
                    );
                }
            ).catch(
                (err) => {

                    // LOG
                    logger.log('error', 'Mutation: duplicateAtom', { err });

                    return {
                        ok: false
                    };
                }
            );
        }
    },
};


/*****************************************/
/*            EXTRA FUNCTIONS            */
/*****************************************/


/**
 * @desc Build New Atom Object
 * @function _buildNewAtom
 * @private
 * @param {IAtomAttributes} atom - Atom data object
 * @param {number} userId - owner id
 * @param {Array<IAtomCodeProps>} atomCode - New Atom source code
 * @returns {IAtomAttributes} New Atom data object
 */

const _buildNewAtom = 
    (atom: IAtomAttributes, userId: number, atomCode: Array<IAtomCodeProps>): IAtomAttributes => {

    const html = _extractCode('html', atomCode) || atom.html;
    const css = _extractCode('css', atomCode) || atom.css;
    
    return {
        name: atom.name,
        html,
        css,
        description: atom.description,
        contextualBg: atom.contextualBg,
        download: atom.download,
        active: true,
        private: false,
        duplicated: true,
        authorId: atom.authorId,
        ownerId: userId,
        atomCategoryId: atom.atomCategoryId
    };

};


/**
 * @desc Extract new code
 * @function _extractCode
 * @private
 * @param {string} type - source code type (html, css, etc)
 * @param {Array<IAtomCodeProps>} atomCode - New Atom source code
 * @returns {any}
 */

const _extractCode = 
    (type: string, atomCode: Array<IAtomCodeProps>): string => {
    
    let code = null;
    
    if (!atomCode) { return code; }

    atomCode.forEach(atomCodeObj => {
        if (atomCodeObj.codeType === type) {
            code = atomCodeObj.codeProps.code;
        }
    });

    return code;

};


/* 
(1) Parse empty values to NULL (If website is Empty)(issue reported on Sequelize server)
references: https://github.com/sequelize/sequelize/issues/3958
*/
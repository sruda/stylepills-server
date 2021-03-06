/**************************************/
/*            DEPENDENCIES            */
/**************************************/
import * as Promise from 'bluebird';
import { logger } from './../../core/utils/logger';

import { 
        validateFields, 
        IValidationError as IValidationAtomError 
    } from './../../core/validations/atom';

import { models } from './../../models/index';

import { IStatus } from './../../core/interfaces/interfaces';
import { 
    IAtomCode, 
    IAtomAttributes, 
    IAtomInstance,
    buildNewAtom
 } from './../../models/atom.model';
import { ILib as ILibModel, ILibInstance } from './../../models/lib.model';


/************************************/
/*            INTERFACES            */
/************************************/
interface IAtomStatusResponse extends IStatus {
    id?: number;
    validationErrors?: IValidationAtomError;
}

interface ICreateAtomInput {
    authorId: number;
    ownerId?: number;
    name: string;
    description?: string;
    css: string;
    html: string;
    libs: Array<ILibModel>;
    contextualBg: string;
    download: string;
    private: boolean;
    atomCategoryId: number | string;
    projectId: number;
}

interface ICreateAtomArgs {
    input: ICreateAtomInput;
}

interface IDuplicateAtomInput {
    atomId: number;
    userId: number;
    atomCode: Array<IAtomCode> | null;
}

interface IDuplicateAtomArgs {
    input: IDuplicateAtomInput;
}


/*****************************************/
/*                MUTATION               */
/*****************************************/
export const typeDef = `

# Status

type ValidationAtomError {
    authorId: String
    name: String
    html: String
    css: String 
    contextualBg: String
    projectId: String
    atomCategoryId: String
    private: String
}

type AtomStatusResponse {
    id: ID
    ok: Boolean!,
    message: String
    validationErrors: ValidationAtomError
}


# Input

input CodeProps {
    code: String!
    libs: [String]
}

input AtomCodeProps {
    codeType: String!
    codeProps: CodeProps!
}

input CreateAtomInput {
    authorId: ID!
    ownerId: ID
    name: String! 
    description: String
    css: String
    html: String
    libs: [LibInput]
    private: Boolean!
    contextualBg: String
    atomCategoryId: Int
    projectId: Int
}

input DuplicateAtomInput {
    atomId: ID!
    userId: ID!
    atomCode: [AtomCodeProps]
}


# Mutations
extend type Mutation {

    createAtom(input: CreateAtomInput!): AtomStatusResponse!

    duplicateAtom(input: DuplicateAtomInput!): AtomStatusResponse!

    activeAtom(
        id: ID!
    ): AtomStatusResponse!

    deactivateAtom(
        id: ID!
    ): AtomStatusResponse!

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
         * @param {Array<ILibModel>} libs - External Libs of the project
         * @param {string} contextualBg - Atom contextual background
         * @param {boolean} private - the atom is private or not
         * @param {number} atomCategoryId - the atom category
         * @param {number} projectId - project id
         * @returns {Promise<IAtomStatusResponse>} status response (OK or Error)
         */

        createAtom(parent: any, { input }: ICreateAtomArgs): Promise<IAtomStatusResponse> {

            // LOG
            logger.log('info', 'Mutation: createAtom');

            // Validate each input field
            const { errors, isValid } = validateFields(input);

            if (isValid) {
                
                // Assign user as the owner
                input.ownerId = input.authorId;

                // TODO: Remove when you implement generate download links
                input.download = 'none';
    
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
                return models.Atom.create(
                    input,
                    {
                        include: [
                            {
                                model: models.Lib,
                                as: 'libs'
                            }
                        ]
                    }
                )
                .then(
                    (result: IAtomInstance) => {
    
                        const ERROR_MESSAGE = 'Mutation: createAtom TODO: Identify error';
    
                        let response: IAtomStatusResponse = {
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
                            ok: false,
                            message: err
                        };
                    }
                );

            } else {
                return Promise.resolve()
                .then(
                    () => {

                        return {
                            ok: false,
                            validationErrors: errors
                        };
                    }
                );
            }

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
         * @returns {Promise<IStatus>} Atom entity
         */
        duplicateAtom(parent: any, { input }: IDuplicateAtomArgs): Promise<IStatus> {

            const { atomId, userId, atomCode = null } = input;

            // LOG
            logger.log('info', 'Mutation: duplicateAtom');

            return models.Atom.findById(
                atomId,
                {
                    include: [
                        {
                            model: models.Lib,
                            as: 'libs'
                        },
                        {
                            model: models.Project,
                            as: 'project',
                            include: [{ 
                                model: models.Lib,
                                as: 'libs'
                            }]
                        }
                    ]
                }
            )
            .then(
                (res) => {

                    // Build a new atom in order to create on database
                    let newAtom = buildNewAtom(res.dataValues, userId, atomCode);

                    return models.Atom.create(
                        newAtom,
                        {
                            include: [
                                {
                                    model: models.Lib,
                                    as: 'libs'
                                }
                            ]
                        }
                    )
                    .then(
                        (result: IAtomInstance) => {

                            const ERROR_MESSAGE = 'Mutation: duplicateAtom TODO: Identify error';

                            let response: IAtomStatusResponse = {
                                ok: false
                            };

                            if (result.dataValues) {
                                response = {
                                    ok: true,
                                    id: result.dataValues.id,
                                    message: 'duplicated successfull!'
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
                            logger.log('error', 'Mutation: duplicateAtom', { err });

                            return {
                                ok: false,
                                message: err
                            };
                        }
                    );
                }
            ).catch(
                (err) => {

                    let response: IAtomStatusResponse = {
                        ok: false
                    };

                    if (err.message) {
                        response.message = err.message;
                    } else {
                        response.message = err;
                    }

                    // LOG
                    logger.log('error', 'Mutation: duplicateAtom', response);

                    return response;
                }
            );
        }
    },
};
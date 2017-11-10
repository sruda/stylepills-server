"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/************************************/
/*           DEPENDENCIES           */
/************************************/
const index_1 = require("./../../models/index");
const buffer_1 = require("buffer");
/**************************************/
/*         ATOM QUERY TYPEDEF         */
/**************************************/
exports.typeDef = `

    input AtomFilter {
        private: Boolean        
        atomCategoryId: Int
        text: String
    }

    input ConnectionInput {
        first: Int
        after: String
        last: Int
        before: String
    }

    # Test
    type AtomConnectionOffset {
        edges: [AtomEdge]
        pageInfo: PageInfo!
        count: Int
    }

    type AtomConnection {
        edges: [AtomEdge]
        pageInfo: PageInfo!
    }

    type AtomEdge {
        cursor: String!
        node: Atom!
    }

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
    }

    extend type Query {
        atomById(id: ID!): Atom!
        allAtoms(limit: Int): [Atom!]!
        atomsByCategory(filter: AtomFilter, limit: Int): [Atom!]!
        atomCursorPaginated(atomConnection: ConnectionInput): AtomConnection
        searchAtoms(filter: AtomFilter, 
                    sortBy: String,
                    limit: Int,
                    offset: Int): AtomConnectionOffset!
    }

`;
/*******************************************/
/*            ATOM QUERY RESOLVER          */
/*******************************************/
exports.resolver = {
    PageInfo: {
        hasNextPage(connection, args) {
            return connection.hasNextPage();
        },
        hasPreviousPage(connection, args) {
            return connection.hasPreviousPage();
        }
    },
    Query: {
        /**
         * @desc Get Atom by Id
         * @method Method atomById
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IAtomQueryArgs} args - destructuring: id
         * @param {number} id - Atom id
         * @returns {IAtom} Atom entity
         */
        atomById(parent, { id }) {
            return index_1.models.Atom.findById(id);
        },
        /**
         * @desc Get all Atoms
         * @method Method allAtoms
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IAtomQueryArgs} args - destructuring: limit
         * @param {Int} limit - limit number of results returned
         * @returns {Array<IAtom>} Atoms list
         */
        // TODO: Crear un archivo de constantes como en el FE, para almacenar 12
        allAtoms(parent, { limit = 12 }) {
            return index_1.models.Atom.findAll({
                limit,
                where: {
                    active: true
                }
            });
        },
        /**
         * @desc Get Atoms by Category
         * @method Method atomsByCategory
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IAtomQueryArgs} args - destructuring: filter, limit, sortBy
         * @param {IAtomFilterArgs} filter - a set of filters
         * @param {number} limit - limit number of results returned
         * @returns {Array<Atom>} Atoms List of a specific category (Buttons, Inputs, Labels, etc.)
         */
        // TODO: Crear un archivo de constantes como en el FE, para almacenar 12
        atomsByCategory(parent, { filter, limit = 12 }) {
            return index_1.models.Atom.findAll({
                limit,
                where: {
                    active: true,
                    atomCategoryId: filter.atomCategoryId
                }
            });
        },
        /**
         * @desc Get Atoms by an user's input text (including category filter)
         * @method Method searchAtoms
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IAtomQueryArgs} args - destructuring: filter, limit, sortBy
         * @param {IAtomFilterArgs} filter - a set of filters
         * @param {String} sortBy - sort list by a passed parameter
         * @param {number} limit - limit number of results returned
         * @returns {Array<Atom>} Atoms List based on a filter parameters:
         * e.g category, user's input text
         */
        // TODO: Crear un archivo de constantes como en el FE, para almacenar 'created_at' y 12
        searchAtoms(parent, { filter, sortBy = 'created_at', limit = 12, offset = 12 }) {
            // Init Filter
            let queryFilter = {
                active: true,
                private: filter.private || false
            };
            // Add 'atomCategoryId' filter if it exists or is different from 0
            if (filter.atomCategoryId && filter.atomCategoryId !== 0) {
                queryFilter.atomCategoryId = filter.atomCategoryId;
            }
            // Add 'name' filter if 'text' exists
            if (filter.text) {
                queryFilter.name = {
                    $like: `%${filter.text}%`
                };
            }
            // Get all Atoms based on query args
            // TODO: Crear un archivo de constantes como en el FE, para almacenar 'DESC'
            return index_1.models.Atom.findAndCountAll({
                where: queryFilter,
                order: [[sortBy, 'DESC']],
                limit,
                offset
            }).then((atoms) => {
                const edges = atoms.rows.map(atom => ({
                    // TODO: No deberia usar: dataValues, deberia poder usar atom.id directamente
                    cursor: buffer_1.Buffer.from(atom.dataValues.id.toString()).toString('base64'),
                    node: atom
                }));
                return {
                    edges,
                    count: atoms.count,
                    pageInfo: {
                        hasNextPage() {
                            return true;
                        },
                        hasPreviousPage() {
                            return true;
                        }
                    }
                };
            });
        },
        /**
         * @desc Implementation of a Atom pagination based on Relay Cursor Connection (only sortBy ID)
         * @method Method atomCursorPaginated
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IAtomQueryArgs} args - destructuring: filter, limit, sortBy
         * @param {any} atomConnection - include: first, last, before, and after parameters
         * @returns {Array<Atom>} Atoms List based on a pagination params
         */
        atomCursorPaginated(parent, { atomConnection = {} }) {
            const { first, last, before, after } = atomConnection;
            let where = {};
            const DESC = 'DESC';
            const ASC = 'ASC';
            let order = DESC;
            // PREVIOUS (before => ASC => $gt)
            if (before) {
                let cursor = buffer_1.Buffer.from(before, 'base64').toString().split(':');
                if (cursor[1] === '0') {
                    where = {
                        likes: { $gte: cursor[1] },
                        id: { $gt: cursor[0] }
                    };
                }
                else {
                    where.likes = { $gt: cursor[1] };
                }
                order = ASC;
            }
            // NEXT (after => DESC => $lt)
            if (after) {
                let cursor = buffer_1.Buffer.from(after, 'base64').toString().split(':');
                if (cursor[1] === '0') {
                    where = {
                        likes: { $lte: cursor[1] },
                        id: { $lt: cursor[0] }
                    };
                }
                else {
                    where.likes = { $lt: cursor[1] };
                }
                order = DESC;
            }
            return index_1.models.Atom.findAll({
                where,
                order: [['likes', order], ['id', order]],
                limit: first || last
            }).then((atoms) => {
                // When is 'previous button' is necessary to reverser the array result
                if (before) {
                    atoms = atoms.slice(0).reverse();
                }
                const edges = atoms.map(atom => {
                    let str = `${atom.dataValues.id}:${atom.dataValues.likes}`;
                    return {
                        cursor: buffer_1.Buffer.from(str).toString('base64'),
                        node: atom
                    };
                });
                return {
                    edges,
                    pageInfo: {
                        hasNextPage() {
                            // 'elements returned' is less than 'elements per page'
                            if (atoms.length < (last || first) &&
                                after) {
                                return Promise.resolve(false);
                            }
                            // get element greater than/less than last element on 'returned' elements list
                            return index_1.models.Atom.findOne({
                                where: {
                                    id: {
                                        [before ? '$lt' : '$gt']: atoms[atoms.length - 1].dataValues.id,
                                    },
                                },
                                order: [['id', 'DESC']],
                            }).then((atom) => {
                                return !!atom;
                            });
                        },
                        hasPreviousPage() {
                            // 'elements returned' is less than 'elements per page'
                            if (atoms.length < (last || first) &&
                                before) {
                                return Promise.resolve(false);
                            }
                            // get element greater than/less than cursor element
                            return index_1.models.Atom.findOne({
                                where: {
                                    id: where.id,
                                },
                                order: [['id']],
                            }).then(atom => !!atom);
                        },
                    }
                };
            });
        }
    },
    Atom: {
        comments(atom) {
            return atom.getComments();
        },
        author(atom) {
            return atom.getUser();
        },
        category(atom) {
            return atom.getAtomCategory();
        }
    }
};
/*
Search Atoms Pagination structure

input AtomPagination {
    first: Int
    after: String
}

input AtomFilter {
    private: Boolean
    atomCategoryId: Int
    text: String
}

extend type Query {
    searchAtoms(pagination: AtomPagination, filter: AtomFilter, sortBy: String, limit: Int): [Atom!]!
}

searchAtoms(filter: AtomFilter, sortBy: String, limit: Int): [Atom!]!
*/ 
//# sourceMappingURL=atom.query.js.map
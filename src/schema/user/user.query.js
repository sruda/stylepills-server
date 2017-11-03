"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/************************************/
/*           DEPENDENCIES           */
/************************************/
const index_1 = require("./../../models/index");
/**************************************/
/*         USER QUERY TYPEDEF         */
/**************************************/
exports.typeDef = `
    extend type Query {
        userById(id: ID!): User!
        allUsers(limit: Int): [User!]!
    }
`;
/*******************************************/
/*           USER QUERY RESOLVER           */
/*******************************************/
exports.resolver = {
    Query: {
        /**
         * @desc Get User by Id
         * @method Method userById
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IUserArgs} args - destructuring: id
         * @param {number} id - User id
         * @returns {IUser} User entity
         */
        userById(parent, { id }) {
            return index_1.models.User.findById(id);
        },
        /**
         * @desc Get all Users
         * @method Method allUsers
         * @public
         * @param {any} parent - TODO: Investigar un poco más estos parametros
         * @param {IUserArgs} args - destructuring: limit
         * @param {Int} limit - limit number of results returned
         * @returns {Array<IUser>} Users list
         */
        allUsers(parent, { limit }) {
            return index_1.models.User.findAll({
                limit,
                where: {
                    active: true
                }
            });
        }
    },
    User: {
        atoms(user) {
            return user.getAtoms();
        }
    }
};
/*

Queries:


query getUserById($userId : ID!) {
    userById(id: $userId) {
        id
        firstname
        lastname
        username
        email
        avatar
        about
        website
        __typename
        atoms {
            id
            name
            __typename
        }
    }
}
*/ 
//# sourceMappingURL=user.query.js.map
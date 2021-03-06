"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/************************************/
/*           DEPENDENCIES           */
/************************************/
const jwt = require("jsonwebtoken");
const passport_google_oauth_1 = require("passport-google-oauth");
const config_1 = require("./../../config/config");
const functionsUtil_1 = require("./../utils/functionsUtil");
const index_1 = require("./../../models/index");
const logger_1 = require("./../utils/logger");
/***************************************/
/*             AUTH CLASS              */
/***************************************/
class Auth {
    /*       CONSTRUCTOR      */
    /**************************/
    constructor(passport) {
        /* Init server config */
        this._serverConfig = config_1.config.getServerConfig();
        // PASSPORT SESSION SETUP
        // ========================
        // Init google auth strategy
        this._googleStrategy(passport);
        // Serialize current user
        this._serializeUser(passport);
        // Deserialize current user
        this._deserializeUser(passport);
    }
    /*       METHODS       */
    /***********************/
    /**
     * @desc Init Google Auth Strategy
     * @method googleStrategy
     * @private
     * @param {Passport} passport - Passport object
     * @returns {void}
     */
    _googleStrategy(passport) {
        // Register Google Passport strategy
        passport.use(new passport_google_oauth_1.OAuth2Strategy(this._serverConfig.googleAuth, (accessToken, refreshToken, profile, done) => {
            // LOG
            logger_1.logger.log('info', 'Google Auth: Register requested', { accessToken });
            // asynchronous
            process.nextTick(() => {
                // Find if the user exists
                index_1.models.User.findOne({
                    include: [{
                            model: index_1.models.AuthenticationMethod,
                            where: { type: 'google', externalId: profile.id }
                        }]
                }).then((user) => {
                    // If user exists
                    if (user) {
                        // LOG
                        logger_1.logger.log('info', 'Google Auth: user already exists', { email: user.getDataValue('email') });
                        return done(null, this._generateJWT(user, accessToken));
                        // If user does not exists
                    }
                    else {
                        // LOG
                        logger_1.logger.log('info', 'Google Auth: creating user...');
                        // create a new User instance
                        let newUser = index_1.models.User.build(null, { include: [{
                                    model: index_1.models.AuthenticationMethod
                                }] });
                        newUser = this._transformGoogleProfile(newUser, profile._json);
                        // generate username
                        let { firstname, lastname } = newUser.dataValues;
                        newUser.dataValues.username = functionsUtil_1.functionsUtil.generateUsername(firstname, lastname);
                        // Create new User
                        newUser.save().then(() => {
                            // Save authentication method asociated to the new user
                            newUser.createAuthenticationMethod({
                                type: 'google',
                                externalId: profile.id,
                                token: accessToken,
                                displayName: profile.displayName
                            })
                                .then(() => {
                                // LOG
                                logger_1.logger.log('info', 'Google Auth: user created successfull', { email: newUser.getDataValue('email') });
                                done(null, this._generateJWT(newUser, accessToken));
                            }).catch(err => {
                                // LOG
                                logger_1.logger.log('error', 'Google Auth: newUser.createAuthenticationMethod', { err });
                            });
                        }).catch(err => {
                            // LOG
                            logger_1.logger.log('error', 'Google Auth: newUser.save', { err });
                        });
                    }
                })
                    .catch(err => {
                    // LOG
                    logger_1.logger.log('error', 'Google Auth: models.User.findOne', { err });
                });
            });
        }));
    }
    /**
     * @desc Serialize user into the sessions
     * @method serializeUser
     * @private
     * @param {Passport} passport - Passport object
     * @returns {void}
     */
    _serializeUser(passport) {
        passport.serializeUser((user, done) => done(null, user));
    }
    /**
     * @desc Deserialize user from the sessions
     * @method deserializeUser
     * @public
     * @param {Passport} passport - Passport object
     * @returns {void}
     */
    _deserializeUser(passport) {
        passport.deserializeUser((user, done) => done(null, user));
    }
    /**
     * @desc Generate JWT Token
     * @method _generateJWT
     * @private
     * @param {IUserInstance} user - User Model Instance
     * @param {any} profile - Google Profile JSON result after logIn/signUp process
     * @returns {void}
     */
    _generateJWT(user, accessToken) {
        const dataToEncode = {
            user: {
                id: user.dataValues.id,
                username: user.dataValues.username,
                firstname: user.dataValues.firstname,
                lastname: user.dataValues.lastname,
                email: user.dataValues.email,
                avatar: user.dataValues.avatar
            },
            token: accessToken
        };
        const token = jwt.sign(dataToEncode, this._serverConfig.auth.jwt.secret);
        return token;
    }
    /**
     * @desc Transform a google profile on a user object
     * @method _transformGoogleProfile
     * @private
     * @param {IUserInstance} user - User Model Instance
     * @param {any} profile - Google Profile JSON result after logIn/signUp process
     * @returns {void}
     */
    _transformGoogleProfile(user, profile) {
        user.dataValues.email = profile.emails[0].value;
        user.dataValues.firstname = profile.name.givenName;
        user.dataValues.lastname = profile.name.familyName;
        user.dataValues.avatar = profile.image.url.replace('?sz=50', '?sz=200');
        user.dataValues.about = profile.tagline;
        return user;
    }
}
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map
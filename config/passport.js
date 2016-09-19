var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Usuario = require('../models/usuarios');
var configAuth = require('./auth');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Usuario.findById(id, function (err, user) {
            done(err, user);
        });
    });

    //Local
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'local.email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            process.nextTick(function () {
                //Buscar un usuario cuyo nombre sea igual que el del formulario
                //Checando si el usuario tratando de accesar ya existe
                Usuario.findOne({'local.email': email}, function (err, user) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'Usuario ya tomado'));
                    } else {
                        // console.log(req.body);
                        //Si no existe un usuario con ese nombre, crear usuario
                        var usuarioNuevo = new Usuario();
                        usuarioNuevo.local.email = email;
                        usuarioNuevo.local.password = usuarioNuevo.generateHash(password);

                        usuarioNuevo.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, usuarioNuevo);
                        });
                    }
                });
            });
        }));

    passport.use("local-login", new LocalStrategy({
            usernameField: 'local.email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            Usuario.findOne({'local.email': email}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Contraseña equivocada'));
                }
                return done(null, user);
            });
        }));

    //Facebook
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL
        },
        function (token, refreshToken, profile, done) {

            process.nextTick(function () {
                Usuario.findOne({'facebook.id': profile.id}, function (err, user) {

                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, user);
                    } else {
                        var nuevoUsuarioFacebook = new Usuario();

                        nuevoUsuarioFacebook.facebook.id = profile.id;
                        nuevoUsuarioFacebook.facebook.token = token;
                        nuevoUsuarioFacebook.facebook.name = profile.displayName;

                        nuevoUsuarioFacebook.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, nuevoUsuarioFacebook);
                        });
                    }

                });
            });

        }));

    //Twitter
    passport.use(new TwitterStrategy({
            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL
        },
        function (token, tokenSecret, profile, done) {
            process.nextTick(function () {
                Usuario.findOne({'twitter.id': profile.id}, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (user) {
                        return done(null, user);
                    } else {
                        var nuevoUsuarioTwitter = new Usuario();

                        nuevoUsuarioTwitter.twitter.id = profile.id;
                        nuevoUsuarioTwitter.twitter.token = token;
                        nuevoUsuarioTwitter.twitter.username = profile.username;
                        nuevoUsuarioTwitter.twitter.displayName = profile.displayName;

                        nuevoUsuarioTwitter.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, nuevoUsuarioTwitter);
                        });
                    }
                });
            });
        }));

    //Google
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,

        },
        function (token, refreshToken, profile, done) {
            process.nextTick(function () {

                Usuario.findOne({'google.id': profile.id}, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (user) {
                        return done(null, user);
                    } else {
                        var nuevoUsuarioGoogle = new Usuario();

                        // set all of the relevant information
                        nuevoUsuarioGoogle.google.id = profile.id;
                        nuevoUsuarioGoogle.google.token = token;
                        nuevoUsuarioGoogle.google.name = profile.displayName;
                        nuevoUsuarioGoogle.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        nuevoUsuarioGoogle.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, nuevoUsuarioGoogle);
                        });
                    }
                });
            });

        }));

};

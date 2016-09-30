/**
 * Created by ezubia on 9/22/16.
 */
var Usuario = require('./../models/Usuario');
var Proyecto = require('./../models/Proyecto');
var ProductBacklog = require('./../models/ProductBacklog');
var LiberacionBacklog = require('./../models/LiberacionBacklog');
var Rol = require('./../models/roles');
var Sprint = require('./../models/Sprint');
var HistoriaUsuario = require('./../models/HistoriaUsuario');
//var mongoose = require('mongoose');

module.exports = function (app, passport, roles, mongoose, io, isLoggedIn) {

    app.get('/login', function (req, res) {
        res.render('landing');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/landing',
        failureFlash: true
    }));

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));

    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/landing',
        failureFlash: true
    }));


    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile',
            {
                message: req.flash('signupMessage'),
                user: req.user,
                habilidades : req.user.habilidades || []
            });
    });


    app.post('/profile', isLoggedIn, function (req, res) {
        var usuario = req.user;
        usuario.nombre = req.body.nombre;
        usuario.apellidos = req.body.apellidos;
        usuario.fechaNacimiento = req.body.fechaNacimiento;
        usuario.rfc = req.body.rfc;
        usuario.curp = req.body.curp;
        usuario.domicilio = req.body.domicilio;
        usuario.habilidades = JSON.parse(req.body.habilidades);

        new Usuario(usuario).save(function (err, user) {
                if (err) {
                    res.render("profile", {
                        message: req.flash('Error al guardar datos.'),
                        user: req.user,
                        habilidades : req.user.habilidades || []

                    });
                } else {
                    res.render("profile", {
                        message: req.flash('Exito!'),
                        user: user,
                        habilidades : req.user.habilidades || []

                    });
                }
            }
        );
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/landing');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/landing');
    }

    app.get("/main", isLoggedIn, function (req, response) {
        response.render("templates/main");
    });
    

    var sass;
    app.get("/findUsuarios", function (req, response) {
        //Implementación de nueva session
        sass = req.session;
        Usuario.find({}).exec(function (err, usuarios) {
            if (err) response.redirect("/")
            else
                return response.json(usuarios);
        });
    });
    
    
    app.post("/crearUsuario", isLoggedIn, function (req, res) {
        var usuario = new Usuario({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.pass,
            confirmarPassword: req.body.passConfirm,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            fechaNacimiento: req.body.fechaDeNacimiento,
            curp: req.body.CURP,
            rfc: req.body.RFC,
            domicilio: req.body.domicilio
        });
        //err tiene los errores que pueden pasar y obj el objeto a guardar.
        usuario.save(function (err, obj) {
            if (err) res.redirect("/crear", {obj: obj});
        });
        res.redirect("/");
    });
    
};

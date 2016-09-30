/**
 * Created by ezubia on 9/22/16.
 */
var Usuario = require('./../models/Usuario');
var Proyecto = require('./../models/Proyecto');
var Rol = require('./../models/roles');

module.exports = {
    isLoggedIn: function(req, res, next) {
        // if (req.isAuthenticated()) {
        //     return next();
        // }
        // res.redirect('/landing');
        return next();
    }
};


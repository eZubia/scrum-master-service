var express = require("express");
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var ConnectRoles = require('connect-roles');
var flash = require('connect-flash');
var roles = new ConnectRoles({
    failureHandler: function (req, res, action) {
        // optional function to customise code that runs when
        // user fails authorisation
        var accept = req.headers.accept || '';
        res.status(403);
        if (~accept.indexOf('html')) {
            res.render('access-denied', {action: action});
        } else {
            res.send('Access Denied - You don\'t have permission to: ' + action);
        }
    }
});
// var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
//
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
var Usuario = require('./models/usuarios').Usuario;
//
// //Configurations
//TODO: descomentar logger
// app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json()); //Application JSON
app.use(bodyParser.urlencoded({extended: false}));// Multipart con array
//
// //View engine
app.set("view engine", "jade");
//
//
//app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use("/static", express.static(__dirname + "/static"));
//
//
app.use(session({
    secret: process.env.Session_Secret || "455e96f6c76b60d39f549f2f7a1830f1", //Es un hash que identifica  nuestra aplicacion de otras aplicaciones express
    resave: false,//Cada vez que se haga un request se tiene que guardar o rehacer la sesión
    saveUninitialized: false // Sirve para reinicializar la sesión cada vez que se hace un request
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(roles.middleware());
app.use(flash());
//
roles.use(function (req, action) {
    if (!req.isAuthenticated()) return action === '/login';
});
//
// //Scrum Master puede ver todo
// roles.use(function (req) {
//     if (req.user.rolActual === 'scrum-master') {
//         return true;
//     }
// });
//
// //Paginas de Product Owner
// roles.use('product-owner page', function (req) {
//     if (req.user.rolActual === 'proyect-manager') {
//         return true;
//     }
// })
//
// roles.use('product-owner page', function (req) {
//     if (req.user.rolActual === 'product-owner') {
//         return true;
//     }
// })
//
// //Paginas de Developer
// roles.use('developer page', function (req) {
//     if (req.user.rolActual === 'developer' ) {
//         return true;
//     }
// })
//
var server = require('http').Server(app);
var io = require("socket.io")(server);


require('./routes.js')(app, passport, roles, mongoose, io);
require('./config/passport')(passport);

app.get('/partials/:name', function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});

app.get('/', function (req, res) {
    res.render('landing');
});

app.get('/landing', function (req, res) {
    res.render('landing');
});

server.listen(port, function () {
    console.log("Escuchando desde el puerto " + port);
});

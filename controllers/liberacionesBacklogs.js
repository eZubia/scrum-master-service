// /**
//  * Created by ezubia on 9/22/16.
//  */
//
// var Usuario = require('./models/Usuario');
// var Proyecto = require('./models/Proyecto');
// var ProductBacklog = require('./models/ProductBacklog');
// var LiberacionBacklog = require('./models/LiberacionBacklog');
// var Rol = require('./models/roles');
// var Sprint = require('./models/Sprint');
// var HistoriaUsuario = require('./models/HistoriaUsuario');
// //var mongoose = require('mongoose');
//
// module.exports = function (app, passport, roles, mongoose, io) {
//
//
// };
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

module.exports = function (app, passport, roles, mongoose, io, isLoggedInne) {

    app.get("/find/release/proyecto/:idProyecto", function(req, response){
        LiberacionBacklog.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto)})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });

    app.get('/addReleaseBacklog',isLoggedIn, function (req, res) {
        req.session = sass;
        Proyecto.findOne({"_id": mongoose.Types.ObjectId(req.session.proyecto)})
            .exec(function (err, proyecto){
                HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.session.proyecto), "liberacionBacklog": {
                    "$exists": false
                }}).select("-__v").exec(function(err, obj){
                    var jsonHistorias = JSON.stringify(obj);
                    if(obj.length>0){
                        res.render('releaseBackLog', {usuario: req.user, proyecto: proyecto, historias: jsonHistorias});
                    } else {
                        res.redirect("/detalleProyecto");
                    }
                });
            });

    });
    var sass;
    app.get('/showReleaseBacklog',isLoggedIn, function (req, res) {
        if(!req.query.releaseElegido){
            req.session = sass;
            LiberacionBacklog.findById(req.session.releaseElegido)
                .exec(function (err, release){
                    Proyecto.findById(release.proyecto)
                        .exec(function(err, proyecto){
                            res.render('showReleaseBackLog', {usuario: req.user, proyecto: proyecto, release: release, rolActual:req.session.rolActual});
                        });
                });
        } else {
            req.session = sass;
            req.session.releaseElegido = req.query.releaseElegido;
            sass = req.session;
            LiberacionBacklog.findById(req.query.releaseElegido)
                .exec(function (err, release){
                    Proyecto.findById(release.proyecto)
                        .exec(function(err, proyecto){
                            res.render('showReleaseBackLog', {usuario: req.user, proyecto: proyecto, release: release, rolActual:req.session.rolActual});
                        });
                });
        }

    });

    app.post("/crearRelease", function (req, res) {
        if(req.body.historias.length<1){
            return res.status(400).send({message:"No hay historias en el Release"});
        }
        if(!req.body.release.nombreRelease){
            return res.status(400).send({message:"No hay nombre en el Release"});
        }
        if(!req.body.release.descripcionRelease){
            return res.status(400).send({message:"No hay descripción en el Release"});
        }
        var newRelease = new LiberacionBacklog({
            proyecto: mongoose.Types.ObjectId(req.body.release.proyecto),
            finalizo:false,
            fechaFinalizacion: Date(),
            descripcionRelease: req.body.release.descripcionRelease,
            nombreRelease: req.body.release.nombreRelease
        });
        newRelease.save(function(err, obj){
            if(err){
                return res.status(400).send({message:"Error al guardar"});
            }
            req.body.historias.forEach(function(historia){
                HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                    {$set: {"liberacionBacklog": mongoose.Types.ObjectId(obj._id)}},
                    function (err) {
                        if (err) {
                            err();
                        }
                    });
            });
            res.json("{}");
        });
    });

    io.on('connect', function (socket) {
        socket.emit('sendHistorias');

        socket.on('newRelease', function (historias, release) {
            if(historias.length<1){
                socket.emit("falloFatal");
            }
            if(!release.nombreRelease){
                socket.emit("falloFatal");
            }
            if(!release.descripcionRelease){
                socket.emit("falloFatal");
            }
            var newRelease = new LiberacionBacklog({
                proyecto: mongoose.Types.ObjectId(release.proyecto),
                finalizo:false,
                fechaFinalizacion: Date(),
                descripcionRelease: release.descripcionRelease,
                nombreRelease: release.nombreRelease
            });
            newRelease.save(function(err, obj){
                if(err){
                    io.emit("falloFatal");
                }
                historias.forEach(function(historia){
                    HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                        {$set: {"liberacionBacklog": mongoose.Types.ObjectId(obj._id)}},
                        function (err) {
                            if (err) {
                                err();
                            }
                        });
                });
                io.emit("updateRelease");
            });
        });

    });
    

};


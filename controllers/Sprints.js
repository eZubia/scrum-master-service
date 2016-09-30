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

    app.get('/showSprintBacklog',isLoggedIn, function (req, res) {
        if(!req.query.sprintElegido){
            Sprint.findById(req.session.sprintElegido).populate("liberacionBacklog")
                .exec(function (err, sprint){
                    Proyecto.findById(sprint.liberacionBacklog.proyecto)
                        .exec(function(err, proyecto){
                            res.render('showSprintBackLog', {usuario: req.user, proyecto: proyecto, sprint: sprint, rolActual:req.session.rolActual});
                        });
                });
        } else {
            req.session = sass;
            req.session.sprintElegido = req.query.sprintElegido;
            sass = req.session;
            Sprint.findById(req.query.sprintElegido).populate("liberacionBacklog")
                .exec(function (err, sprint){
                    Proyecto.findById(sprint.liberacionBacklog.proyecto)
                        .exec(function(err, proyecto){
                            res.render('showSprintBackLog', {usuario: req.user, proyecto: proyecto, sprint: sprint, rolActual:req.session.rolActual});
                        });
                });
        }

    });

    app.post("/crearSprint", function (req, res) {
        if(req.body.historias.length<1){
            return res.status(400).send({message:"No hay historias en el Release"});
        }
        if(!req.body.sprint.nombreSprint){
            return res.status(400).send({message:"No hay nombre en el Release"});
        }
        if(!req.body.sprint.descripcionSprint){
            return res.status(400).send({message:"No hay descripción en el Release"});
        }

        var newSprint = new Sprint({
            liberacionBacklog: mongoose.Types.ObjectId(req.body.sprint.liberacionBacklog),
            finalizo:false,
            fechaFinal: Date(),
            descripcionSprint: req.body.sprint.descripcionSprint,
            nombreSprint: req.body.sprint.nombreSprint
        });
        newSprint.save(function(err, obj){
            if(err){
                return res.status(400).send({message:"Error al guardar"});
            }
            req.body.historias.forEach(function(historia){
                HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                    {$set: {"sprint": mongoose.Types.ObjectId(obj._id)}},
                    function (err) {
                        if (err) {
                            err();
                        }
                    });
            });
            res.json("{}");
        });
    });

    app.get("/find/sprints/release/:idRelease", function(req, response){
        Sprint.find({"liberacionBacklog": mongoose.Types.ObjectId(req.params.idRelease)})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });

    io.on('connect', function (socket) {
        socket.emit('sendHistorias');

        socket.on('newSprint', function (historias, sprint) {
            if(historias.length<1){
                socket.emit("falloFatal");
            }
            if(!sprint.nombreSprint){
                socket.emit("falloFatal");
            }
            if(!sprint.descripcionSprint){
                socket.emit("falloFatal");
            }

            var newSprint = new Sprint({
                liberacionBacklog: mongoose.Types.ObjectId(sprint.liberacionBacklog),
                finalizo:false,
                fechaFinal: Date(),
                descripcionSprint: sprint.descripcionSprint,
                nombreSprint: sprint.nombreSprint
            });
            newSprint.save(function(err, obj){
                if(err){
                    socket.emit("falloFatal");
                }
                historias.forEach(function(historia){
                    HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                        {$set: {"sprint": mongoose.Types.ObjectId(obj._id)}},
                        function (err) {
                            if (err) {
                                err();
                            }
                        });
                });
                io.emit("updateSprints");
            });
        });

    });

};
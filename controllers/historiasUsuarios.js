/**
 * Created by ezubia on 9/22/16.
 */
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

    app.get("/find/historias/proyecto/:idProyecto", function(req, response){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto)})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });

    app.get("/count/dias/proyecto/:idProyecto", function(req, response){
        var dias = 0;
        HistoriaUsuario.find(
            {"proyecto": mongoose.Types.ObjectId(req.params.idProyecto),
                "terminada":false})
            .exec(function (err, historias) {
                if(!historias){
                    return response.json("0");
                }
                if(historias.length<1){
                    return response.json("0");
                } else {
                    historias.forEach(function(historia){
                        dias += historia.tamanio;
                    });
                    if(dias == 0){
                        return response.json("0");
                    } else {
                        return response.json(dias);
                    }
                }
            });
    });

    app.get("/count/dias/release/:idRelease", function(req, response){
        var dias = 0;
        HistoriaUsuario.find(
            {"liberacionBacklog": mongoose.Types.ObjectId(req.params.idRelease),
                "terminada":false})
            .exec(function (err, historias) {
                if(!historias){
                    return response.json("0");
                }
                if(historias.length<1){
                    return response.json("0");
                } else
                    historias.forEach(function(historia){
                        dias += historia.tamanio;
                    });
                if(dias == 0){
                    return response.json("0");
                } else {
                    return response.json(dias);
                }
            });
    });

    app.get("/count/dias/sprint/:idSprint", function(req, response){
        var dias = 0;
        HistoriaUsuario.find(
            {"sprint": mongoose.Types.ObjectId(req.params.idSprint),
                "terminada":false})
            .exec(function (err, historias) {
                if(!historias){
                    return response.json("0");
                }
                if(historias.length<1){
                    return response.json("0");
                } else {
                    historias.forEach(function(historia){
                        dias += historia.tamanio;
                    });
                    if(dias == 0){
                        return response.json("0");
                    } else {
                        return response.json(dias);
                    }
                }
            });
    });
    

    app.get("/find/historias/release/:idRelease", function(req, response){
        HistoriaUsuario.find({"liberacionBacklog": mongoose.Types.ObjectId(req.params.idRelease), "sprint":{$exists:false}})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });

    app.get("/findBy/historias/:idHistoria", function(req, response){
        HistoriaUsuario.findById(req.params.idHistoria)
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });



    app.get("/find/historias/sprint/:idSprint", function(req, response){
        HistoriaUsuario.find({"sprint": mongoose.Types.ObjectId(req.params.idSprint), "desarrollador":{$exists:false}})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });

    app.get("/find/historias/sprint/desarrollador/:idSprint", function(req, response){
        HistoriaUsuario.find({"sprint": mongoose.Types.ObjectId(req.params.idSprint), "desarrollador":{$exists:true}})
            .exec(function (err, obj) {
                return response.json(obj);
            });
    });
    


    app.get("/find/historias/asignadas/:idProyecto/:idDesarrollador", function(req, res){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto),
            "desarrollador": mongoose.Types.ObjectId(req.params.idDesarrollador),
            "terminada":false,
            "revisada":false})
            .exec(function(err, obj){
                res.json(obj);
            });
    });

    app.get("/find/historias/asignadas/revisadas/:idProyecto/:idDesarrollador", function(req, res){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto),
            "desarrollador": mongoose.Types.ObjectId(req.params.idDesarrollador),
            "terminada":true,
            "revisada":false})
            .exec(function(err, obj){
                res.json(obj);
            });
    });
    

    app.get("/find/historias/porValidar/:idProyecto", function(req, res){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto),
            "terminada": true,
            "revisada":false})
            .exec(function(err, obj){
                res.json(obj);
            });
    });

    app.get("/find/historias/validadas/:idProyecto", function(req, res){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto),
            "terminada": true,
            "revisada": true})
            .exec(function(err, obj){
                res.json(obj);
            });
    });



    io.on('connect', function (socket) {
        socket.emit('sendHistorias');

        socket.on('newHistoria', function (data) {
            var historiaNueva = new HistoriaUsuario(data);
            historiaNueva.terminada = false;
            historiaNueva.revisada = false;
            historiaNueva.save(function (err, obj) {
                if (obj) {
                    io.emit('sendHistoria')
                }
            });
        });

        socket.on('updateHistoria', function (data, idDesarrollador) {
            HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(data)},
                {$set:{"desarrollador": mongoose.Types.ObjectId(idDesarrollador)}},
                function (err) {
                    if (err) {
                        err();
                    }
                    io.emit('updateHistorias');
                });
        });

        socket.on('finalizarHistoria', function (data) {
            HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(data)},
                {$set:{"terminada": true}},
                function (err) {
                    if (err) {
                        err();
                    }
                    io.emit('updateHistorias');
                });
        });

        socket.on('validarHistoria', function (data) {
            HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(data)},
                {$set:{"revisada": true}},
                function (err) {
                    if (err) {
                        err();
                    }
                    io.emit('updateHistorias');
                });
        });

        socket.on('rechazarHistoria', function (data) {
            HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(data)},
                {$set:{"terminada": false}},
                function (err) {
                    if (err) {
                        err();
                    }
                    io.emit('updateHistorias');
                });
        });

    });
};

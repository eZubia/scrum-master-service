var Usuario = require('./../models/Usuario');
var Proyecto = require('./../models/Proyecto');
var Rol = require('./../models/roles');

module.exports = function (app, passport, roles, mongoose, io, isLoggedIn) {
    

    app.get("/getProyectos/dashboard/:idUsuario/:rol", function(req, response){
        Proyecto.find().elemMatch("participantes",{ "usuario": mongoose.Types.ObjectId(req.params.idUsuario), "rol": req.params.rol })
            .exec(function (err, proyectos) {
                if (proyectos.length !=0) {
                    Proyecto.populate(proyectos, {
                        path: 'participantes.usuario',
                        model: 'Usuario'
                    }, function (err, proyectos) {
                        return response.json(proyectos);
                    });
                } else {
                    return response.json("{}");
                }
            })
    });

    app.get("/detalleproyecto", isLoggedIn, function (req, response) {

        if (req.query.proyectoElegido === undefined) {
            req.query.proyectoElegido = sass.proyecto;
        }

        if(req.query.rolActual){
            req.session.rolActual = req.query.rolActual;
        } else {
            req.session.rolActual = sass.rolActual
        }
        Proyecto.findById({"_id": req.query.proyectoElegido}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                req.session.proyecto = req.query.proyectoElegido;
                sass = req.session;
                if (err) response.redirect("/home");
                else
                    var productOwner;
                var scrumMaster;
                var desarrolladores = [];
                obj.participantes.forEach(function (participante) {
                    switch (participante.rol) {
                        case "product-owner":
                            productOwner = participante.usuario;
                            break;
                        case "scrum-master":
                            scrumMaster = participante.usuario;
                            break;
                        case "developer":
                            desarrolladores.push(participante.usuario);
                            break;
                        default:

                    }
                });
                response.render("detalleProyecto",
                    {
                        usuario: req.user,
                        proyecto: obj,
                        scrumMaster: scrumMaster,
                        owner: productOwner,
                        rolActual:req.session.rolActual
                    });
            });
    });

    app.post("/finalizarProyecto", isLoggedIn, function (req, response) {

        if (req.query.proyectoElegido === undefined) {
            req.query.proyectoElegido = sass.proyecto;
        }
        Proyecto.update({"_id": req.body.proyectoElegido},
            {$set:{"abierto":false}}, function (err) {
                if (err) {
                    response.redirect("/home");
                } else {
                    response.redirect("/detalleProyecto");
                }
            });
    });

    app.get("/detalleProyecto/findDevelopers/:idProyecto", function (req, response) {
        Proyecto.findById({"_id": req.params.idProyecto}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                if (err) response.redirect("/home");
                else {
                    var desarrolladores = [];
                    obj.participantes.forEach(function (participante) {
                        if (participante.rol === "developer") {
                            desarrolladores.push(participante.usuario);
                        }
                    });
                    return response.json(desarrolladores);
                }
            });
    });

    app.get("/detalleProyecto/findOwner/:idProyecto", function (req, response) {
        Proyecto.findById({"_id": req.params.idProyecto}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                if (err) response.redirect("/home");
                else {
                    var productOwner = "";
                    obj.participantes.forEach(function (participante) {
                        if (participante.rol === "product-owner") {
                            productOwner = participante.usuario;
                        }
                    });
                    return response.json(productOwner);
                }
            });
    });

    app.post("/crearProyecto", function (req, res) {
        var rol = new Rol({
            rol: "scrum-master",
            usuario: req.user._id
        });
        var proyecto = new Proyecto({
            nombreProyecto: req.body.nombreProyecto,
            fechaSolicitud: Date(),
            fechaArranque: req.body.fechaArranque,
            descripcionProy: req.body.descripcionProy,
            abierto:true
        });
        proyecto.participantes.push(rol);
        //err tiene los errores que pueden pasar y obj el objeto a guardar.
        proyecto.save(function (err, obj) {
            if (err) res.redirect("/crear/proyecto", {obj: obj});
            else {
                message: req.flash('ProyectoGuardado')
                res.redirect("/home");
            }
        });

    });
    var sass;
    app.post("/agregarScrum", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "scrum-master",
            usuario: req.body.usuarioAsignado
        });
        Proyecto.update({_id: req.session.proyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                response.redirect("/agregarScrum");
            } else {
                response.redirect("/detalleProyecto");
            }
        });

    });

    app.post("/agregarOwner", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "product-owner",
            usuario: mongoose.Types.ObjectId(req.body.usuarioOwner)
        });
        Proyecto.update({_id: req.body.idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                throw err;
            } else {
                console.log("AAAA")
            }
        });
    });

    app.post("/agregarDesarrollador", isLoggedIn, function (req, response) {
        var rol = new Rol({
            rol: "developer",
            usuario: mongoose.Types.ObjectId(req.body.usuarioOwner)
        });
        Proyecto.update({"_id": req.body.idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                err();
            }
        });
    });

    app.get("/sprint/findDevelopers/:idProyecto", function (req, response) {
        Proyecto.findById({"_id": req.params.idProyecto}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                if (err) response.redirect("/showSprintBacklog");
                else {
                    var desarrolladores = [];
                    obj.participantes.forEach(function (participante) {
                        if (participante.rol === "developer") {
                            desarrolladores.push(participante.usuario);
                        }
                    });
                    return response.json(desarrolladores);
                }
            });
    });

    app.get("/resumenHistoriasDesarrollador", isLoggedIn, function(req, response){
        if(!req.session.proyecto){
            if(sass && sass.proyecto){
                req.session = sass;
            } else {
                response.redirect("/home");
            }

        }
        Proyecto.findById(req.session.proyecto)
            .exec(function (err, obj) {
                if (err) response.redirect("/home");
                else{
                    if(req.session.rolActual =='developer'){
                        response.render("resumenHistoriasDesarrollador",
                            {
                                usuario: req.user,
                                proyecto: obj,
                                rolActual: req.session.rolActual
                            });
                    } else {
                        response.redirect("/home");
                    }
                }
            });
    });

    app.get("/resumenHistoriasProductOwner", isLoggedIn, function(req, response){
        if(!req.session.proyecto){
            if(sass && sass.proyecto){
                req.session = sass;
            } else {
                response.redirect("/home");
            }
        }
        Proyecto.findById(req.session.proyecto)
            .exec(function (err, obj) {
                if (err) response.redirect("/home");
                else {
                    if(req.session.rolActual == 'product-owner'){
                        response.render("resumenHistoriasProductOwner",
                            {
                                usuario: req.user,
                                proyecto: obj,
                                rolActual: req.session.rolActual
                            });
                    } else {
                        response.redirect("/home");
                    }
                }
            });
    });

    io.on('connect', function (socket) {
        socket.emit('sendHistorias');



        socket.on('agregarOwner', function (id, idProyecto) {
            var rol = new Rol({
                rol: "product-owner",
                usuario: mongoose.Types.ObjectId(id)
            });
            Proyecto.update({_id: idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
                if (err) {
                    throw err;
                } else {
                    io.emit("updateProyecto");
                }
            });
        });

        socket.on('agregarDesarrollador', function (id, idProyecto) {
            var rol = new Rol({
                rol: "developer",
                usuario: mongoose.Types.ObjectId(id)
            });
            Proyecto.update({"_id": idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
                if (err) {
                    err();
                } else {
                    io.emit("updateProyecto")
                }
            });
        });



    });
};

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/ProductBacklog', {
        templateUrl: 'partials/productBacklog',
        controller: 'productBacklogCtrl'
      }).
      when('/ReleaseBacklog', {
        templateUrl: 'partials/releaseBacklog',
        controller: 'releaseBacklogCtrl'
      }).
      otherwise({
        redirectTo: '/ProductBacklog'
      });
}]);

app.controller('detalleProyectoCtrl', ['$scope', '$http', function($scope, $http){
    $scope.scrumMaster ={};
    $scope.productOwner = '';
    $scope.idProyecto={};
    $scope.desarrolladores = [];
    $scope.liberaciones = [];
    $scope.totalDias = 0;
    $scope.isOpen='';
    $scope.rolActual='';

    $scope.init = function(scrumMaster, idProyecto, isOpen, rolActual){
      $scope.scrumMaster =scrumMaster;
      $scope.idProyecto = idProyecto;
      $scope.getDesarrolladores();
      $scope.findReleaseByProyecto();
      $scope.getOwner();
      console.log($scope.productOwner)
      $scope.isOpen = isOpen;
      $scope.historiaSeleccionada="";
      $scope.rolActual = rolActual;
      console.log($scope.rolActual);
    }

    $scope.historia = new Object();
    $scope.crearHistoria = function () {
        $scope.historia.proyecto = $scope.idProyecto;
        socket.emit('newHistoria', $scope.historia);
    };

    var socket = io.connect({'forceNew': true});
    $scope.historias = $scope.historias || [];

    socket.on('sendHistorias', function (data) {
        $scope.findHistoriasByProyecto();
        $scope.getTotalDiasProyecto();
        $scope.$apply();
    });

    socket.on('updateRelease', function (data) {
        $scope.findReleaseByProyecto();
        $scope.$apply();
    });


    socket.on('sendHistoria', function () {
        $scope.findHistoriasByProyecto();
        $scope.getTotalDiasProyecto();
        $scope.$apply();
    });

    $scope.findHistoriasByProyecto = function(){
      $http.get('/find/historias/proyecto/'+$scope.idProyecto).success(function(data) {
            $scope.historias = data;
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.getTotalDiasProyecto = function(){
      $http.get('/count/dias/proyecto/'+$scope.idProyecto).success(function(dias){
        $scope.totalDias=dias;
      });
    }

    socket.on('updateHistorias', function (data) {
        $scope.findHistoriasByProyecto();
        $scope.getTotalDiasProyecto();
        $scope.$apply();
    });

    socket.on('updateProyecto', function (data) {
        $scope.getOwner();
        $scope.getDesarrolladores();
        $scope.$apply();
    });

    $scope.findReleaseByProyecto = function(){
      $http.get('/find/release/proyecto/'+$scope.idProyecto).success(function(data) {
            $scope.liberaciones = data;
            console.log("--------")
            console.log(data);
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.getNombreCompleto = function(obj){
      if(obj.google){
        return obj.google.name;
      } else if (obj.twitter){
        return obj.twitter.displayName;
      } else if (obj.facebook){
        return obj.facebook.name;
      }
      return obj.nombre;
    };
    $scope.usuarios =[];

    $scope.getUsuarios = function(){
      $http.get('findUsuarios').success(function(data) {
            $scope.usuarios = data;
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.verDetalleHistoria = function(idHistoria){
      $http.get("/findBy/historias/"+ idHistoria).success(function(data){
        $scope.historiaSeleccionada = data;
        console.log($scope.historiaSeleccionada);
      });
    };

    $scope.cerrarDetalle = function(){
      $scope.historiaSeleccionada="";
    };

    $scope.getDesarrolladores = function(){
      $http.get('/detalleProyecto/findDevelopers/'+$scope.idProyecto).success(function(data) {
            $scope.desarrolladores = data;
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.getOwner = function(){
      $http.get('/detalleProyecto/findOwner/'+$scope.idProyecto).success(function(data) {
            $scope.productOwner = data;
            console.log(data);
        }).error(function(data){
          //TODO:Error
          });
    };


    $scope.asignarOwner = function (id) {
        socket.emit('agregarOwner', id, $scope.idProyecto);
    };

  $scope.asignarDesarrollador = function (id) {
      socket.emit('agregarDesarrollador', id, $scope.idProyecto);
  };

}]);

app.controller('productBacklogCtrl',['$scope', function($scope){
  $scope.mensaje = "aszdxfhgndfxcbsxzcvx";
  $scope.titulo = "Titulo 1";
}]);

app.controller('releaseBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasSprint = [];
  $scope.release = {}
  $scope.historiaSeleccionada = "";

  $scope.init = function(idProy, historias){
    $scope.idProyecto = idProy;
    $scope.historias = historias;
    console.log("Nombre Release");
    console.log($scope.release.nombreRelease);
    console.log($scope.release.descripcionRelease);

  };

  $scope.agregarHistoriaSprint = function(idHistoria){
    var i =0;
    for(i = 0; i<$scope.historias.length;i++){
      if($scope.historias[i]._id === idHistoria){
          $scope.historiasSprint.push($scope.historias[i]);
          break;
      }
    };
    $scope.historias.splice(i,1);
  };

  $scope.crearRelease = function(){
    $scope.release.proyecto = $scope.idProyecto
    $http({
      url:'/crearRelease',
      method:'POST',
      data: {historias:$scope.historiasSprint,
      release:$scope.release}
    }).then(function(data){
      $window.location.href = "/detalleProyecto";
    }, function(data){
      $window.location.href = "/addReleaseBacklog";
    });
  };
  var socket = io.connect({'forceNew': true});
  $scope.crearRelease = function(){
    $scope.release.proyecto = $scope.idProyecto
    socket.emit("newRelease", $scope.historiasSprint, $scope.release);
    $window.location.href = "/detalleProyecto";
    //$http({
    //  url:'/crearRelease',
    //  method:'POST',
    //  data: {historias:$scope.historiasSprint,
    //  release:$scope.release}
    //}).then(function(data){
    //  $window.location.href = "/detalleProyecto";
    //}, function(data){
    //  $window.location.href = "/addReleaseBacklog";
    //});
  };

  $scope.verDetalleHistoria = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.cerrarDetalle = function(){
    $scope.historiaSeleccionada="";
  };

}]);

app.controller("resumenHistoriasDesarrollador", ['$scope','$http', function($scope, $http){
  $scope.historiasDesarrollador = [];
  $scope.historiasRevisadas = [];
  $scope.idProyecto = "";
  $scope.idDesarrollador = "";
  $scope.historiaSeleccionada="";

  $scope.init = function(idProyecto, idDesarrollador){
    $scope.idProyecto = idProyecto;
    $scope.idDesarrollador = idDesarrollador;
    $scope.findHistoriasByDesarrollador();
    $scope.findHistoriasByRevisadas();
  };

  $scope.findHistoriasByDesarrollador = function(){
    $http.get("/find/historias/asignadas/"+ $scope.idProyecto +"/"+ $scope.idDesarrollador).success(function(data){
      $scope.historiasDesarrollador = data;
      console.log("Historias sin desarrollador");
      console.log(data);
    });
  }

  $scope.findHistoriasByRevisadas = function(){
    $http.get("/find/historias/asignadas/revisadas/" + $scope.idProyecto +"/"+ $scope.idDesarrollador).success(function(data){
      $scope.historiasRevisadas = data;
    });
  }

  $scope.verDetalleHistoria = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.finalizarTarjeta = function (idDesarrollador) {
      socket.emit('finalizarHistoria', $scope.historiaSeleccionada._id);
      $scope.historiaSeleccionada="";
  };

  var socket = io.connect({'forceNew': true});

  socket.on('updateHistorias', function (data) {
      $scope.findHistoriasByDesarrollador();
      $scope.findHistoriasByRevisadas();
      $scope.$apply();
  });

  $scope.cerrarDetalle = function(){
    $scope.historiaSeleccionada="";
  };

}]);

app.controller("resumenHistoriasProductOwner", ['$scope','$http', function($scope, $http){
  $scope.historiasPorValidar = [];
  $scope.historiasValidadas = [];
  $scope.idProyecto = "";
  $scope.historiaSeleccionada="";

  $scope.init = function(idProyecto){
    $scope.idProyecto = idProyecto;
    $scope.findHistoriasPorValidar();
    $scope.findHistoriasValidadas();
  };

  var socket = io.connect({'forceNew': true});

  socket.on('updateHistorias', function (data) {
      $scope.findHistoriasPorValidar();
      $scope.findHistoriasValidadas();
      $scope.$apply();
  });

  $scope.findHistoriasPorValidar = function(){
    $http.get("/find/historias/porValidar/"+ $scope.idProyecto).success(function(data){
      $scope.historiasPorValidar = data;
      console.log("Historias por validar");
      console.log(data);
    });
  }

  $scope.findHistoriasValidadas = function(){
    $http.get("/find/historias/validadas/" + $scope.idProyecto).success(function(data){
      $scope.historiasValidadas = data;
    });
  }

  $scope.verDetalleHistoria = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.cerrarDetalle = function(){
    $scope.historiaSeleccionada="";
  };

  $scope.validarTarjeta = function (idDesarrollador) {
      socket.emit('validarHistoria', $scope.historiaSeleccionada._id);
      $scope.historiaSeleccionada="";
  };

  $scope.rechazarTarjeta = function (idDesarrollador) {
      socket.emit('rechazarHistoria', $scope.historiaSeleccionada._id);
      $scope.historiaSeleccionada="";
  };

}]);

app.controller('showReleaseBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasSprint = [];
  $scope.sprint = {}
  $scope.historiaSeleccionada="";
  $scope.totalDias=0;
  $scope.isOpen='';
  $scope.rolActual = "";
  var socket = io.connect({'forceNew': true});

  $scope.init = function(idProy, idRelease, isOpen, rolActual){
    $scope.idProyecto = idProy;
    $scope.idRelease = idRelease;
    $scope.findHistoriasByRelease();
    $scope.findSprintsByRelease();
    $scope.getTotalDiasRelease();
    $scope.isOpen = isOpen;
    $scope.rolActual = rolActual;
    $scope.historiasSprint = [];
    console.log($scope.isOpen)
  };

  $scope.agregarHistoriaSprint = function(idHistoria){
    var i =0;
    for(i = 0; i<$scope.historias.length;i++){
      if($scope.historias[i]._id === idHistoria){
          $scope.historiasSprint.push($scope.historias[i]);
          break;
      }
    };
    $scope.historias.splice(i,1);
  };

  socket.on('updateHistorias', function (data) {
      $scope.findHistoriasByRelease();
      $scope.getTotalDiasRelease();
      $scope.$apply();
  });

  socket.on('updateSprints', function (data) {
      $scope.findHistoriasByRelease();
      $scope.findSprintsByRelease();
      $scope.getTotalDiasRelease();
      $scope.$apply();
  });

  $scope.findHistoriasByRelease = function(){
    $http.get("/find/historias/release/"+$scope.idRelease).success(function(data){
      $scope.historias = data;
    });
  }

  $scope.getTotalDiasRelease = function(){
    $http.get('/count/dias/release/'+$scope.idRelease).success(function(dias){
      $scope.totalDias=dias;
    });
  }

  $scope.findSprintsByRelease = function(){
    $http.get("/find/sprints/release/"+$scope.idRelease).success(function(data){
      $scope.sprints = data;
    });
  }

  $scope.crearSprint = function(){
    $scope.sprint.liberacionBacklog = $scope.idRelease;
    socket.emit("newSprint", $scope.historiasSprint, $scope.sprint);
    $scope.historiasSprint = [];
    //$http({
    //  url:'/crearSprint',
    //  method:'POST',
    //  data: {historias:$scope.historiasSprint,
    //  sprint:$scope.sprint}
    //}).then(function(data){
  //    $window.location.href = "/showReleaseBacklog";
    //}, function(data){
    //  $window.location.href = "/showReleaseBacklog";
    //});
  };

  $scope.verDetalleHistoria = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.cerrarDetalle = function(){
    $scope.historiaSeleccionada="";
  };

}]);

app.controller('showSprintBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasDesarrollador = [];
  $scope.historias = [];
  $scope.sprint = {};
  $scope.historiaSeleccionada="";
  $scope.isOpen = "";

  $scope.init = function(idProy, idSprint, isOpen, rolActual){
    $scope.idProyecto = idProy;
    $scope.idSprint = idSprint;
    $scope.findHistoriasBySprint();
    $scope.findHistoriasBySprintDesarrollador();
    $scope.getTotalDiasSprint();
    $scope.isOpen = isOpen;
    $scope.rolActual = rolActual;
  };

  $scope.asignarTarjeta = function (idDesarrollador) {
      if($scope.historiaSeleccionada !=-""){
        $scope.historiaSeleccionada.desarrollador = idDesarrollador;
        socket.emit('updateHistoria', $scope.historiaSeleccionada._id, idDesarrollador);
      } else {
        //TODO:Se tiene que seleccionar primero una historia.
        console.log("No se ha seleccionado una historia aún");
      }
  };

  var socket = io.connect({'forceNew': true});

  socket.on('updateHistorias', function (data) {
      $scope.findHistoriasBySprint();
      $scope.findHistoriasBySprintDesarrollador();
      $scope.getTotalDiasSprint();
      $scope.$apply();
  });

  $scope.getTotalDiasSprint = function(){
    $http.get('/count/dias/sprint/'+$scope.idSprint).success(function(dias){
      $scope.totalDias=dias;
    });
  };

  $scope.agregarDesarrollador = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.getNombreCompleto = function(obj){
    if(obj.google && obj.google.name){
      return obj.google.name;
    } else if (obj.twitter && obj.twitter.displayName){
      return obj.twitter.displayName;
    } else if (obj.facebook && obj.facebook.name){
      return obj.facebook.name;
    }
    return obj.nombre;
  };

  $scope.findHistoriasBySprint = function(){
    $http.get("/find/historias/sprint/"+$scope.idSprint).success(function(data){
      $scope.historias = data;
    });
  };

  $scope.findHistoriasBySprintDesarrollador = function(){
    $http.get("/find/historias/sprint/desarrollador/"+$scope.idSprint).success(function(data){
      $scope.historiasDesarrollador = data;
    });
  };

  $scope.findDesarrolladoresByProyecto = function(){
    $http.get("/sprint/findDevelopers/" + $scope.idProyecto).success(function(data){
      console.log($scope.idProyecto);
      $scope.desarrolladores = data;
    });
  };

  $scope.cerrarDetalle = function(){
    $scope.historiaSeleccionada="";
  };

}]);

app.controller('profileCtrl', ['$scope', '$http', function($scope, $http){

    $scope.skills = $scope.skills || [];
    $scope.init= function(skillz){
        $scope.skills = skillz;
    }
    $scope.removeSkill = function(index){
        $scope.skills.splice(index, 1);
    }
    $scope.agregarHabilidad = function(){
        var skill = {
            habilidad: $scope.user.habilidad,
            nivel: $scope.user.nivel
        };
        $scope.skills.push(skill);
        $scope.user.habilidad = '';
        $scope.user.nivel = '';
    }

}]);

app.controller("dashBoardController", ['$scope', '$http', function($scope, $http){

  $scope.idUsuario = "";
  $scope.proyectos = [];
  $scope.totalScrum = 0;
  $scope.totalOwner = 0;
  $scope.totalDeveloper = 0;
  $scope.rolActual="";
  $scope.init = function(usuario){
    $scope.idUsuario = usuario;
  }

  $scope.getProyectosScrum = function(){
    $scope.rolActual = "scrum-master";
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"scrum-master").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosOwner = function(){
    $scope.rolActual = "product-owner";
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"product-owner").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosDeveloper = function(){
    $scope.rolActual = "developer";
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"developer").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }
}]);

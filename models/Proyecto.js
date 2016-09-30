var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Usuario = mongoose.model('Usuario');

var proyectoSchema = new Schema({
    nombreProyecto:{type:String, required:true},
    fechaSolicitud:{type:Date, required:true},
    fechaArranque:{type:Date, required:true},
    descripcionProy:{type:String, required:true},
    participantes:{type: Array, "default":[]},
    abierto:{type:Boolean, required:true}
});

proyectoSchema.virtual("prettyDate").get(function(){
  var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
  return this.fechaArranque.getDate()+"/"+ monthNames[this.fechaArranque.getMonth()]+"/"+this.fechaArranque.getFullYear();
});

proyectoSchema.virtual("prettyDateSolicitud").get(function(){
  var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
  return this.fechaArranque.getDate()+"/"+ monthNames[this.fechaArranque.getMonth()]+"/"+this.fechaArranque.getFullYear();
});
var Proyecto = mongoose.model("Proyecto", proyectoSchema);
module.exports = Proyecto;

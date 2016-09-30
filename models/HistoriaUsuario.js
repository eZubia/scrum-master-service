var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LiberacionBacklog = mongoose.model('LiberacionBacklog');
var Sprint = mongoose.model('Sprint');
var Proyecto = mongoose.model('Proyecto');
var Usuario = mongoose.model('Usuario');

var historiaUsuarioSchema = new Schema({
    nombre:{type:String, required:true},
    descripcion:{type:String, required:true},
    cuando:{type:String, required:true},
    entonces:{type:String, required:true},
    como:{type:String, required:true},
    quiero:{type:String, required:true},
    deTalManeraQue:{type:String, required:true},
    prioridad:{type:Number, required:true},
    tamanio:{type:Number, required:true},
    liberacionBacklog:{type: Schema.ObjectId, ref: "LiberacionBacklog"},
    sprint:{type: Schema.ObjectId, ref: "Sprint"},
    proyecto:{type: Schema.ObjectId, ref: "Proyecto", required: true},
    desarrollador:{type: Schema.ObjectId, ref:"Usuario"},
    terminada:{type: Boolean, required:true},
    revisada:{type: Boolean, required:true}
});

var HistoriaUsuario = mongoose.model("HistoriaUsuario", historiaUsuarioSchema);
module.exports = HistoriaUsuario;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Proyecto = mongoose.model('Proyecto');
var HistoriaUsuario = mongoose.model('HistoriaUsuario');

var backlogSchema = new Schema({
    proyecto:{type: Schema.ObjectId, ref: "Proyecto"},
    duracion:{type:Number, required:true},
    historias:[{type: Schema.ObjectId, ref: "HistoriaUsuario"}]
});

var Backlog = mongoose.model("Backlog", backlogSchema);
module.exports.Backlog = Backlog;

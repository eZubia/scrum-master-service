var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/byb_system');
var Schema = mongoose.Schema;

var habilidadSchema = new Schema({
    descripcion:{type:String, required:true},
    rango:{type:String, enum:['Junior','Senior','Master']}
});

var Habilidad = mongoose.model("Habilidad", habilidadSchema);
module.exports.Habilidad = Habilidad;

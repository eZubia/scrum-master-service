var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Usuario = mongoose.model('Usuario');

var rolSchema = new Schema({
    rol:{type:String, required:true},
    usuario:{type: Schema.ObjectId, ref:"Usuario"}
});

var Rol = mongoose.model("Rol", rolSchema);
module.exports = Rol;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LiberacionBacklog = mongoose.model('LiberacionBacklog');

var sprintSchema = new Schema({
    liberacionBacklog:{type: Schema.ObjectId, ref: "LiberacionBacklog"},
    finalizo:{type:Boolean, required:true},
    fechaFinal:{type: Date, required:true},
    nombreSprint:{type:String, required:true},
    descripcionSprint:{type:String, required:true}
});

var Sprint = mongoose.model("Sprint", sprintSchema);
module.exports = Sprint;

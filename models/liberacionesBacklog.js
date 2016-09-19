var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Proyecto = mongoose.model('Proyecto');

var liberacionBacklogSchema = new Schema({
    proyecto:{type: Schema.ObjectId, ref: "Proyecto", required: true},
    finalizo:{type:Boolean, required:true},
    fechaFinalizacion:[{type: Date, required:true}],
    descripcionRelease:{type:String, required:true},
    nombreRelease:{type:String, required:true}
});

var LiberacionBacklog = mongoose.model("LiberacionBacklog", liberacionBacklogSchema);
module.exports = LiberacionBacklog;

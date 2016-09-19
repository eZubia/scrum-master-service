var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Proyecto = mongoose.model('Proyecto');

var productBacklogSchema = new Schema({
    proyecto:{type: Schema.ObjectId, ref: "Proyecto"},
});

var ProductBacklog = mongoose.model("ProductBacklog", productBacklogSchema);
module.exports.ProductBacklog = ProductBacklog;

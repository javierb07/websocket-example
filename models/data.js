var mongoose = require("mongoose");

// Define schemas
var entrySchema = new mongoose.Schema({
    entry: Array
});
var dataSchema = new mongoose.Schema({
    state: Boolean,
    imu: [Array]

});

module.exports = mongoose.model("Entry", entrySchema);
module.exports = mongoose.model("Data", dataSchema);
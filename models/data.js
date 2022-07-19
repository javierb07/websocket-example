var mongoose = require("mongoose");

// Define schemas
var dataSchema = new mongoose.Schema({
    state: Boolean,
    imu: [Array]

});

module.exports = mongoose.model("Data", dataSchema);
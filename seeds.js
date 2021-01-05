var mongoose = require("mongoose");
var Data = require("./models/data");

var data = [
    {
        state: false
    }
]

function seedDB(){
   //Remove all devices
   Data.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Removed all data!");
        // Add a few devices
        data.forEach(function(seed){
            Data.create(seed, function(err, device){
                if(err){
                    console.log(err)
                } else {
                    console.log("Added data");
                }
            });
        });
    }); 
}

module.exports = seedDB;
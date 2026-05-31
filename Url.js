const mongoose = require('mongoose');


const urlSchema = new mongoose.Schema({
    originalUrl: { 
        type: String, 
        required: true 
    },
    shortId: { 
        type: String, 
        required: true 
    },
    clicks: { 
        type: Number, 
        required: true, 
        default: 0 
    }
});


module.exports = mongoose.model('Url', urlSchema);
const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },    
    refreshToken: { 
        type: String, 
        required: true, 
        trim: true 
    }
}, { timestamps: true });


// Add TTL index on the 'createdAt' field to expire documents after 30 days
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Token', TokenSchema);

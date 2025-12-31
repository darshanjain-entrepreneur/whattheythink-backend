const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    messageText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
    // NOTE: No senderId field - messages are strictly anonymous
}, {
    timestamps: true
});

// Index for efficient inbox queries
messageSchema.index({ receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

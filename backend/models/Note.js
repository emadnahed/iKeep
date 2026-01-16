const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotesSchema = new Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        index: true
    },

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,

    },
    tag: {
        type: String,
        default: "General",
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient user + date queries (common pattern for fetching recent notes)
NotesSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("notes", NotesSchema)
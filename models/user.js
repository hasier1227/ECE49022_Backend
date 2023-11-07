const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        description: "Users name",
        type: String,
        example: "Alfalfa",
        required: true
    },
    faceRec: {
        description: "Object ID to Facial Recognition DB Entry",
        type: mongoose.Schema.Types.ObjectId
    }
})

module.exports = mongoose.model('User', userSchema)
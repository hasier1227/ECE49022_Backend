const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String
})

const faceRecSchema = new mongoose.Schema({
    images: [imageSchema]
})

module.exports = mongoose.model('FaceRec', faceRecSchema)
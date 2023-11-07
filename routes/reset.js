// Here we are importing the Express library and creating an instance of a Router object from it
// Router objects are used to define the routing for the applications HTTP requests 
const express = require('express')
const reset_router = express.Router()

// Here we are importing the needed models for this endpoint
// Models represent collections in the database. They define the structure of the documents in the collection and provide an 
//      interface for querying, saving, updating, and deleting documents within the database error
const FaceRec   = require('../models/faceRec')
const User      = require('../models/user')

// Here we define the routes for this endpoint
// This DELETE: Reset the database to a system default state.
//      Responses defined as follows:
//          - 200: Registry is reset.
reset_router.delete('/', async (req,res) => {
    // Cleanse database of everything that could be possibly saved
    await Promise.all([
        FaceRec.deleteMany({}),
        User.deleteMany({}),
    ]);

    res.status(200).json({ message: 'Registry is reset.' })
})

// Export the router as a module so other files can use it
module.exports = reset_router

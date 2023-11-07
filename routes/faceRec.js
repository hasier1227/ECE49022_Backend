// Here we are importing the Express library and creating an instance of a Router object from it
// Router objects are used to define the routing for the applications HTTP requests 
const express = require('express')
const faceRec_router = express.Router()

// Import in needed libraries
const multer = require('multer')

// Here we are importing the needed models for this endpoint
// Models represent collections in the database. They define the structure of the documents in the collection and provide an 
//      interface for querying, saving, updating, and deleting documents within the database error
const User      = require('../models/user')
const FaceRec   = require('../models/faceRec')

// Configure Multer to store binary data in memory
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// This POST: Creates new entry for users facial recognition data and connects to users DB entry. 
//      The req.params will contain the name of the user
//          - Can access by req.params.name
//      The req.files will contain array of image files
//      Responses defined as follows:
//          - 201: Entry created.
//          - 400: Bad user input.
//          - 404: User not found.
//          - 409: Face rec files already exist for this user.
//          - 500: Unknown server error.
faceRec_router.post('/:name', upload.array('image', 1), async (req,res) => {
    // Find user we are adding this to
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
        }
        else {
            // If user does exist, check if they already have face rec setup
            if(currUser.faceRec !== undefined) {
                res.locals.data = { message: "User already has face rec set up." }
                res.status(409).json(res.locals.data)
                doesExist = false
            }
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
        doesExist = false
    }

    if(doesExist) {
        // Validate input 
        const fileArray = req.files
        let isValid = true
        if(!fileArray || fileArray.length === 0) {
            res.locals.status = { message: "No images uploaded." }
            res.status(400).json(res.locals.status)
            isValid = false
        }

        if(isValid) {
            try {
                // Loop through images uploaded and load them into array of imageSchema types
                let imageArray = []
                for(const file of fileArray) {
                    imageArray.push({
                        data: file.buffer,
                        contentType: file.mimetype
                    })
                }

                // Create face rec entry
                const newFaceRecSchema = new FaceRec({
                    images: imageArray,
                });

                await newFaceRecSchema.save()

                // Connect new face rec entry to user entry 
                currUser.faceRec = newFaceRecSchema._id
                await currUser.save()

                res.status(201).json(newFaceRecSchema)
            } 
            catch (err) {
                console.error(err);
                res.locals.data = { message: "Unknown error in creating face rec entry." };
                res.status(500).json(res.locals.data);
            }
        }
    }
})

// This PUT: Adds image to face rec entry.
//      The req.params will contain the name of the user
//          - Can access by req.params.name
//      The req.files will contain array of image files
//      Responses defined as follows:
//          - 201: Entry created.
//          - 400: Bad user input.
//          - 404: User not found.
//          - 409: Face rec files already exist for this user.
//          - 500: Unknown server error.
faceRec_router.put('/:name', upload.array('image', 1), async (req,res) => {
    // Find user we are adding this to
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
        }
        else {
            // If user does exist, check if they already have face rec setup
            if(currUser.faceRec === undefined) {
                res.locals.data = { message: "User already has face rec set up." }
                res.status(409).json(res.locals.data)
                doesExist = false
            }
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
        doesExist = false
    }

    if(doesExist) {
        // Validate input 
        const fileArray = req.files
        let isValid = true
        if(!fileArray || fileArray.length === 0) {
            res.locals.status = { message: "No images uploaded." }
            res.status(400).json(res.locals.status)
            isValid = false
        }

        if(isValid) {
            try {
                let imageArray = []

                // Get face rec entry 
                if((currFaceRec = await FaceRec.findById(currUser.faceRec)) === null) {
                    res.locals.data = { message: "Face Rec entry could not be found." }
                    res.status(404).json(res.locals.data)
                }
                else {
                    // Extract array 
                    imageArray = currFaceRec.images

                    // Check if we have reached 6 images yet
                    if(imageArray.length === 6) {
                        res.locals.data = { message: "Array is full." }
                        res.status(403).json(res.locals.data)
                    }
                    else {
                        // Add image to array
                        for(const file of fileArray) {
                            imageArray.push({
                                data: file.buffer,
                                contentType: file.mimetype
                            })
                        }

                        // Update entry, save, and respond
                        currFaceRec.imageArray = imageArray

                        await currFaceRec.save()

                        res.status(200).json(currFaceRec) 
                    }
                }
            } 
            catch (err) {
                console.error(err);
                res.locals.data = { message: "Unknown error in creating face rec entry." };
                res.status(500).json(res.locals.data);
            }
        }
    }
})

// This GET: Gets users facial data entry. 
//      The req.params will contain the name of user
//          - Can access by req.params.name
//      Responses defined as follows:
//          - 200: Images found. 
//              - Return type is of array of imageSchema type 
//          - 404: Images not found.
//          - 500: Unknown server error.
faceRec_router.get('/:name', async (req,res) => {
    // Find user we are adding this to
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
        }
        else {
            // If user does exist, check if they already have face rec setup
            if(currUser.faceRec === undefined) {
                res.locals.data = { message: "User has not set up face rec." }
                res.status(404).json(res.locals.data)
                doesExist = false
            }
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
        doesExist = false
    }

    if(doesExist) {
        // Find face rec entry 
        if((currFaceRec = await FaceRec.findById(currUser.faceRec)) === null) {
            res.locals.data = { message: "Face Rec entry could not be found." }
            res.status(404).json(res.locals.data)
        }
        else {
            res.status(200).json(currFaceRec)
        }
    }
})

// This DELETE: Deletes users facial data entry. 
//      The req.params will contain the name of the user
//          - Can access by req.params.name
//      Responses defined as follows:
//          - 200: Entry deleted. 
//          - 404: Entry not found.
//          - 500: Unknown server error.
faceRec_router.delete('/:name', async (req,res) => {
    // Find user we are adding this to
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
        }
        else {
            // If user does exist, check if they already have face rec setup
            if(currUser.faceRec === undefined) {
                res.locals.data = { message: "User has not set up face rec." }
                res.status(200).json(res.locals.data)
                doesExist = false
            }
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
        doesExist = false
    }

    if(doesExist) {
        try {
            // Find and delete face rec entry in DB
            await FaceRec.findByIdAndDelete(currUser.faceRec)

            // Update User entry
            currUser.faceRec = undefined
            await currUser.save()

            res.locals.data = { message: "Entry deleted." }
            res.status(200).json(res.locals.data)
        }
        catch {
            res.locals.data = { message: "Could not delete Face Rec entry." }
            res.status(500).json(res.locals.data)
        }
    }
})


// Export the router as a module so other files can use it
module.exports = faceRec_router
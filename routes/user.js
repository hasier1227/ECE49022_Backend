// Here we are importing the Express library and creating an instance of a Router object from it
// Router objects are used to define the routing for the applications HTTP requests 
const express = require('express')
const user_router = express.Router()

// Here we are importing the needed models for this endpoint
// Models represent collections in the database. They define the structure of the documents in the collection and provide an 
//      interface for querying, saving, updating, and deleting documents within the database error
const User      = require('../models/user')
const faceRec   = require('../models/faceRec')

// Here we define the routes for this endpoint

// This POST: Create new user 
//      The req.body will contain users name and password.
//      Responses defined as follows:
//          - 201: User created.
//              - Return type is of User Schema
//          - 400: Bad user input.
//          - 409: User exists already.
//          - 500: Unknown server error.
user_router.post('/', async (req,res) => {
    // Ensure user does not exist already 
    doesNotExist = true
    try {
        // Check if user exists
        if(currUser = await User.findOne({ name: req.body.name })) {
            res.locals.data = { message: "User with this name already exists." }
            res.status(409).json(res.locals.data)
            doesNotExist = false       
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in searching database for users." }
        res.status(500).json(res.locals.data)
        doesNotExist = false
    }

    if(doesNotExist) {
        // Check if input is good 
        if(req.body.name === undefined) {
            res.locals.data = { message: "Bad user input." }
            res.status(400).json(res.locals.data)
        }
        else {
            // Create new user entry with default values 
            const newUserSchema = new User({
                name: req.body.name
            })

            await newUserSchema.save()

            res.status(201).json(newUserSchema)
        }
    }
})

// This DELETE: Removes user.
//      The req.params will contain the name of the user
//          - Can access by req.params.name
//      Responses defined as follows:
//          - 200: User deleted. 
//          - 404: User not found.
//          - 500: Unknown server error.
user_router.delete('/:name', async (req,res) => {
    // Find user
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
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
            // Check if user has associated faceRec entry
            if(currUser.faceRec !== undefined) {
                await faceRec.findByIdAndDelete(currUser.faceRec)
            }

            // Delete user 
            await User.findByIdAndDelete(currUser._id)

            // Respond
            res.locals.data = { message: "User deleted." }
            res.status(200).json(res.locals.data)
        }
        catch (err) {
            console.error(err)
            res.locals.data = { message: "Unknown error in deleting user." }
            res.status(500).json(res.locals.data)
        }
    }
})

// This GET: Retrieves users entry. 
//      The req.params will contain the name of the user. 
//          - Can access by req.params.name
//      Responses defined as follows:
//          - 200: User found.
//          - 404: User not found.
//          - 500: Unknown server error.
user_router.get('/:name', async (req,res) => {
    // Find user 
    let doesExist = true

    try {
        // Check if user exists
        if((currUser = await User.findOne({ name: req.params.name })) === null) {
            res.locals.data = { message: "User does not exist." }
            res.status(404).json(res.locals.data)
            doesExist = false       
        }
    }
    catch (err) { // Case for unknown server error
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
        doesExist = false
    }

    if(doesExist) {
        // Return user to frontend
        res.status(200).json(currUser)
    }
})

// This GET: Retrieves all users and returns array of names. 
//      Responses defined as follows:
//          - 200: User found.
//          - 404: User not found.
//          - 500: Unknown server error.
user_router.get('/', async (req,res) => {
    // Query DB for all users
    try {
        if((users = await User.find({ })) === null) {
            res.locals.data = { message: "No users in DB." }
            res.status(404).json(res.locals.data)
        }
        else {
            users_names = []

            for (const currUser of users) {
                users_names.push(currUser.name)
            }

            res.status(200).json(users_names)
        }
    }
    catch (err) {
        console.error(err)
        res.locals.data = { message: "Unknown error in finding user." }
        res.status(500).json(res.locals.data)
    }
})

// Export the router as a module so other files can use it
module.exports = user_router
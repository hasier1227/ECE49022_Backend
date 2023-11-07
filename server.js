const express = require('express')
const app = express()
const mongoose = require('mongoose')

// Here, we specify what database we want to use. This has no bearing on endpoints. In this case, the database is "packages"
// Mongoose handles the creation of the db if it does not exist
// The data will persist in the database even if this server is ever terminated
const url = `mongodb+srv://team39:123456!@cluster0.hnp2qhc.mongodb.net/?retryWrites=true&w=majority`;

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

// Configure express to use json format 
app.use(express.json())

// Here we define:
//      routers     - these define the HTTP requests handling (GET, POST, DELETE, etc.) and further endpoints from the specified endpoint
//      endpoints   - these are how the user connects to certain services. Ex. http://localhost:3000/user connects to the user endpoint
const faceRecRouter = require('./routes/faceRec')
app.use('/faceRec', faceRecRouter)

const resetRouter = require('./routes/reset')
app.use('/reset', resetRouter)

const userRouter = require('./routes/user')
app.use('/user', userRouter)

// Here we essentially "start" the server by having it listen on the port specified. Here, we use port 3000 which is a port commonly used for development. 
// For our purposes, this port should be fine because the ports aren't being used by anyone but us.
// Ports are 16-bit so they can be [0,65535] 
// Ports [0,1023] are reserved for well-known services like 22 for SSH, 80 for HTTP, etc.
app.listen(3000, () => console.log('Server started'))
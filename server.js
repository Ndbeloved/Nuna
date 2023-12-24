const express = require('express')
const os = require('os')
const dotenv = require('dotenv').config()
const dbConnector = require('./dbconnector');


//routes handling
const cbtRoute = require('./routes/cbtExamRoute')

let PORT = process.env.PORT || 5000
let app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));//needed for the passing of request body

//middleware for routing
app.use('/cbt-exam', cbtRoute)



//handles 404's
app.use((req, res)=>{
    res.send('page not found').status(404)
})

dbConnector(app, PORT, os);
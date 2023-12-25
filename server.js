const express = require('express')
const os = require('os')
const dotenv = require('dotenv').config()
const dbConnector = require('./dbconnector');

let PORT = process.env.PORT || 5000
let app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));//needed for the passing of request body

//Models
const QuestionModel = require('./models/QuestionsModel')


//routes handling
const cbtRoute = require('./routes/cbtExamRoute')



//middleware for routing
app.use('/cbt-exam', cbtRoute)



//handles 404's
app.use((req, res)=>{
    res.send('page not found').status(404)
})

dbConnector(app, PORT, os);
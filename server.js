const express = require('express')
const os = require('os')
const dotenv = require('dotenv').config()
const dbConnector = require('./dbconnector');
const cors = require('cors');

let PORT = process.env.PORT || 5000
let app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));//needed for the passing of request body
app.use(cors({
    origin: process.env.ALLOWED_HOST,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//Models
const QuestionModel = require('./models/QuestionsModel')


//routes handling
const cbtRoute = require('./routes/cbtExamRoute')
const adminRoute = require('./routes/adminRoute')



//middleware for routing
app.use('/cbt-exam', cbtRoute)
app.use('/official', adminRoute)


//handles 404's
app.use((req, res)=>{
    res.send('page not found').status(404)
})

dbConnector(app, PORT, os);
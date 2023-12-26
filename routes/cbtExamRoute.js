const express =  require('express')
const router = express.Router()

//Models
const QuestionModel = require('../models/QuestionsModel')

router.get('/', async(req, res)=>{
    try{
        const questions = await QuestionModel.find({course: "Bio"})
        res.send(questions)
    }catch(err){
        console.log(err)
        res.status(500).json({"status":500, "message": "error while trying to fetch questions"})
    }
})

router.post('/create', async(req, res)=>{
    try{
        const {course, que, optA, optB, optC, optD} = req.body
        const newQuestion = new QuestionModel({
            course: course,
            que: que,
            optA: optA,
            optB: optB,
            optC: optC,
            optD: optD
        })
        await newQuestion.save()
        res.status(200).json({"status": 200, "message": "saved question successfully"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "error saving course"})
    }
})

module.exports = router
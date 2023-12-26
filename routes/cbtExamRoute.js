const express =  require('express')
const router = express.Router()

//Models
const QuestionModel = require('../models/QuestionsModel')
const RegisteredCoursesModel = require('../models/RegisteredModels')



//grab questions
router.get('/', async(req, res)=>{
    //shuffle questions
    function shuffleQuestions(array){
        for(let i = array.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        };
        //strip out first 20 questions, depends on how many questions per test
        return array
    }

    try{
        const course = "CSC201"
        const questions = await QuestionModel.find({course: course})
        
        res.send(shuffleQuestions(questions))
    }catch(err){
        console.log(err)
        res.status(500).json({"status":500, "message": "error while trying to fetch questions"})
    }
})

//Create new questions
router.post('/create', async(req, res)=>{
    try{
        const {course, que, optA, optB, optC, optD} = req.body
        const isCourseRegistered = await RegisteredCoursesModel.find({name: course})
        console.log(isCourseRegistered ,course);
        if(isCourseRegistered.length <= 0){
            const RegisterCourse = new RegisteredCoursesModel({
                name: course,
            })
            await RegisterCourse.save();
            //res.status(200).json({"status": 200, "message": "registered course"})
        }
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
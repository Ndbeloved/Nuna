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
        const inProgress = await RegisteredCoursesModel.find({name: course});
        if(inProgress.length <= 0){
            res.status(404).json({"status":404, "message": "Course isn't registered"})
            return
        }
        if(inProgress[0].inProgress){
            const questions = await QuestionModel.find({course: course})
            res.send(shuffleQuestions(questions))
            return
        }
        res.status(200).json({"status":200, "message": "Course isn't available at the moment"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status":500, "message": "error while trying to fetch questions"})
    }
})



//handles sumbmission
router.post('/submit', async (req, res)=>{
    try{
        const {score} = req.body;
        //save score to db
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "error while trying to submit"})
    }
})

module.exports = router
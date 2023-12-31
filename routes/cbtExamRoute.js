const express =  require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


const secretKey = process.env.SECRET_KEY

//Models
const QuestionModel = require('../models/QuestionsModel')
const RegisteredCoursesModel = require('../models/RegisteredModels')
const StudentModel = require('../models/StudentModel')
const currentCourseModel = require('../models/currentCourseModel')

//authenticate token
function authenticateToken(req, res, next){
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).json({"status":401, "message": "Token is required"})
    }
    jwt.verify(token, secretKey, (err, decoded)=>{
        if(err){
            return res.status(403).json({"status":403, "message":"invalid token"})
        }
        req.user = decoded
        next();
    })
}



//grab questions
router.get('/', authenticateToken, async(req, res)=>{
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
        const courseObj = await currentCourseModel.find();
        let course = false;

        //confirms there's a course to write, gets course name
        if(courseObj.length > 0){
            course = courseObj[0].name
            if(!courseObj[0].studentsWritten.includes(req.user.reg)){
                courseObj[0].studentsWritten.push(req.user.reg)
                await courseObj[0].save()
            }
        }
        //if no course, return 404
        if(!course){
            return res.status(404).json({"status":404, "message": "Course isn't registered"})
        }
        //checks if course in progress is registered
        const inProgress = await RegisteredCoursesModel.find({name: course});
        const examTime = inProgress[0].time;
        if(inProgress.length <= 0){
            return res.status(404).json({"status":404, "message": "Course isn't registered"})
        }
        //if course is registered, check inProgress status, if true fetch questions
        if(inProgress[0].inProgress){
            const questions = await QuestionModel.find({course: course})
            const user = {
                name: req.user.name,
                reg: req.user.reg
            }
            console.log(examTime)
            return res.status(200).json({"status":200,"questions": shuffleQuestions(questions), "student": user,"time":examTime})
        }
        res.status(404).json({"status":404, "message": "Course isn't available at the moment"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status":500, "message": "error while trying to fetch questions"})
    }
})



router.post('/login', async(req, res)=>{
    try{
        const {reg} = req.body
        const student = await StudentModel.findOne({reg})
        const currentCourse = await currentCourseModel.find();
        let currentCourseName;
        if(currentCourse.length <= 0){
            return res.status(404).json({"status":404, "message": "No exams found"})
        }
        if(currentCourse.length > 0){
            currentCourseName =  currentCourse[0].name;
        }
        if(!student || !student.isPortal || student.writtenCourse == currentCourse[0].name){
            return res.status(404).json({"status":404, "message":"No exams found for student"})
        }

        //checks if a student has sat for the exam
        if(currentCourse[0].studentsWritten.includes(reg)){
            return res.status(404).json({"status":404, "message": "Student has already written this course"})
        }

        const token = jwt.sign({name: student.name, reg: reg, course: currentCourse[0].name || 'TEST'}, secretKey, {expiresIn: '2h'})
        return res.status(200).json({"status":200, "message": "logged in successfully", token, student, currentCourseName})
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "error trying to login"})
    }
})



//handles sumbmission
router.post('/submit', async (req, res)=>{
    try{
        const {answers, reg, course} = req.body;
        const student = await StudentModel.findOne({reg: reg})
        const courseModel = await QuestionModel.find({course: course});
        let score = 0;
        const scorePerAnswer = (70/ courseModel.length)
        if(answers == null || answers == undefined){
            score = 0
        }
        else{
            Object.entries(answers).forEach(([key, value])=>{
                if(value.gotIt == true || value.gotIt == 'true'){
                    score += scorePerAnswer
                }
            })
        }
        student.grades.forEach((grade,index)=>{
            if(grade.course == course){
                student.grades.pop(index)
            }
        })
        student.grades.push({course, score})
        await student.save();
        res.status(200).json({"status":200, "message": "saved answers successfully"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "error while trying to submit"})
    }
})

module.exports = router
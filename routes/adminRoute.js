const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const secretKey = process.env.SECRET_KEY

//Models
const QuestionModel = require('../models/QuestionsModel')
const RegisteredCoursesModel = require('../models/RegisteredModels')
const StudentModel = require('../models/StudentModel')
const CurrentCourseModel = require('../models/currentCourseModel')

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


//Admin dashboard
router.get('/', authenticateToken, async(req, res)=>{
    res.status(200).json({"status":200, "message":"Verified"})
})

router.post('/login', async(req,res)=>{
    try{
        const {name, password} = req.body
        const isAdmin = await StudentModel.findOne({name:'Admin'});
        if(!isAdmin){
            return res.status(404).json({"status":404, "message":"wrong password or name"})
        }
        if(isAdmin.reg !== password){
            return res.status(404).json({"status":404, "message":"wrong password or name"})
        }
        const token = jwt.sign({name: 'name', role: 'admin'}, secretKey, {expiresIn: '2h'})
        res.status(200).json({"status":200, "message": "logged in successfully", token})
    }
    catch(err){
        console.log(err);
        res.status(500).json({"status":500, "message":"Server is down"})
    }
})

//Create new questions
router.post('/create', async(req, res)=>{
    try{
        const {course, que, optA, optB, optC, optD, answer} = req.body
        const isCourseRegistered = await RegisteredCoursesModel.find({name: course.toUpperCase()})
        if(isCourseRegistered.length <= 0){
            const RegisterCourse = new RegisteredCoursesModel({
                name: course.toUpperCase(),
            })
            await RegisterCourse.save();
            //res.status(200).json({"status": 200, "message": "registered course"})
        }
        const newQuestion = new QuestionModel({
            course: course.toUpperCase(),
            que: que,
            optA: optA,
            optB: optB,
            optC: optC,
            optD: optD,
            answer: answer,
        })
        await newQuestion.save()
        res.status(200).json({"status": 200, "message": "saved question successfully"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "error saving course"})
    }
})


//register students
router.post('/register/student', async(req, res)=>{

    try{
        const {name, academicSection} = req.body;
        const yearOfEntry = academicSection;
        let count = 0;
        let month = 12

        async function registrationNumber(){
            let rando = Math.floor(1000 + Math.random() * 9000);
            let reg = `${yearOfEntry}${month}${rando}`;
            //checks if a student has the reg number already
            const regExist = await StudentModel.find({reg: reg})
            if(regExist.length > 0){
                //to prevent looking for available reg pass 10 counts
                if(count > 10){
                    month += 1
                    count = 0;
                }
                registrationNumber()
                count++
            }
            return reg;
        }

        const regNo = await registrationNumber();
        const newStudent = new StudentModel({
            name: name,
            reg: regNo,
            yearOfEntry: yearOfEntry,
        })
        await newStudent.save()
        res.status(200).json({"status": 200, "message":"Student registered successfully"})
    }catch(err){
        console.log(err);
        res.status(500).json({"status": 500, "message":"error in registering student"})
    }
})

//gets all registered courses
router.get('/registered-courses', async(req, res)=>{
    try{
        const courses = await RegisteredCoursesModel.find()
        res.status(200).json({"status": 200, "message": "retrived courses successfully", courses: courses})
    }
    catch(err){
        console.log(err);
        res.status(500)
    }
})

//opens a students portal
router.post('/scan/student', async(req, res)=>{
    try{
        const {reg, course} = req.body
        const student = await StudentModel.findOne({reg: reg})
        if(!student){
            res.status(404).json({"status": 404, "message":"Registration number not found"})
            return
        }
        if(!student.courses.includes(course)){
            res.status(404).json({"status":404,  "message": "Student didn't register this course"});
            return
        }
        student.isPortal = true;
        await student.save();
        res.status(200).json({"status":200, "message": "successfully scanned"})
    }catch(err){
        console.log(err);
        res.status(500).json({"status": 500, "message":"error trying to scan, internal server error"})
    }
})

//Expel a student
router.post('/violation/expel/:reg', async(req, res)=>{
    try{
        const reg = req.params.reg;
        await StudentModel.deleteOne({reg: reg});
        res.status(200).json({"status": 200, "message":"successfully deleted student account"})
    }catch(err){
        console.log(err)
        res.status(500).json({"status": 500, "message": "Internal server error while trying to delete student"})
    }
})

//pushes courses to currentCourse
router.post('/open-course', async(req, res)=>{
    try{
        const {course} = req.body
        const openPortalCourse = await RegisteredCoursesModel.findOne({name: course})
        if(!openPortalCourse){
            console.log(openPortalCourse)
            return res.status(404).json({"status":404, "message": "course wasn't registered"})
        }
        const newOpenCourse = new CurrentCourseModel({
            name: course
        });
        openPortalCourse.inProgress = true
        await newOpenCourse.save()
        await openPortalCourse.save()
        res.status(200).json({"status":200, "message":"course has successfully been opened"})
    }catch(err){
        console.log(err);
        res.status(500).json({"status":500, "message": "Internal server error trying to open course"})
    }
})

router.post('/close-course', async(req, res)=>{
    try{
        const {course} = req.body
        const openPortalCourse = await RegisteredCoursesModel.findOne({name: course})
        const currentCourse = await CurrentCourseModel.findOne({name: course})
        if(openPortalCourse.length < 1 || !openPortalCourse.inProgress || currentCourse.length < 1){
            return res.status(404).json({"status":404, "message": "course isn't open"})
        }
        openPortalCourse.inProgress = false
        await openPortalCourse.save()
        await CurrentCourseModel.deleteOne({name: course})
        res.status(200).json({"status":200, "message": "closed course successfully"})
    }catch(err){
        console.log(err);
        res.status(500).json({"status":500, "message": "Internal server error trying to close course"})
    }
})

module.exports = router
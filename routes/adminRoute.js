const express = require('express')
const router = express.Router()



//Models
const QuestionModel = require('../models/QuestionsModel')
const RegisteredCoursesModel = require('../models/RegisteredModels')
const StudentModel = require('../models/StudentModel')


//Admin dashboard
router.get('/', async(req, res)=>{
    res.send("Only authorized users only")
})

//Create new questions
router.post('/create', async(req, res)=>{
    try{
        const {course, que, optA, optB, optC, optD, answer} = req.body
        const isCourseRegistered = await RegisteredCoursesModel.find({name: course})
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
router.post('/register/student/:name/:academicSection', async(req, res)=>{

    try{
        const name = req.params.name;
        const yearOfEntry =req.params.academicSection;
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
        res.status(200).json({"status": 200, "message":"student registered"})
    }catch(err){
        console.log(err);
        res.status(500).json({"status": 500, "message":"error in registering student"})
    }
})


//opens a students portal
router.post('/scan/student/:reg/:course', async(req, res)=>{
    try{
        const reg = req.params.reg;
        const course = req.params.course;
        const student = await StudentModel.findOne({reg: reg})
        if(!student){
            res.status(200).json({"status": 200, "message":"Registration number not found"})
            return
        }
        if(!student.courses.includes(course)){
            res.status(200).json({"status":200, "message": "student didn't register this course"});
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

module.exports = router
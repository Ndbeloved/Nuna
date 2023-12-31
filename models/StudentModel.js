const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    course: 'String',
    score: 'String',
})


const StudentSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true,
    },
    reg: {
        type: "String",
        required: true
    },
    level:{
        type: "String",
        default : "100"
    },
    yearOfEntry: {
        type: "String",
        required: true,
    },
    isPortal: {
        type: "Boolean",
        default: false
    },
    writtenCourse:{
        type: "String",
        default: "none"
    },
    courses: [String],
    grades:[scoreSchema],
})

module.exports = mongoose.model("students", StudentSchema)
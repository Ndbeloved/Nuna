const mongoose = require('mongoose');

const RegisteredCoursesSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true
    },
    time: {
        type: "String",
        default: "35",
    },
    inProgress: {
        type: "Boolean",
        default: false,
    },
    questionLimit:{
        type: "String",
        default: "20",
    }
});

module.exports = mongoose.model("RegisteredCourses", RegisteredCoursesSchema)
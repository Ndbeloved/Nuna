const mongoose = require('mongoose')

const currentCourseSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true,
        unique: true,
    }
})

module.exports = mongoose.model("currentCourse", currentCourseSchema)
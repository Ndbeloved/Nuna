const mongoose = require('mongoose');


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
    courses: [Array],
})

module.exports = mongoose.model("students", StudentSchema)
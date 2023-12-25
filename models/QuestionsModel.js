const mongoose = require('mongoose')
const QuestionSchema = new mongoose.Schema({
    course: {
        type: 'String',
        required: true
    },
    que: {
        type: 'String',
        required: true,
    },
    optA:{
        type: 'String',
        required: true,
    },
    optB:{
        type: 'String',
        required: true,
    },
    optC:{
        type: 'String',
        required: true,
    },
    optD:{
        type: 'String',
        required: true,
    },
})

module.exports = mongoose.model('Questions', QuestionSchema)
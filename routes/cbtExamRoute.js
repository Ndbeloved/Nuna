const express =  require('express')
const router = express.Router()

router.get('/', (req, res)=>{
    res.send('cbt exam route')
})

module.exports = router
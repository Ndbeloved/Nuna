const mongoose = require('mongoose')

const dbconnect = (app, PORT, os)=>{
    const connectionParams = {useNewUrlParser:true, useUnifiedTopology:true};
    mongoose.connect(process.env.DB);
    mongoose.connection.on('connected', ()=>{
        console.log('connected to mongo successfully')
        app.listen(PORT, ()=>{
            console.log(`${os.hostname} is running http://localhost:${PORT}`);
        })
    })
    mongoose.connection.on('error', (err)=>{
        console.log('Error trying to connect to DB', err)
    })
    mongoose.connection.on('disconnected', ()=>{
        console.log('Mongo connection was lost')
    })
}

module.exports = dbconnect
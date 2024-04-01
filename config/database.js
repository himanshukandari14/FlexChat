const mongoose=require('mongoose');
require('dotenv').config();


const dbConnection=()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{console.log('Db connection successfull')})
    .catch((error)=>{
        console.log('error in Db Connection');
        console.log(error);
    })
}

module.exports=dbConnection;
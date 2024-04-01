const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const fileUpload=require('express-fileupload');
var cors=require('cors')
const dbConnection = require('./config/database');
app.use(cookieParser());
require('dotenv').config();

const PORT=process.env.PORT || 5000


app.use(
  cors({
    origin: "*",
  })
);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles:true,
   tempFileDir: '/tmp'
}))
app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`);
})

const routes=require('./routes/route');
app.use('/api/v1',routes);

// db
dbConnection();

// deafult route
app.get('/',(req,res)=>{
    console.log('Home page welcome')
    res.send('welcome')
})
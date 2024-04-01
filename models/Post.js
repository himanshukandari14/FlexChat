const mongoose=require('mongoose');
const PostSchema= new mongoose.Schema({
   title:{
    type:String,
    required:true,
   },
   imageUrl:{
   type:String,   
   },
   likes:[
      {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
      }
   ],
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
   }
})

module.exports=mongoose.model('Post',PostSchema);
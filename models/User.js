const mongoose=require('mongoose');
const UserSchema= new mongoose.Schema({

    image:{
        type:String,
        default:'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
        
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
         type:String,
        require:true,   
    },
    username:{
        type:String,
        require:true,
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    }],
    location:[{
        type:String,
        required:true,
    }],
    likedPosts:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
        }
    ],
    followers:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        }
    ],
    following:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        }
    ],
    token:{
        type:String,
        default:null,
    }
})

module.exports=mongoose.model('User',UserSchema);
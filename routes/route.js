// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/auth');
const { register, login, getLoggedInUser, logout} = require('../controllers/Auth');
const User = require('../models/User');
const Post=require('../models/Post');
const { createPost, getAllPosts, likePost } = require('../controllers/Post');
const { updateProfile, visitUser, getUserProfile } = require('../controllers/User');

// Register a new user
router.post('/register', register);

// Log in an existing user
router.post('/login', login);

// Protected route requiring token verification
router.get('/getallusers',verifyToken,async (req, res) => {
    try {
        const data=await User.find({});
        console.log('data fetched');
        return res.status(200).json(
            {data,
            message:"welcome to user retriveal"
            }
            )
        

    } catch (error) {
        console.log(error);
        res.status(500).json({error:'internal server error'})
    }
});

router.get('/profile',verifyToken,getLoggedInUser);



// POST /api/v1/posts - Create a new post
router.post('/posts', verifyToken,createPost)

// feed
router.get('/feed',verifyToken,getAllPosts)
router.get('/test',verifyToken,async (req,res)=>{
    res.send("test route")
    console.log("one test route")
})

router.post('/posts/like/:id',verifyToken,likePost);
router.post('/users/profile-picture',verifyToken,updateProfile);
router.get('/profile/:userId',verifyToken,getUserProfile);

router.get('/logout',logout);
module.exports = router;


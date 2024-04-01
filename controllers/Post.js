const User = require('../models/User');
const Post=require('../models/Post');
const cloudinary=require('cloudinary').v2;
const {cloudinaryConnect}=require('../config/cloudinary');
cloudinaryConnect();

function isFileTypeSupported(type, supportedType){
    return supportedType.includes(type);
}

async function uploadFileToCloudinary(file,folder){
  const options={folder};
  return await cloudinary.uploader.upload(file.tempFilePath,options);
}
exports.createPost= async (req, res) => {
    try {
        // Extract user data from the request object
        const userData = req.user;
         // Assuming the request body contains post data
        const { title } = req.body;
        // fetch file
        const file = req.files.imageFile;
        console.log("file=>",file);

        // supported file
        const supportedTypes=["jpeg","jpg","png"];
        const fileType= file.name.split('.')[1].toLowerCase();

        // check support
        if(!isFileTypeSupported(fileType,supportedTypes)){
          return res.status(400).json(({
            success:false,
            message:'file type not supported',
          }))
        }

        // if file format supported
        const response = await uploadFileToCloudinary(file,"mernapp");

        console.log("response=>",response);
        // Create a new post associated with the authenticated user

        // Get the URL of the uploaded image
        const imageUrl = response.secure_url;
        const newPost = new Post({
            title,
            imageUrl,
            user: userData.id 
        });

        // Save the new post to the database
        const savedPost = await newPost.save();

        // Update user document to include the new post
        const user = await User.findByIdAndUpdate(
            userData.id, // User ID
            { $push: { posts: savedPost._id } }, // Add the post ID to the user's posts array
            { new: true } // Return the updated user document
        );

        // Return the saved post in the response
        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: savedPost,
            user // Include the updated user document in the response
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the post"
        });
    }
};


// get all posts for feed
// Controller to fetch all posts
exports.getAllPosts = async (req, res) => {
  try {
    
    // Fetch all posts from the database
    const posts = await Post.find().populate('user');
    
    // Check if posts exist
    if (!posts || posts.length === 0) {
      return res.status(404).json({ success: false, message: 'No posts found' });
    }
    
    // Return the fetched posts
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.likePost = async (req, res) => {
  try {
    const userId = req.user.id; //current logegdin user ki id
    const user = await User.findById(userId);
    const postId = req.params.id;
    const post = await Post.findById(postId);

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userId);

    if (!isLiked) {
      // User has not liked the post, so like it
      post.likes.push(userId);
      user.likedPosts.push(postId);
      await user.save();
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        post: post,
        user: user
      });
    } else {
      // User has already liked the post, so unlike it
      const index = post.likes.indexOf(userId);
      if (index > -1) {
        post.likes.splice(index, 1);
      }
      const userIndex = user.likedPosts.indexOf(postId);
      if (userIndex > -1) {
        user.likedPosts.splice(userIndex, 1);
      }
      await user.save();
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        post: post,
        user: user
      });
    }
  } catch (error) {
    console.log('error while liking post:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while liking the post'
    });
  }
}


const cloudinary = require('cloudinary').v2;
const { cloudinaryConnect } = require('../config/cloudinary');
const User = require('../models/User');
const Post =require('../models/Post');

cloudinaryConnect();

async function uploadFileToCloudinary(file, folder) {
  const options = { folder };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.updateProfile = async (req, res) => {
  try {
    // Extract user data from the request object
    const userData = req.user;

    // Assuming the request body contains profile picture data
    const file = req.files.profilePicture;

    // Upload profile picture to Cloudinary
    const response = await uploadFileToCloudinary(file, "mernapp");

    // Get the URL of the uploaded image
    const profilePictureUrl = response.secure_url;

   
    const updatedUser = await User.findByIdAndUpdate(userData.id, { image: profilePictureUrl }, { new: true });
    await updatedUser.save();

    // Return success response with updated user data
    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePictureUrl,
      // updatedUser // Include the updated user data if needed
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile picture"
    });
  }
};



exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // we are pasing id as parameter, otherwise it will give us loged in user data
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
   

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// search user from search bar
exports.searchUsers=async(req,res) => {
  const {query} = req.query;
  try {
    const searchResults = await User.find({username :{$regex : new RegExp(query, 'i')}})
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// follow controller
exports.follow = async (req, res) => {
  try {
    const currentUserId = req.user.id; // User who clicked follow button
    const followingUserId = req.params.id; // User being followed

    // Find the current user
    const currentUser = await User.findById(currentUserId);

    // If the current user doesn't exist, return 404
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    // Check if the user is already following the followingUserId
    const followingIndex = currentUser.following.indexOf(followingUserId);
    if (followingIndex !== -1) {
      // User is already followed, so remove from following list
      currentUser.following.splice(followingIndex, 1);
      await currentUser.save();

      // Also remove current user from followers list of followingUserId
      const followingUser = await User.findById(followingUserId);
      const followerIndex = followingUser.followers.indexOf(currentUserId);
      if (followerIndex !== -1) {
        followingUser.followers.splice(followerIndex, 1);
        await followingUser.save();
      }

      return res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
        user: currentUser
      });
    } else {
      // User is not followed, so add to following list
      currentUser.following.push(followingUserId);
      await currentUser.save();

      // Also add current user to followers list of followingUserId
      const followingUser = await User.findById(followingUserId);
      followingUser.followers.push(currentUserId);
      await followingUser.save();

      return res.status(200).json({
        success: true,
        message: 'User followed successfully',
        user: currentUser
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

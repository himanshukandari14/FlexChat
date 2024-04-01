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


exports.getUserProfile = (req, res) => {
  const userId = req.params.userId;
  const user = User.find(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Only send relevant user data in the response
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location
  };

  res.status(200).json(userData);
};
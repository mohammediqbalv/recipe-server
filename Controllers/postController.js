const posts = require("../Models/PostSchema");
const Report = require("../Models/ReportSchema");

// addPost
exports.addPosts = async (req, res) => {
  console.log("Inside add post Function");
  const userId = req.payload;
  let recipeImage = "";
  let recipeVideo = "";
  if (req.file) {
    if (req.file.mimetype.startsWith("image/")) {
      recipeImage = req.file.filename;
    } else if (req.file.mimetype.startsWith("video/")) {
      recipeVideo = req.file.filename;
    }
  }
  const { recipename, make, likes } = req.body;
  try {
    const existingPosts = await posts.findOne({ make });
    if (existingPosts) {
      res.status(406).json(`Recipe already  Exists!! Uploads another`);
    } else {
      const newPosts = new posts({
        recipename,
        make,
        recipeImage,
        recipeVideo,
        userId,
        likes,
      });
      await newPosts.save();
      res.status(200).json(newPosts);
    }
  } catch (err) {
    res.status(401).json(`Request Failed,Error : ${err}`);
  }
};


// getUserPosts 
exports.getUserPosts = async (req,res)=>{
  const userId = req.payload
  try{
    const userPosts = await posts.find({userId})
    res.status(200).json(userPosts)
  }catch(err){
    res.status(401).json(err);
  }
}

// allPosts
exports.getallUsersPosts = async (req,res)=>{
  const searchKey = req.query.search
  const query = {
    recipename:{$regex:searchKey , $options:"i"}
  }
  try{
    const allPosts = await posts.find(query)
    res.status(200).json(allPosts)
  }catch(err){
    res.status(401).json(err);
  }
}

// this is for admin only
exports.getallUsersPostsForAdmin = async (req,res)=>{
  try{
    const allPosts = await posts.find()
    res.status(200).json(allPosts)
  }catch(err){
    res.status(401).json(err);
  }
}

// edit Post 
exports.editPostController = async (req,res)=>{
  // get Post id     
  const {id} = req.params
  const userId = req.payload
  const {recipename,make, recipeImage, recipeVideo, likes} = req.body

  let uploadPostImage = recipeImage;
  let uploadPostVideo = recipeVideo;
  if (req.file) {
    if (req.file.mimetype.startsWith("image/")) {
      uploadPostImage = req.file.filename;
    } else if (req.file.mimetype.startsWith("video/")) {
      uploadPostVideo = req.file.filename;
    }
  }

  try{
    const updatePost = await posts.findByIdAndUpdate(
      {_id:id},
      {recipename,make,recipeImage:uploadPostImage,recipeVideo:uploadPostVideo,userId,likes},
      {new:true}
    )
    await updatePost.save()
    res.status(200).json(updatePost)
  }catch(err){
    res.status(401).json(`Request failed Error : ${err}`)
  }

}

// delete posts
exports.deletepostsController = async (req,res)=>{

  const {id} = req.params
  try{
    const removePost = await  posts.findByIdAndDelete({_id:id})
    res.status(200).json(removePost)
  }catch(err){
    res.status(401).json(err)
  }
}

// like Post
exports.likePostController = async (req, res) => {
  const {id} = req.params
  const userId = req.payload //Assuming you have user authentication

  try {
    const post = await posts.findById(id);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// unlike post
exports.unlikePostController = async (req, res) => {
  const {id} = req.params
  const userId = req.payload // Assuming you have user authentication

  try {
    const post = await posts.findById(id);
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString()
      
      );
      await post.save();
    }
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

};

// Add a comment to a post
exports.addCommentController = async (req, res) => {
  const { id } = req.params; // post id
  const { text, userId, username } = req.body;
  if (!text || !userId || !username) {
    return res.status(400).json({ message: 'Missing comment text, userId, or username' });
  }
  try {
    const post = await posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ text, userId, username });
    await post.save();
    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err });
  }
};

// Get all comments for a post
exports.getCommentsController = async (req, res) => {
  const { id } = req.params; // post id
  try {
    const post = await posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get comments', error: err });
  }
};

// Delete a comment from a post
exports.deleteCommentController = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.payload; // Current user's ID from JWT
  
  try {
    const post = await posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find the comment to be deleted
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author or an admin
    const users = require('../Models/userSchema');
    const currentUser = await users.findById(userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Allow deletion if user is the comment author or an admin
    if (comment.userId !== userId && !currentUser.isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own comments or need admin privileges.' 
      });
    }
    
    // Remove the comment
    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
    await post.save();
    
    res.status(200).json({
      message: 'Comment deleted successfully',
      comments: post.comments
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};

// Like a comment
exports.likeCommentController = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.payload; // Assuming user authentication
  try {
    const post = await posts.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      await post.save();
    }
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to like comment', error: err });
  }
};

// Unlike a comment
exports.unlikeCommentController = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.payload; // Assuming user authentication
  try {
    const post = await posts.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.likes = comment.likes.filter(id => id !== userId);
    await post.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to unlike comment', error: err });
  }
};

// Report a post
exports.reportPostController = async (req, res) => {
  console.log("Report request received:", req.body);
  const { postId } = req.body;
  const userId = req.payload;
  const { reason } = req.body;
  
  console.log("PostId:", postId);
  console.log("UserId:", userId);
  console.log("Reason:", reason);
  
  try {
    // Check if post exists
    const post = await posts.findById(postId);
    console.log("Found post:", post);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({ postId, reportedBy: userId });
    console.log("Existing report:", existingReport);
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    const report = new Report({
      postId,
      reportedBy: userId,
      reason: reason || 'Inappropriate content',
    });
    console.log("New report object:", report);
    await report.save();
    console.log("Report saved successfully");
    res.status(200).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    console.log("Error in reportPostController:", err);
    res.status(500).json({ message: 'Failed to submit report', error: err.message });
  }
};

// Get all reports (admin)
exports.getAllReportsController = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('postId', 'recipename make recipeImage')
      .populate('reportedBy', 'username email');
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err });
  }
};

// Delete a specific report (admin)
exports.deleteReportController = async (req, res) => {
  const { reportId } = req.params;
  try {
    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report', error: err });
  }
};



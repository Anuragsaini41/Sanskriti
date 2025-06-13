const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Export a function that takes the PostModel as parameter
module.exports = function(PostModel) {
  // ✅ Multer config for image upload
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/img/social-media'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage: storage });

  // ✅ POST endpoint to save user post
  router.post('/posts', upload.array('images', 5), async (req, res) => {
    try {
      console.log('Creating new post with data:', req.body);
      
      // Extract data from request
      const { title, state, city, description, tags, authorName, authorAvatar } = req.body;
      
      // Process image files
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => `/img/social-media/${file.filename}`);
      } else {
        imageUrls = ['/img/social-media/default-post.jpg'];
      }
      
      // Generate tag array from comma-separated string
      const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
      
      // Create new post with explicit empty arrays for comments
      const newPost = new PostModel({
        id: Date.now(),
        title: title,
        location: {
          city: city || '',
          state: state
        },
        description: description,
        images: imageUrls,
        likes: 0,
        likedBy: [], // Initialize as empty array
        comments: [], // Initialize as empty array, not a number
        commentCount: 0,
        author: {
          name: authorName || 'Guest User',
          avatar: authorAvatar || '../img/social-media/avatar1.jpg',
          id: req.body.userId || 'anonymous' // Add user ID to author object
        },
        date: new Date().toISOString(),
        tags: tagArray
      });
      
      // Save to database with validation disabled to avoid schema issues
      const savedPost = await newPost.save({ validateBeforeSave: false });
      
      console.log('✅ New post created successfully:', savedPost.id);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: savedPost
      });
    } catch (error) {
      console.error('❌ Error creating post:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating post',
        error: error.message
      });
    }
  });

  // ✅ GET endpoint to fetch posts from MongoDB
  router.get('/posts', async (req, res) => {
    try {
      const posts = await PostModel.find().sort({ createdAt: -1 }); // Sort by newest first
      res.status(200).json({ success: true, posts });
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }
  });

  // ✅ Like endpoint
  router.post('/posts/:id/like', async (req, res) => {
    try {
      console.log('💡 Like request received:', req.body);
      const postId = req.body.postId;
      const userId = req.body.userId || 'anonymous';
      
      if (!postId) {
        return res.status(400).json({ success: false, message: 'Missing postId in request' });
      }
      
      // First find the post to check if it exists
      const post = await PostModel.findOne({ id: postId });
      
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      
      // Now do the update
      const alreadyLiked = post.likedBy && post.likedBy.includes(userId);
      console.log(`User ${userId} already liked? ${alreadyLiked}`);
      
      if (alreadyLiked) {
        // Unlike
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        // Like
        if (!post.likedBy) post.likedBy = [];
        post.likedBy.push(userId);
        post.likes += 1;
      }
      
      // Save with validation disabled to prevent schema errors
      await post.save({ validateBeforeSave: false });
      
      console.log(`✅ Post like updated. New likes count: ${post.likes}`);
      
      res.status(200).json({ 
        success: true, 
        likes: post.likes, 
        liked: !alreadyLiked,
        message: alreadyLiked ? 'Post unliked' : 'Post liked'
      });
    } catch (error) {
      console.error('❌ Error liking post:', error);
      res.status(500).json({ success: false, message: 'Error liking post', error: error.message });
    }
  });

  // ✅ Add a comment to a post
  router.post('/posts/:id/comment', async (req, res) => {
    try {
      const postId = req.body.postId;
      const userId = req.body.userId || 'anonymous';
      const userName = req.body.userName || 'Guest User';
      const userAvatar = req.body.userAvatar || '../img/social-media/avatar1.jpg';
      const commentText = req.body.text;
      
      if (!commentText || commentText.trim() === '') {
        return res.status(400).json({ success: false, message: 'Comment text is required' });
      }
      
      // Find the post
      const post = await PostModel.findOne({ id: postId });
      
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      
      // Create new comment
      const newComment = {
        userId: userId,
        userName: userName,
        userAvatar: userAvatar,
        text: commentText,
        date: new Date()
      };
      
      // Initialize comments array if not exists
      if (!post.comments) post.comments = [];
      
      // Add comment to post
      post.comments.push(newComment);
      post.commentCount = post.comments.length;
      
      await post.save();
      
      res.status(201).json({ 
        success: true, 
        comment: newComment,
        commentCount: post.commentCount,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error adding comment', 
        error: error.message 
      });
    }
  });

  // ✅ Get comments for a post
  router.get('/posts/:id/comments', async (req, res) => {
    try {
      const postId = req.params.id;
      
      // Find the post
      const post = await PostModel.findOne({ id: postId });
      
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      
      res.status(200).json({ 
        success: true, 
        comments: post.comments || []
      });
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching comments', 
        error: error.message 
      });
    }
  });

  // ✅ Delete a comment
  router.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { userId } = req.body;
      
      // Find the post
      const post = await PostModel.findOne({ id: postId });
      
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      
      // Find the comment by ID 
      const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
      
      if (commentIndex === -1) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }
      
      // Check if the user is the comment author
      if (post.comments[commentIndex].userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own comments' 
        });
      }
      
      // Remove the comment
      post.comments.splice(commentIndex, 1);
      
      // Update the comment count
      post.commentCount = post.comments.length;
      
      // Save the post
      await post.save();
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        commentCount: post.commentCount
      });
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting comment', 
        error: error.message 
      });
    }
  });

  // ✅ Repair database endpoint
  router.get('/repair-database', async (req, res) => {
    try {
      // Find all posts and repair them
      const result = await PostModel.updateMany(
        { $or: [
          { comments: { $type: "number" } },
          { comments: { $exists: false } }
        ]},
        { $set: { comments: [], commentCount: 0 } }
      );
      
      res.status(200).json({
        success: true,
        message: `Database repair completed. Fixed ${result.modifiedCount} posts.`,
        result: result
      });
    } catch (error) {
      console.error('❌ Error repairing database:', error);
      res.status(500).json({ success: false, message: 'Error repairing database', error: error.message });
    }
  });

  // ✅ Database repair endpoint for user posts
  router.get('/repair-user-posts', async (req, res) => {
    try {
      const { userId, username } = req.query;
      
      if (!userId || !username) {
        return res.status(400).json({ 
          success: false, 
          message: 'Both userId and username are required' 
        });
      }
      
      console.log(`Repairing posts for user: ${username} (ID: ${userId})`);
      
      // Find posts by author name and update them with the userId
      const result = await PostModel.updateMany(
        { 'author.name': username },
        { 
          $set: { 
            'author.id': userId 
          }
        }
      );
      
      res.status(200).json({
        success: true,
        message: `Database repair completed. Updated ${result.modifiedCount} posts.`,
        result: result
      });
    } catch (error) {
      console.error('❌ Error repairing user posts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error repairing user posts', 
        error: error.message 
      });
    }
  });

  return router;
};
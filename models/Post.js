const mongoose = require('mongoose');

// Comment sub-schema
const commentSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userAvatar: String,
  text: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  location: {
    city: String,
    state: {
      type: String,
      required: true
    }
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
 
  likedBy: [String],
  
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    }
  },
  date: {
    type: String,
    required: true
  },
  tags: [String]
}, { timestamps: true });


module.exports = (connection) => {
  return connection.model('Post', postSchema, 'post');
};

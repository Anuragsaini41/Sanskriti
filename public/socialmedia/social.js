// Sanskriti Social Media Platform - Main JavaScript

// Global posts array instead of hardcoded dummyPosts
let posts = [];
let currentUser = {
  id: localStorage.getItem('userId') || 'user_' + Date.now(),
  name: localStorage.getItem('username') || 'Guest User',
  avatar: localStorage.getItem('profileImage') || '../img/social-media/avatar1.jpg'
};

// Save the current user if not already saved
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', currentUser.id);
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  loadPosts();
  setupEventListeners();
  
  // Add this new code to update profile image in dropdown
  updateProfileImageInNav();
});

// Add this new function to update profile image in navigation
function updateProfileImageInNav() {
  const profileImage = localStorage.getItem('profileImage');
  if (profileImage) {
    // Update all profile images in navigation
    const navProfileImg = document.getElementById('nav-profile-pic');
    if (navProfileImg) {
      navProfileImg.src = profileImage;
      console.log('Updated profile image in navigation');
    } else {
      console.warn('Navigation profile image element not found');
    }
    
    // If there's a menu profile image as well
    const menuProfileImg = document.querySelector('#profileMenu img');
    if (menuProfileImg) {
      menuProfileImg.src = profileImage;
    }
  } else {
    console.log('No profile image found in localStorage');
  }
}

// Function to fetch posts from MongoDB API
async function fetchPosts() {
  try {
    // Fetch posts from MongoDB
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts data:', error);
    
    // If API fetch fails, try to show any locally stored posts
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    return userPosts;
  }
}

// Load posts into the feed
async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  const loading = document.getElementById('loading');
  
  // Show loading spinner
  loading.style.display = 'block';
  
  try {
    // Fetch posts from API
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    posts = data.posts || [];
    
    // Hide loading spinner
    loading.style.display = 'none';
    
    // Clear container
    postsContainer.innerHTML = '';
    
    // Check if posts are available
    if (posts && posts.length > 0) {
      // Add posts
      posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
      });
      
      // Add animations
      animatePosts();
    } else {
      // No posts
      postsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-info-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>
          <h3>No posts found</h3>
          <p>Be the first to create a post!</p>
          <button onclick="document.getElementById('create-post-btn').click()" class="submit-btn" style="margin-top: 15px;">Create Post</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    
    // Hide loading and show error
    loading.style.display = 'none';
    postsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 15px;"></i>
        <h3>Error loading posts</h3>
        <p>${error.message}</p>
        <button onclick="loadPosts()" class="submit-btn" style="margin-top: 15px;">Try Again</button>
      </div>
    `;
  }
}

// Update the createPostElement function to add like and comment functionality
function createPostElement(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card';
  postCard.dataset.postId = post.id;
  
  // Check if user has liked this post
  const hasLiked = post.likedBy && post.likedBy.includes(currentUser.id);
  
  // Format the post date
  const timeDisplay = formatRelativeTime(post.date);
  
  postCard.innerHTML = `
    <div class="post-image">
      <img src="${post.images[0]}" alt="${post.title}">
    </div>
    <div class="post-details">
      <div class="post-location">
        <i class="fas fa-map-marker-alt"></i>
        ${post.location.city}, ${post.location.state}
      </div>
      <h3 class="post-title">${post.title}</h3>
      <p class="post-description">${post.description}</p>
      <div class="post-meta">
        <div class="post-stats">
          <span class="like-btn ${hasLiked ? 'liked' : ''}">
            <i class="fas fa-heart"></i> 
            <span class="like-count">${post.likes}</span>
          </span>
          <span class="comment-btn">
            <i class="fas fa-comment"></i> 
            <span class="comment-count">${post.commentCount || 0}</span>
          </span>
          <span class="post-time"><i class="far fa-clock"></i> ${timeDisplay}</span>
        </div>
        <div class="post-author">
          <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
          <span class="author-name">${post.author.name}</span>
        </div>
      </div>
      
      <!-- Comment section (initially hidden) -->
      <div class="comments-section" style="display: none;">
        <div class="comments-container"></div>
        <div class="comment-form">
          <textarea placeholder="Add a comment..." class="comment-input"></textarea>
          <button class="comment-submit">Post</button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  
  // Like button
  const likeBtn = postCard.querySelector('.like-btn');
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleLike(post.id, likeBtn);
  });
  
  // Comment button
  const commentBtn = postCard.querySelector('.comment-btn');
  commentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleComments(post.id, postCard);
  });
  
  // Comment submit button
  const commentSubmit = postCard.querySelector('.comment-submit');
  commentSubmit.addEventListener('click', (e) => {
    e.stopPropagation();
    const commentInput = postCard.querySelector('.comment-input');
    const commentText = commentInput.value.trim();
    
    if (commentText) {
      addComment(post.id, commentText, postCard);
      commentInput.value = '';
    }
  });
  
  // Add this event listener ONLY to the image:
  const postImage = postCard.querySelector('.post-image');
  postImage.addEventListener('click', () => {
    viewPostDetails(post.id);
  });
  
  // Prevent post details popup when clicking on metadata section
  const postMeta = postCard.querySelector('.post-meta');
  postMeta.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop event from bubbling up to the postCard
  });

  // Also prevent clicks on the entire post details section from triggering popup
  const postDetails = postCard.querySelector('.post-details');
  postDetails.addEventListener('click', (e) => {
    // Check if the click was directly on the postDetails element (not on its children)
    if (e.target === postDetails) {
      e.stopPropagation();
    }
  });

  // Ensure the post title and description still trigger the post details view
  const postTitle = postCard.querySelector('.post-title');
  const postDescription = postCard.querySelector('.post-description');

  [postTitle, postDescription].forEach(element => {
    if (element) {
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        viewPostDetails(post.id);
      });
    }
  });

  // Add image error handling
  const postImg = postCard.querySelector('.post-image img');
  postImg.onerror = function() {
    // Fallback to a default image if the image fails to load
    this.src = '/img/social-media/default-post.jpg';
    console.error(`Failed to load image for post: ${post.title}`);
  };

  return postCard;
}

// Function to handle post likes
async function handleLike(postId, likeButton) {
  try {
    console.log('Liking post:', postId);
    
    // Show visual feedback immediately
    likeButton.style.opacity = '0.5';
    
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: postId,
        userId: currentUser.id
      })
    });
    
    // Restore opacity regardless of result
    likeButton.style.opacity = '1';
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Update UI
      const likeCount = likeButton.querySelector('.like-count');
      likeCount.textContent = data.likes;
      
      if (data.liked) {
        likeButton.classList.add('liked');
        // Add animation
        likeButton.classList.add('like-animation');
        setTimeout(() => likeButton.classList.remove('like-animation'), 500);
      } else {
        likeButton.classList.remove('liked');
      }
      
      // Update the post in the global posts array
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts[postIndex].likes = data.likes;
        if (!posts[postIndex].likedBy) posts[postIndex].likedBy = [];
        
        if (data.liked) {
          posts[postIndex].likedBy.push(currentUser.id);
        } else {
          posts[postIndex].likedBy = posts[postIndex].likedBy.filter(id => id !== currentUser.id);
        }
      }
    } else {
      console.error('Error in like response:', data.message);
      alert('Could not update like. Please try again.');
    }
  } catch (error) {
    console.error('Error liking post:', error);
    alert('Something went wrong with liking this post. Please refresh the page and try again.');
  }
}

// Function to toggle comments section
async function toggleComments(postId, postCard) {
  const commentsSection = postCard.querySelector('.comments-section');
  const commentsContainer = postCard.querySelector('.comments-container');
  
  // Toggle display
  if (commentsSection.style.display === 'none') {
    commentsSection.style.display = 'block';
    
    // Fetch comments for this post
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();
      
      if (response.ok) {
        // Clear existing comments
        commentsContainer.innerHTML = '';
        
        // Display comments
        if (data.comments && data.comments.length > 0) {
          data.comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
          });
        } else {
          commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        }
      } else {
        console.error('Error fetching comments:', data.message);
        commentsContainer.innerHTML = '<p class="error-message">Error loading comments.</p>';
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      commentsContainer.innerHTML = '<p class="error-message">Error loading comments.</p>';
    }
  } else {
    commentsSection.style.display = 'none';
  }
}

// Function to add a comment
async function addComment(postId, commentText, postCard) {
  try {
    const response = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: postId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: commentText
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update UI
      const commentsContainer = postCard.querySelector('.comments-container');
      const commentCount = postCard.querySelector('.comment-count');
      
      // Remove "no comments yet" message if present
      const noComments = commentsContainer.querySelector('.no-comments');
      if (noComments) {
        noComments.remove();
      }
      
      // Add new comment to the top
      const commentElement = createCommentElement(data.comment);
      commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
      
      // Update comment count
      commentCount.textContent = data.commentCount;
      
      // Update the post in the global posts array
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts[postIndex].commentCount = data.commentCount;
        if (!posts[postIndex].comments) posts[postIndex].comments = [];
        posts[postIndex].comments.unshift(data.comment);
      }
      
      // Add animation to the new comment
      commentElement.classList.add('comment-animation');
      setTimeout(() => commentElement.classList.remove('comment-animation'), 1000);
    } else {
      console.error('Error adding comment:', data.message);
    }
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Function to create a comment element
function createCommentElement(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment-item';
  commentElement.dataset.commentId = comment._id; // Store comment ID in dataset
  
  const commentDate = new Date(comment.date);
  const formattedDate = formatRelativeTime(commentDate);
  
  // Check if this comment belongs to current user
  const isCurrentUserComment = comment.userId === currentUser.id;
  
  // HTML for the comment
  commentElement.innerHTML = `
    <div class="comment-author">
      <img src="${comment.userAvatar}" alt="${comment.userName}" class="comment-avatar">
      <span class="comment-username">${comment.userName}</span>
      <span class="comment-time">${formattedDate}</span>
      ${isCurrentUserComment ? `
        <button class="delete-comment-btn" title="Delete this comment">
          <i class="fas fa-trash-alt"></i>
        </button>` : ''}
    </div>
    <div class="comment-text">${comment.text}</div>
  `;
  
  // Add event listener for delete button if this is user's comment
  if (isCurrentUserComment) {
    const deleteBtn = commentElement.querySelector('.delete-comment-btn');
    deleteBtn.addEventListener('click', () => {
      deleteComment(comment._id, commentElement);
    });
  }
  
  return commentElement;
}

// Add this new function to format relative time
function formatRelativeTime(dateString) {
  // Handle both full ISO timestamps and date-only strings
  const postDate = new Date(dateString);
  const now = new Date();
  
  // If date couldn't be parsed correctly
  if (isNaN(postDate)) {
    return "Unknown date";
  }
  
  const diffInMs = now - postDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
  } else if (diffInDays < 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[postDate.getDay()];
  } else {
    return postDate.toLocaleDateString('en-IN', {
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  }
}

// Function to delete a comment
async function deleteComment(commentId, commentElement) {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  // Get the post ID from the parent post card
  const postCard = commentElement.closest('.post-card');
  const postId = postCard.dataset.postId;
  
  try {
    // Show deleting state
    commentElement.classList.add('deleting');
    
    const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: currentUser.id
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Remove comment after animation completes
      setTimeout(() => {
        commentElement.remove();
        
        // Update comment count
        const commentCount = postCard.querySelector('.comment-count');
        commentCount.textContent = data.commentCount;
        
        // Show "no comments" message if this was the last comment
        if (data.commentCount === 0) {
          const commentsContainer = postCard.querySelector('.comments-container');
          commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        }
      }, 300);
    } else {
      commentElement.classList.remove('deleting');
      alert(data.message || 'Could not delete comment. Please try again.');
    }
  } catch (error) {
    commentElement.classList.remove('deleting');
    console.error('Error deleting comment:', error);
    alert('Failed to delete comment. Please try again later.');
  }
}

// Filter posts by search term
function filterPostsBySearch(searchTerm) {
  const filteredPosts = posts.filter(post => {
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm) ||
      post.location.city.toLowerCase().includes(searchTerm) ||
      post.location.state.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });
  
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = '';
  
  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>
        <h3>No results found</h3>
        <p>Try different keywords or explore our popular destinations.</p>
      </div>
    `;
  } else {
    filteredPosts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });
    animatePosts();
  }
}

// View post details (would normally navigate to a dedicated post page)
function viewPostDetails(postId) {
  // For now, just log the ID
  console.log(`Viewing post with ID: ${postId}`);
  
  // Simulate redirecting for demo purposes
  const post = posts.find(p => p.id === postId);
  if (post) {
    alert(`You clicked on: ${post.title}\nIn a complete app, this would take you to a detailed view of this location.`);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Create post modal
  const createPostBtn = document.getElementById('create-post-btn');
  const createPostModal = document.getElementById('create-post-modal');
  const closeBtn = document.querySelector('.close-btn');
  const cancelBtn = document.querySelector('.cancel-btn');
  
  // Open modal
  createPostBtn.addEventListener('click', () => {
    createPostModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
  
  // Close modal functions
  const closeModal = () => {
    createPostModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    // Reset form if needed
    document.getElementById('post-form').reset();
    document.getElementById('image-preview').innerHTML = '';
  };
  
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  // Close modal if clicked outside
  window.addEventListener('click', (e) => {
    if (e.target === createPostModal) {
      closeModal();
    }
  });
  
  // Image upload preview
  const imageUploadBox = document.querySelector('.image-upload-box');
  const imageInput = document.getElementById('post-images');
  const imagePreview = document.getElementById('image-preview');
  
  imageUploadBox.addEventListener('click', () => {
    imageInput.click();
  });
  
  // Handle drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    imageUploadBox.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    imageUploadBox.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    imageUploadBox.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    imageUploadBox.classList.add('highlighted');
  }
  
  function unhighlight() {
    imageUploadBox.classList.remove('highlighted');
  }
  
  imageUploadBox.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }
  
  imageInput.addEventListener('change', function() {
    handleFiles(this.files);
  });
  
  function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    [...files].forEach(file => {
      if (!file.type.match('image.*')) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <div class="remove-image">&times;</div>
        `;
        
        // Add remove functionality
        const removeBtn = previewItem.querySelector('.remove-image');
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          previewItem.remove();
        });
        
        imagePreview.appendChild(previewItem);
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // Form submission - updated with improved validation
  const postForm = document.getElementById('post-form');
  postForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    const title = document.getElementById('post-title').value.trim();
    const state = document.getElementById('post-state').value;
    const city = document.getElementById('post-city').value.trim();
    const description = document.getElementById('post-description').value.trim();
    
    if (!title || !state || !description) {
      alert('Please fill all required fields');
      return;
    }
    
    // Create FormData for uploading files
    const formData = new FormData();
    
    // Add form fields
    formData.append('title', title);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('description', description);
    formData.append('tags', document.getElementById('post-tags').value.trim());
    formData.append('authorName', localStorage.getItem('username') || "Guest User");
    formData.append('authorAvatar', localStorage.getItem('profileImage') || "../img/social-media/avatar1.jpg");
    formData.append('userId', localStorage.getItem('userId') || 'anonymous');
    
    // Add image files
    const imageInput = document.getElementById('post-images');
    const imagePreview = document.getElementById('image-preview');
    if (imageInput.files.length > 0) {
      for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
      }
    }
    
    try {
      // Show loading indicator
      const submitBtn = document.querySelector('.submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Post...';
      
      // Send to server
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Your post has been created successfully!');
        
        // Reload posts to show the new one
        loadPosts();
        
        // Close modal and reset form
        const createPostModal = document.getElementById('create-post-modal');
        createPostModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        document.getElementById('post-form').reset();
        document.getElementById('image-preview').innerHTML = '';
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating post: ' + error.message);
    } finally {
      // Reset button
      const submitBtn = document.querySelector('.submit-btn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  });
  
  // Feed filter buttons
  const filterButtons = document.querySelectorAll('.feed-filters button');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get the button text to determine which filter to apply
      const filterType = button.textContent.trim().toLowerCase();
      
      switch(filterType) {
        case 'popular':
          filterPostsByPopularity();
          break;
        case 'recent':
          filterRecentPosts();
          break;
        default:
          // Default 'All' case - load all posts
          loadPosts();
      }
    });
  });

  // Setup dropdown functionality for profile menu
  const profileMenu = document.getElementById('profileMenu');
  if (profileMenu) {
    const dropdownContent = profileMenu.querySelector('.dropdown-content');
    
    profileMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownContent.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
      if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
      }
    });
    
    // Sign Out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear local storage or just the authentication data
        localStorage.removeItem('token'); // If you're using auth tokens
        // You could also clear all localStorage: localStorage.clear();
        
        alert('You have been logged out.');
        // Redirect to home page or login page
        window.location.href = '../index.html';
      });
    }
  }
}

// Function to filter posts by popularity (most likes)
function filterPostsByPopularity() {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = '';
  
  // Show loading spinner
  const loading = document.getElementById('loading');
  loading.style.display = 'block';
  
  setTimeout(() => {
    // Sort posts by number of likes (highest first)
    const sortedPosts = [...posts].sort((a, b) => b.likes - a.likes);
    
    // Hide loading spinner
    loading.style.display = 'none';
    
    if (sortedPosts.length === 0) {
      displayNoResults("No popular posts found");
      return;
    }
    
    // Display sorted posts
    sortedPosts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });
    
    // Add animations
    animatePosts();
  }, 500);
}

// Function to filter posts from the last 2 days
function filterRecentPosts() {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = '';
  
  // Show loading spinner
  const loading = document.getElementById('loading');
  loading.style.display = 'block';
  
  setTimeout(() => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Filter posts from the last 2 days
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= twoDaysAgo;
    });
    
    // Hide loading spinner
    loading.style.display = 'none';
    
    if (recentPosts.length === 0) {
      displayNoResults("No posts from the last 2 days");
      return;
    }
    
    // Sort by newest first
    recentPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display filtered posts
    recentPosts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });
    
    // Add animations
    animatePosts();
  }, 500);
}

// Helper function to display no results message
function displayNoResults(message) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = `
    <div class="no-results">
      <i class="fas fa-info-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>
      <h3>${message}</h3>
      <p>Try a different filter or check back later.</p>
    </div>
  `;
}

// Animate posts when they enter viewport
function animatePosts() {
  const posts = document.querySelectorAll('.post-card');
  
  // Apply staggered fade-in animation
  posts.forEach((post, index) => {
    post.style.opacity = '0';
    post.style.transform = 'translateY(20px)';
    post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    post.style.transitionDelay = `${index * 0.1}s`;
    
    setTimeout(() => {
      post.style.opacity = '1';
      post.style.transform = 'translateY(0)';
    }, 100);
  });
}

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
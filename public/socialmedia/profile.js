// Sanskriti Social - Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log("Profile page loaded - checking for profile image");
    
    // Directly apply the profile image as soon as the page loads
    const profileImage = localStorage.getItem('profileImage');
    if (profileImage) {
        console.log("Found profile image, applying to all elements");
        
        // Apply to all profile image elements
        const imageElements = document.querySelectorAll('#profile-avatar, #nav-profile-pic');
        imageElements.forEach(el => {
            if (el) {
                console.log("Applying image to element:", el.id);
                el.src = profileImage;
            }
        });
    } else {
        console.log("No profile image found in localStorage");
    }
    
    // Setup dropdown functionality for profile menu
    const profileMenu = document.getElementById('profileMenu');
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
    
    // Continue with the rest of your initialization
    loadUserData();
    loadUserPosts();
    setupEventListeners();
});

// Load user data from dashboard/localStorage
function loadUserData() {
    console.log("Starting to load user data");
    
    // Check if user is logged in
    const username = localStorage.getItem('username');
    console.log("Username from localStorage:", username);
    
    if (!username) {
        console.log("No username found - redirecting to login");
        alert('Please log in to view your profile');
        window.location.href = '../auth/login.html';
        return;
    }
    
    // 1. Set the username
    document.getElementById('profile-name').textContent = username;
    
    // 2. Get profile image with enhanced debugging
    let profileImage = localStorage.getItem('profileImage');
    console.log("Profile image from localStorage:", profileImage);
    
    // If no image in localStorage, use default
    if (!profileImage) {
        console.log("No profile image found, using default");
        profileImage = '../img/default-avatar.jpg';
    }
    
    // Make sure profile elements exist before setting
    const profileAvatar = document.getElementById('profile-avatar');
    const navProfilePic = document.getElementById('nav-profile-pic');
    
    console.log("Profile avatar element exists:", !!profileAvatar);
    console.log("Nav profile pic element exists:", !!navProfilePic);
    
    // Update all profile image instances
    if (profileAvatar) profileAvatar.src = profileImage;
    if (navProfilePic) navProfilePic.src = profileImage;
    
    console.log("Profile images updated successfully");
    
    // 3. Get location data - would normally come from dashboard
    // For now, hard-coded, but in a real app this would be fetched
    const userCity = localStorage.getItem('userCity') || 'New Delhi';
    const userState = localStorage.getItem('userState') || 'Delhi';
    document.getElementById('user-location').textContent = `${userCity}, ${userState}`;
    
    // 4. Load user bio
    const userBio = localStorage.getItem('userBio') || 'Tell people about yourself and your travels...';
    document.getElementById('user-bio').textContent = userBio;
    document.getElementById('bio-text').value = userBio;
    
    // 5. Update stats
    document.getElementById('posts-count').textContent = getUserPostsCount();
    document.getElementById('places-visited').textContent = getPlacesVisitedCount();
    document.getElementById('saved-places').textContent = getSavedPlacesCount();
}

// Count user posts
function getUserPostsCount() {
  // In a real app, this would come from a database
  // For demo, we'll use localStorage or return mock data
  const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
  return userPosts.length;
}

// Count places visited
function getPlacesVisitedCount() {
  // In a real app, this would be calculated from user posts
  // For now, return a sample number
  return 5;
}

// Count saved places
function getSavedPlacesCount() {
  // In a real app, this would come from a database of saved places
  // For now, return a sample number
  return 12;
}

// Function to fetch user's posts from API
async function getUserPosts() {
  try {
    // Get both ID and username for more robust matching
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    console.log("Looking for posts with userId:", userId);
    console.log("Looking for posts with username:", username);
    
    if (!userId && !username) {
      console.error('No user identification found in localStorage');
      return [];
    }

    // Fetch all posts from the API
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Total posts fetched:", data.posts.length);
    
    // More flexible matching - check both ID and username
    const userPosts = data.posts.filter(post => {
      const matchById = post.author && 
                       (post.author.id === userId || 
                        post.author.userId === userId ||
                        post.userId === userId);
                        
      const matchByName = post.author && 
                         post.author.name === username;
                         
      return matchById || matchByName;
    });
    
    console.log("Posts matched for current user:", userPosts.length);
    return userPosts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

// Update the loadUserPosts function to use async/await
async function loadUserPosts() {
  const postsContainer = document.getElementById('user-posts');
  const loading = document.getElementById('loading-posts');
  const noPosts = document.getElementById('no-posts');
  
  // Show loading spinner
  loading.style.display = 'block';
  noPosts.style.display = 'none';
  postsContainer.innerHTML = '';
  
  try {
    // Get user's actual posts from the database
    const userPosts = await getUserPosts();
    
    // Hide loading spinner
    loading.style.display = 'none';
    
    if (!userPosts || userPosts.length === 0) {
      // Show no posts message
      noPosts.style.display = 'block';
    } else {
      // Create post elements
      userPosts.forEach(post => {
        const postElement = createUserPostElement(post);
        postsContainer.appendChild(postElement);
      });
      
      // Update stats
      document.getElementById('posts-count').textContent = userPosts.length;
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    loading.style.display = 'none';
    
    // Show error message
    postsContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load your posts. Please try again later.</p>
      </div>
    `;
  }
}

// Create a user post element with full card layout (similar to social feed)
function createUserPostElement(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card';
  postCard.id = `post-${post.id}`;
  postCard.dataset.postId = post.id;
  
  // Check if user has liked this post
  const userId = localStorage.getItem('userId');
  const hasLiked = post.likedBy && post.likedBy.includes(userId);
  
  // Format the post date
  const timeDisplay = formatRelativeTime(post.date);
  
  postCard.innerHTML = `
    <div class="post-image">
      <img src="${post.images[0]}" alt="${post.title}">
      <div class="post-actions">
        <i class="fas fa-ellipsis-v"></i>
        <div class="post-actions-dropdown">
          <a href="#" class="edit-post" data-post-id="${post.id}">
            <i class="fas fa-edit"></i> Edit Post
          </a>
          <a href="#" class="delete-post" data-post-id="${post.id}">
            <i class="fas fa-trash"></i> Delete Post
          </a>
        </div>
      </div>
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
            <span class="like-count">${post.likes || 0}</span>
          </span>
          <span class="comment-btn">
            <i class="fas fa-comment"></i> 
            <span class="comment-count">${post.commentCount || 0}</span>
          </span>
          <span class="post-time"><i class="far fa-clock"></i> ${timeDisplay}</span>
        </div>
        <div class="post-author">
          <img src="${post.author ? post.author.avatar : '../img/default-avatar.jpg'}" alt="${post.author ? post.author.name : 'User'}" class="author-avatar">
          <span class="author-name">${post.author ? post.author.name : 'User'}</span>
        </div>
      </div>
    </div>
  `;
  
  // Add click event to open post details modal
  postCard.addEventListener('click', (e) => {
    // Don't trigger when clicking specific elements
    if (
      e.target.closest('.post-actions') ||
      e.target.closest('.edit-post') ||
      e.target.closest('.delete-post') ||
      e.target.closest('.like-btn') ||
      e.target.closest('.comment-btn')
    ) {
      return;
    }
    
    openPostDetailsModal(post);
  });
  
  // Add event listeners for post actions
  const actionButton = postCard.querySelector('.post-actions');
  const dropdown = postCard.querySelector('.post-actions-dropdown');
  
  actionButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
  
  // Close dropdown when clicking elsewhere
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
  
  // Edit and delete functionality
  const editBtn = postCard.querySelector('.edit-post');
  const deleteBtn = postCard.querySelector('.delete-post');
  
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openEditPostModal(post.id);
  });
  
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDeletePost(post.id);
  });
  
  // Like button functionality
  const likeBtn = postCard.querySelector('.like-btn');
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleLike(post.id, likeBtn);
  });
  
  // Comment button functionality
  const commentBtn = postCard.querySelector('.comment-btn');
  commentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPostDetailsModal(post, true); // true = focus on comments
  });
  
  // Add image error handling
  const postImg = postCard.querySelector('.post-image img');
  postImg.onerror = function() {
    this.src = '/img/social-media/default-post.jpg';
  };
  
  return postCard;
}

// Update the openPostDetailsModal function

function openPostDetailsModal(post) {
  console.log("Opening post detail modal for:", post.id);
  
  // Check if modal already exists
  let modal = document.getElementById('post-details-modal');
  
  // Create modal if it doesn't exist
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'post-details-modal';
    document.body.appendChild(modal);
    console.log("Created new modal element");
  }
  
  // Format post date for display
  const timeDisplay = formatRelativeTime(post.date);
  
  // Check if user has liked this post
  const userId = localStorage.getItem('userId');
  const hasLiked = post.likedBy && post.likedBy.includes(userId);
  
  // Set modal content
  modal.innerHTML = `
    <div class="modal-content post-details-content">
      <span class="close-btn">&times;</span>
      <div class="post-details-grid">
        <div class="post-details-image">
          <img src="${post.images[0]}" alt="${post.title}">
        </div>
        <div class="post-details-info">
          <div class="post-details-header">
            <div class="post-author">
              <img src="${post.author ? post.author.avatar : '../img/default-avatar.jpg'}" alt="${post.author ? post.author.name : 'User'}" class="author-avatar">
              <span class="author-name">${post.author ? post.author.name : 'User'}</span>
            </div>
            <div class="post-actions">
              <i class="fas fa-ellipsis-v"></i>
              <div class="post-actions-dropdown">
                <a href="#" class="edit-post" data-post-id="${post.id}">
                  <i class="fas fa-edit"></i> Edit Post
                </a>
                <a href="#" class="delete-post" data-post-id="${post.id}">
                  <i class="fas fa-trash"></i> Delete Post
                </a>
              </div>
            </div>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <div class="post-location">
            <i class="fas fa-map-marker-alt"></i>
            ${post.location.city}, ${post.location.state}
          </div>
          <p class="post-description">${post.description}</p>
          
          <div class="post-stats">
            <span class="like-btn ${hasLiked ? 'liked' : ''}">
              <i class="fas fa-heart"></i> 
              <span class="like-count">${post.likes || 0}</span>
            </span>
            <span class="comment-btn">
              <i class="fas fa-comment"></i> 
              <span class="comment-count">${post.commentCount || 0}</span>
            </span>
            <span class="post-time"><i class="far fa-clock"></i> ${timeDisplay}</span>
          </div>
          
          <div class="comments-section">
            <div class="comments-container">
              <p class="loading-comments">Loading comments...</p>
            </div>
            <div class="comment-form">
              <textarea placeholder="Add a comment..." class="comment-input"></textarea>
              <button class="comment-submit">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Display the modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  console.log("Modal displayed");
  
  // Close modal functionality
  const closeBtn = modal.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    console.log("Modal closed");
  });
  
  // Add click outside to close functionality
  window.addEventListener('click', function windowClickHandler(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      console.log("Modal closed by outside click");
      // Remove event listener to prevent memory leaks
      window.removeEventListener('click', windowClickHandler);
    }
  });
  
  // Add like functionality
  const likeBtn = modal.querySelector('.like-btn');
  likeBtn.addEventListener('click', () => {
    handleLike(post.id, likeBtn);
  });
  
  // Load comments
  loadComments(post.id, modal.querySelector('.comments-container'));
  
  // Add comment functionality
  const commentSubmit = modal.querySelector('.comment-submit');
  commentSubmit.addEventListener('click', () => {
    const commentInput = modal.querySelector('.comment-input');
    const commentText = commentInput.value.trim();
    
    if (commentText) {
      addComment(post.id, commentText, modal);
      commentInput.value = '';
    }
  });
  
  // Add edit and delete functionality
  const editBtn = modal.querySelector('.edit-post');
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'none';
    openEditPostModal(post.id);
  });
  
  const deleteBtn = modal.querySelector('.delete-post');
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePost(post.id);
      modal.style.display = 'none';
    }
  });
}

// Add function to load comments
async function loadComments(postId, container) {
  try {
    container.innerHTML = '<p class="loading-comments">Loading comments...</p>';
    
    const response = await fetch(`/api/posts/${postId}/comments`);
    const data = await response.json();
    
    if (response.ok) {
      container.innerHTML = '';
      
      if (data.comments && data.comments.length > 0) {
        data.comments.forEach(comment => {
          const commentElement = createCommentElement(comment);
          container.appendChild(commentElement);
        });
      } else {
        container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
      }
    } else {
      container.innerHTML = '<p class="error-message">Error loading comments.</p>';
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    container.innerHTML = '<p class="error-message">Error loading comments.</p>';
  }
}

// Function to handle post likes
async function handleLike(postId, likeButton) {
  try {
    // Show visual feedback immediately
    likeButton.style.opacity = '0.5';
    
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: postId,
        userId: localStorage.getItem('userId') || 'anonymous'
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
    }
  } catch (error) {
    console.error('Error liking post:', error);
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
        userId: localStorage.getItem('userId') || 'anonymous',
        userName: localStorage.getItem('username') || 'Guest User',
        userAvatar: localStorage.getItem('profileImage') || '../img/social-media/avatar1.jpg',
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
  const isCurrentUserComment = comment.userId === localStorage.getItem('userId');
  
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
        userId: localStorage.getItem('userId')
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

// Format relative time
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

// Set up all event listeners
function setupEventListeners() {
  // Bio edit functionality
  const editBioBtn = document.getElementById('edit-bio-btn');
  const bioDisplay = document.getElementById('bio-display');
  const bioEdit = document.getElementById('bio-edit');
  const cancelBioBtn = document.getElementById('cancel-bio');
  const saveBioBtn = document.getElementById('save-bio');
  
  editBioBtn.addEventListener('click', () => {
    // Load the most recent profile image if available
    const profileImage = localStorage.getItem('profileImage');
    if (profileImage) {
        syncProfileImage(profileImage);
    }
    
    bioDisplay.style.display = 'none';
    bioEdit.style.display = 'block';
    document.getElementById('bio-text').focus();
  });
  
  cancelBioBtn.addEventListener('click', () => {
    bioDisplay.style.display = 'block';
    bioEdit.style.display = 'none';
    document.getElementById('bio-text').value = document.getElementById('user-bio').textContent;
  });
  
  saveBioBtn.addEventListener('click', () => {
    const newBio = document.getElementById('bio-text').value.trim();
    document.getElementById('user-bio').textContent = newBio;
    localStorage.setItem('userBio', newBio);
    
    bioDisplay.style.display = 'block';
    bioEdit.style.display = 'none';
  });
  
  // Create post modal
  const createPostBtn = document.getElementById('create-post-btn');
  const createFirstPostBtn = document.getElementById('create-first-post');
  const createPostModal = document.getElementById('create-post-modal');
  const closeModalBtn = document.querySelector('.close-btn');
  const cancelPostBtn = document.querySelector('.cancel-btn');
  
  // Open modal function
  function openCreateModal() {
    createPostModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close modal function
  function closeCreateModal() {
    createPostModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    document.getElementById('post-form').reset();
    document.getElementById('image-preview').innerHTML = '';
  }
  
  createPostBtn.addEventListener('click', openCreateModal);
  createFirstPostBtn.addEventListener('click', openCreateModal);
  closeModalBtn.addEventListener('click', closeCreateModal);
  cancelPostBtn.addEventListener('click', closeCreateModal);
  
  // Close modal if clicked outside
  window.addEventListener('click', (e) => {
    if (e.target === createPostModal) {
      closeCreateModal();
    }
  });
  
  // Image upload functionality for create post modal
  setupImageUpload('post-images', 'image-preview');
  
  // Form submission for create post
  const postForm = document.getElementById('post-form');
  postForm.addEventListener('submit', async (e) => {
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
        
        // Close modal and reset form
        closeCreateModal();
        
        // Reload posts to show the new one
        loadUserPosts();
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
  
  // Edit post modal
  const editPostModal = document.getElementById('edit-post-modal');
  const closeEditBtn = document.getElementById('close-edit-modal');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const deletePostBtn = document.getElementById('delete-post-btn');
  
  // Close edit modal function
  function closeEditModal() {
    editPostModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  closeEditBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  
  // Close if clicked outside
  window.addEventListener('click', (e) => {
    if (e.target === editPostModal) {
      closeEditModal();
    }
  });
  
  // Image upload for edit modal
  setupImageUpload('edit-post-images', 'edit-image-preview');
  
  // Edit post form submission
  const editPostForm = document.getElementById('edit-post-form');
  editPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updatePost();
    closeEditModal();
  });
  
  // Delete post button in modal
  deletePostBtn.addEventListener('click', () => {
    const postId = document.getElementById('edit-post-id').value;
    deletePost(postId);
    closeEditModal();
  });
  
  // Sign Out button
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // This would normally clear authentication tokens
      alert('You have been logged out.');
      // Redirect to home page or login page
      window.location.href = '../index.html';
    });
  }
}

// Image upload functionality
function setupImageUpload(inputId, previewId) {
  const imageInput = document.getElementById(inputId);
  const imagePreview = document.getElementById(previewId);
  const imageUploadBox = imageInput.closest('.image-upload-box');
  
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
    imageUploadBox.addEventListener(eventName, () => {
      imageUploadBox.classList.add('highlighted');
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    imageUploadBox.addEventListener(eventName, () => {
      imageUploadBox.classList.remove('highlighted');
    });
  });
  
  imageUploadBox.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });
  
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
}

// Open edit post modal
function openEditPostModal(postId) {
  // Fetch post data from API
  fetchPostDetails(postId).then(post => {
    if (!post) {
      alert('Post not found!');
      return;
    }
    
    // Populate form fields
    document.getElementById('edit-post-id').value = post.id;
    document.getElementById('edit-post-title').value = post.title;
    document.getElementById('edit-post-state').value = post.location.state;
    document.getElementById('edit-post-city').value = post.location.city;
    document.getElementById('edit-post-description').value = post.description;
    document.getElementById('edit-post-tags').value = post.tags ? post.tags.join(', ') : '';
    
    // Clear previous images
    document.getElementById('edit-image-preview').innerHTML = '';
    
    // Show current images
    const currentImagesContainer = document.getElementById('current-images');
    currentImagesContainer.innerHTML = '';
    
    post.images.forEach((imgSrc, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'current-image-container';
      imgContainer.innerHTML = `
        <img src="${imgSrc}" class="current-image" alt="Current image ${index + 1}">
        <div class="remove-current-image" data-index="${index}">&times;</div>
      `;
      
      currentImagesContainer.appendChild(imgContainer);
    });
    
    // Add remove functionality for current images
    document.querySelectorAll('.remove-current-image').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        post.images.splice(index, 1);
        btn.parentElement.remove();
      });
    });
    
    // Show edit modal
    document.getElementById('edit-post-modal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
}

// Fetch post details from API for editing
async function fetchPostDetails(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching post details:', error);
    return null;
  }
}

// Update post
async function updatePost() {
  const postId = document.getElementById('edit-post-id').value;
  
  // Create FormData for updating post
  const formData = new FormData();
  
  // Add form fields
  formData.append('postId', postId);
  formData.append('title', document.getElementById('edit-post-title').value);
  formData.append('state', document.getElementById('edit-post-state').value);
  formData.append('city', document.getElementById('edit-post-city').value);
  formData.append('description', document.getElementById('edit-post-description').value);
  formData.append('tags', document.getElementById('edit-post-tags').value);
  
  // Add any new image files
  const imageInput = document.getElementById('edit-post-images');
  if (imageInput.files.length > 0) {
    for (let i = 0; i < imageInput.files.length; i++) {
      formData.append('newImages', imageInput.files[i]);
    }
  }
  
  // Get current images (remaining after any deletions)
  const currentImages = [];
  document.querySelectorAll('.current-image').forEach(img => {
    currentImages.push(img.src);
  });
  
  // Add current images to form data as JSON string
  formData.append('currentImages', JSON.stringify(currentImages));
  
  try {
    // Show loading indicator
    const submitBtn = document.querySelector('#edit-post-form .submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    // Send to server
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Your post has been updated successfully!');
      loadUserPosts(); // Reload posts to show updates
    } else {
      throw new Error(data.message || 'Failed to update post');
    }
  } catch (error) {
    console.error('Error updating post:', error);
    alert('Error updating post: ' + error.message);
  } finally {
    // Reset button
    const submitBtn = document.querySelector('#edit-post-form .submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

// Confirm delete post
function confirmDeletePost(postId) {
  if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
    deletePost(postId);
  }
}

// Delete post
async function deletePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId')
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Post deleted successfully');
      loadUserPosts(); // Reload posts to remove the deleted one
    } else {
      throw new Error(data.message || 'Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Error deleting post: ' + error.message);
  }
}

// For both dashboard.js and profile.js
function syncProfileImage(imageUrl) {
    console.log("Syncing profile image:", imageUrl);
    
    // Update localStorage
    localStorage.setItem('profileImage', imageUrl);
    
    // Update all visible profile images on the page
    const profileImages = document.querySelectorAll('.profile-pic, #profile-avatar, #profileImage, #nav-profile-pic');
    profileImages.forEach(img => {
        if (img) {
            console.log("Updating image element:", img.id || "unnamed element");
            img.src = imageUrl;
        }
    });
}

// Format date utility
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Add this diagnostic function to help with debugging

// Debug helper function
function checkModalFunctionality() {
  console.log("Checking modal functionality...");
  
  // Check if we have posts displayed
  const posts = document.querySelectorAll('.post-card');
  console.log(`Found ${posts.length} posts on the page`);
  
  if (posts.length > 0) {
    console.log("Setting up click listeners for debugging");
    posts.forEach((post, index) => {
      console.log(`Post ${index + 1} id: ${post.dataset.postId}`);
      post.style.border = '2px solid red'; // Temporarily highlight posts for debugging
      
      // Re-apply click handler for testing
      post.addEventListener('click', function() {
        console.log(`Clicked on post ${index + 1} with ID ${this.dataset.postId}`);
        
        // Try to get the post data
        getUserPostById(this.dataset.postId).then(postData => {
          if (postData) {
            console.log("Found post data:", postData);
            openPostDetailsModal(postData);
          } else {
            console.error("Could not find post data");
          }
        });
      });
    });
  }
}

// Helper to get post by ID
async function getUserPostById(postId) {
  const userPosts = await getUserPosts();
  return userPosts.find(post => post.id.toString() === postId.toString());
}

// Add a button for diagnostic purposes
window.addEventListener('load', function() {
  const postsSection = document.querySelector('.profile-posts-section');
  if (postsSection) {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Posts';
    debugBtn.style.display = 'none'; // Hide button but make it available in console
    debugBtn.onclick = checkModalFunctionality;
    postsSection.appendChild(debugBtn);
    
    // Store for access in console
    window.debugPostsBtn = debugBtn;
  }
});
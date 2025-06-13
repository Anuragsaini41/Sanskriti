// Toggle dropdown visibility
document.getElementById('accountBtn').addEventListener('click', function () {
    const dropdown = document.getElementById('dropdownContent');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Check if user is logged in
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('signupLink').style.display = 'none';
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('userName').style.display = 'block';
    document.getElementById('userDisplayName').textContent = username;
}

// Sign out logic
document.getElementById('signOutBtn').addEventListener('click', function () {
    localStorage.removeItem('username'); // Clear user data
    document.getElementById('signupLink').style.display = 'block';
    document.getElementById('loginLink').style.display = 'block';
    document.getElementById('userName').style.display = 'none';
    document.getElementById('dropdownContent').style.display = 'none';
    window.location.href = 'index.html'; // Redirect to the main page
});


document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Please log in to access the dashboard.');
        window.location.href = '../auth/login.html';
        return;
    }

    
    const localProfileImage = localStorage.getItem('profileImage');
    if (localProfileImage) {
        document.getElementById('profileImage').src = localProfileImage;
    }

    try {
        const response = await fetch(`/user/${username}`);
        if (response.ok) {
            const user = await response.json();

            
            document.querySelector('.profile h2').textContent = user.fullName;
            
            
            if (!localProfileImage) {
                const profileImage = user.profileImage || '../img/noprofile.jpg';
                document.getElementById('profileImage').src = profileImage;
            }

            
            document.querySelector('.profile .links').innerHTML = `
              <li>Email: ${user.email}</li>
              <li>Phone: ${user.phone}</li>
              <li>City: ${user.city}, ${user.state}</li>
              <li>Country: ${user.country}</li>
            `;
        } else {
            alert('Failed to fetch user details');
        }
    } catch (err) {
        console.error('Error fetching user details:', err);
    }
});

// Handle image upload
document.getElementById('addImageBtn').addEventListener('click', function () {
    document.getElementById('imageUpload').click(); // Trigger file input click
});

document.getElementById('imageUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        // For local preview and localStorage storage
        const reader = new FileReader();
        reader.onload = function(e) {
            // Update the dashboard image
            document.getElementById('profileImage').src = e.target.result;
            
            // Store the image data in localStorage for social media profile
            localStorage.setItem('profileImage', e.target.result);
            
            // Sync profile image across the page
            syncProfileImage(e.target.result);
        };
        reader.readAsDataURL(file);
        
        // For server upload - use FormData instead of JSON
        try {
            const username = localStorage.getItem('username');
            if (username) {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('profileImage', file);
                
                fetch('/update-profile-image', {
                    method: 'POST',
                    
                    body: formData
                });
            }
        } catch (err) {
            console.error('Could not update profile image on server:', err);
        }
    }
});

// Redirect to Edit Profile Page
document.getElementById('editProfileBtn').addEventListener('click', function () {
  window.location.href = './edit-profile.html';
});

// Update Cart Info on Dashboard
function updateCartInfo() {
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartInfo = document.getElementById('cartInfo');

    // Update the paragraph with the number of items in the cart
    cartInfo.textContent = `You have ${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart.`;
}

// Redirect to Cart Page
document.getElementById('goToCartBtn').addEventListener('click', function () {
    window.location.href = '../marketplace/market-cart.html';
});

// Call the function to update cart info when the page loads
document.addEventListener('DOMContentLoaded', updateCartInfo);

// For both dashboard.js and profile.js
function syncProfileImage(imageUrl) {
    // Update localStorage
    localStorage.setItem('profileImage', imageUrl);
    
    // Update all visible profile images on the page
    const profileImages = document.querySelectorAll('.profile-pic, #profile-avatar, #profileImage, #nav-profile-pic');
    profileImages.forEach(img => {
        if (img) img.src = imageUrl;
    });
}

// Function to display user bookings
function displayUserBookings() {
    const bookingsContainer = document.querySelector('.bookings');
    const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    
    if (!bookingsContainer) return;
    
    // Clear existing content
    bookingsContainer.innerHTML = '<h2>Your Bookings</h2>';
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML += '<p class="no-bookings">You have no bookings yet.</p>';
        return;
    }
    
    const bookingsList = document.createElement('div');
    bookingsList.className = 'bookings-list';
    
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
        
        // Calculate number of nights
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        bookingCard.innerHTML = `
            <div class="booking-image">
                <img src="${booking.hotelImage}" alt="${booking.hotelName}">
            </div>
            <div class="booking-details">
                <h3>${booking.hotelName}</h3>
                <p class="booking-location"><i class="fas fa-map-marker-alt"></i> ${booking.location}</p>
                <div class="booking-dates">
                    <div class="date-group">
                        <p class="date-label">Check-in</p>
                        <p class="date-value">${formatDate(booking.checkInDate)}</p>
                    </div>
                    <div class="date-separator">•</div>
                    <div class="date-group">
                        <p class="date-label">Check-out</p>
                        <p class="date-value">${formatDate(booking.checkOutDate)}</p>
                    </div>
                </div>
                <div class="booking-info">
                    <p><strong>Room:</strong> ${booking.roomType}</p>
                    <p><strong>Guests:</strong> ${booking.guests}</p>
                    <p><strong>Stay:</strong> ${nights} night${nights !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <div class="booking-price">
                <p class="price">${booking.price}</p>
                <button class="cancel-booking-btn" data-id="${booking.id}">Cancel Booking</button>
            </div>
        `;
        
        bookingsList.appendChild(bookingCard);
    });
    
    bookingsContainer.appendChild(bookingsList);
    
    // Add cancel booking functionality
    document.querySelectorAll('.cancel-booking-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            cancelBooking(bookingId);
        });
    });
}

// Helper function to format date in more readable format
function formatDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to cancel a booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Get existing bookings
        const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
        
        // Remove the booking with matching ID
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        
        // Update localStorage
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        
        // Refresh the bookings display
        displayUserBookings();
    }
}


function updateBookingsInfo() {
   
    const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    const bookingsInfo = document.getElementById('bookingsInfo');

    if (bookingsInfo) {
        
        bookingsInfo.textContent = `You have ${bookings.length} hotel booking${bookings.length !== 1 ? 's' : ''}.`;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    updateCartInfo();  
    updateBookingsInfo(); 
    
   
    const goToBookingsBtn = document.getElementById('goToBookingsBtn');
    if (goToBookingsBtn) {
        goToBookingsBtn.addEventListener('click', function() {
            window.location.href = '../hotel/hotel-bookings.html';  // नए बुकिंग्स पेज पर रीडायरेक्ट
        });
    }
});
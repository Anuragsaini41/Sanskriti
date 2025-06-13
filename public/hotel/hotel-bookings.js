document.addEventListener('DOMContentLoaded', function() {
    displayBookings();
});

function displayBookings() {
    const bookingsListContainer = document.getElementById('bookingsList');
    const emptyBookingsContainer = document.getElementById('emptyBookings');
    
    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    
    if (bookings.length === 0) {
        // Show empty state
        if (emptyBookingsContainer) emptyBookingsContainer.style.display = 'block';
        if (bookingsListContainer) bookingsListContainer.innerHTML = '';
        return;
    }
    
    // Hide empty state, show bookings
    if (emptyBookingsContainer) emptyBookingsContainer.style.display = 'none';
    
    if (bookingsListContainer) {
        bookingsListContainer.innerHTML = ''; // Clear existing content
        
        bookings.forEach(booking => {
            // Calculate number of nights
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            // Format dates
            const checkInFormatted = formatDate(booking.checkInDate);
            const checkOutFormatted = formatDate(booking.checkOutDate);
            
            const bookingCard = document.createElement('div');
            bookingCard.className = 'booking-card';
            
            bookingCard.innerHTML = `
                <div class="booking-image">
                    <img src="${booking.hotelImage}" alt="${booking.hotelName}">
                </div>
                <div class="booking-details">
                    <h3 class="booking-hotel-name">${booking.hotelName}</h3>
                    <p class="booking-location"><i class="fas fa-map-marker-alt"></i> ${booking.location}</p>
                    
                    <div class="booking-info-grid">
                        <div class="booking-info-item">
                            <span class="booking-info-label">Check-in</span>
                            <span class="booking-info-value">${checkInFormatted}</span>
                        </div>
                        
                        <div class="booking-info-item">
                            <span class="booking-info-label">Check-out</span>
                            <span class="booking-info-value">${checkOutFormatted}</span>
                        </div>
                        
                        <div class="booking-info-item">
                            <span class="booking-info-label">Room Type</span>
                            <span class="booking-info-value">${booking.roomType}</span>
                        </div>
                        
                        <div class="booking-info-item">
                            <span class="booking-info-label">Guests</span>
                            <span class="booking-info-value">${booking.guests}</span>
                        </div>
                        
                        <div class="booking-info-item">
                            <span class="booking-info-label">Stay Duration</span>
                            <span class="booking-info-value">${nights} night${nights !== 1 ? 's' : ''}</span>
                        </div>
                        
                        <div class="booking-info-item">
                            <span class="booking-info-label">Booking Date</span>
                            <span class="booking-info-value">${formatDate(booking.bookingDate)}</span>
                        </div>
                    </div>
                    
                    <div class="booking-price-section">
                        <div class="booking-price">
                            <span class="price-label">Total Price</span>
                            <span class="price-value">${booking.price}</span>
                        </div>
                        <button class="cancel-booking-btn" data-id="${booking.id}">Cancel Booking</button>
                    </div>
                </div>
            `;
            
            bookingsListContainer.appendChild(bookingCard);
        });
        
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-booking-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookingId = this.getAttribute('data-id');
                cancelBooking(bookingId);
            });
        });
    }
}

function formatDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Get existing bookings
        const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
        
        // Remove the booking with matching ID
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        
        // Update localStorage
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        
        // Refresh the display
        displayBookings();
        
        // Show success message
        alert('Your booking has been cancelled successfully.');
    }
}
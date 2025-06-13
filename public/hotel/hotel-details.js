document.addEventListener('DOMContentLoaded', function() {
    // Load selected hotel details
    const selectedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
    
    if (selectedHotel) {
        console.log("Loading hotel:", selectedHotel.name, selectedHotel.location);
        
        
        document.title = selectedHotel.name + ' | Sanskriti Hotels';
        
        
        const breadcrumbSpan = document.querySelector('.breadcrumb span');
        if (breadcrumbSpan) {
            breadcrumbSpan.textContent = selectedHotel.name;
        }
        
       
        let city = "Delhi";
        if (selectedHotel.location.includes("Mumbai")) {
            city = "Mumbai";
        } else if (selectedHotel.location.includes("Goa")) {
            city = "Goa";
        } else if (selectedHotel.location.includes("Jaipur")) {
            city = "Jaipur";
        }
        
        
        const cityLink = document.querySelector('.breadcrumb a:nth-child(3)');
        if (cityLink) {
            cityLink.textContent = city;
        }
        
        
        const hotelTitle = document.querySelector('.hotel-title-area h1');
        if (hotelTitle) {
            hotelTitle.textContent = selectedHotel.name;
        }
        
        
        const hotelLocation = document.querySelector('.hotel-meta .hotel-location');
        if (hotelLocation) {
            hotelLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${selectedHotel.location}`;
        }
        
        
        const mainImage = document.querySelector('.gallery-main img');
        if (mainImage) {
            mainImage.src = selectedHotel.image;
            mainImage.alt = selectedHotel.name;
        }
        
        
        const thumbnail = document.querySelector('.thumbnail.active img');
        if (thumbnail) {
            thumbnail.src = selectedHotel.image;
            thumbnail.alt = selectedHotel.name;
        }
        
       
        const priceDisplay = document.querySelector('.price-display .current-price');
        if (priceDisplay) {
            priceDisplay.textContent = selectedHotel.price;
        }
        
        
        const hotelDescription = document.querySelector('.info-section p:first-of-type');
        if (hotelDescription) {
            if (city === "Mumbai") {
                hotelDescription.textContent = `Experience luxury and elegance at ${selectedHotel.name}, located in the heart of Mumbai. This magnificent hotel offers breathtaking views of the Arabian Sea, world-class dining options, and luxurious accommodations. With its prime location near Marine Drive and Gateway of India, guests can easily explore Mumbai's iconic landmarks.`;
            } else if (city === "Goa") {
                hotelDescription.textContent = `Escape to paradise at ${selectedHotel.name}, a stunning beachfront property in Goa. This beautiful resort offers direct beach access, lush tropical gardens, and spacious accommodations with modern amenities. Enjoy Goan cuisine, refreshing cocktails by the pool, and the perfect blend of relaxation and adventure.`;
            }
        }
        
        
        const locationAddress = document.querySelector('.map-overlay p');
        if (locationAddress) {
            if (city === "Mumbai") {
                locationAddress.textContent = "Apollo Bunder Road, Colaba, Mumbai";
            } else if (city === "Goa") {
                locationAddress.textContent = "Candolim Beach Road, North Goa";
            } else {
                locationAddress.textContent = "2 Sardar Patel Marg, Diplomatic Enclave, New Delhi";
            }
        }
        
        
        const attractionsList = document.querySelector('.attractions-list');
        if (attractionsList && city === "Mumbai") {
            attractionsList.innerHTML = `
                <li><i class="fas fa-monument"></i> <span>Gateway of India</span> <strong>1.2 km</strong></li>
                <li><i class="fas fa-water"></i> <span>Marine Drive</span> <strong>3.5 km</strong></li>
                <li><i class="fas fa-landmark"></i> <span>Elephanta Caves</span> <strong>10 km</strong></li>
                <li><i class="fas fa-store"></i> <span>Colaba Causeway</span> <strong>0.8 km</strong></li>
            `;
        } else if (attractionsList && city === "Goa") {
            attractionsList.innerHTML = `
                <li><i class="fas fa-umbrella-beach"></i> <span>Candolim Beach</span> <strong>0.2 km</strong></li>
                <li><i class="fas fa-monument"></i> <span>Fort Aguada</span> <strong>3.5 km</strong></li>
                <li><i class="fas fa-store"></i> <span>Calangute Market</span> <strong>4.2 km</strong></li>
                <li><i class="fas fa-church"></i> <span>Basilica of Bom Jesus</span> <strong>15 km</strong></li>
            `;
        }
        
        
        const similarHotelsTitle = document.querySelector('.similar-hotels .section-title');
        if (similarHotelsTitle) {
            similarHotelsTitle.textContent = `Similar Hotels in ${city}`;
        }
    }
    
    
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.gallery-main img');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            
            const thumbImg = this.querySelector('img');
            mainImage.src = thumbImg.src;
            mainImage.alt = thumbImg.alt;
            
           
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput && checkOutInput) {
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        checkInInput.min = formatDate(today);
        checkOutInput.min = formatDate(tomorrow);
        
        // Default values
        checkInInput.value = formatDate(today);
        checkOutInput.value = formatDate(tomorrow);
        
        // Ensure check-out is after check-in
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            const checkOutDate = new Date(checkOutInput.value);
            
            if (checkOutDate <= checkInDate) {
                const newCheckOutDate = new Date(checkInDate);
                newCheckOutDate.setDate(checkInDate.getDate() + 1);
                checkOutInput.value = formatDate(newCheckOutDate);
            }
            
            // Update minimum date for checkout
            const nextDay = new Date(checkInDate);
            nextDay.setDate(checkInDate.getDate() + 1);
            checkOutInput.min = formatDate(nextDay);
            
            updatePriceCalculation();
        });
        
        checkOutInput.addEventListener('change', updatePriceCalculation);
        
        function updatePriceCalculation() {
            if (!checkInInput.value || !checkOutInput.value) return;
            
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            
            if (nights <= 0) return;
            
            const basePrice = 8499; // Price per night
            const roomCharge = basePrice * nights;
            const taxRate = 0.18; // 18% tax
            const taxes = Math.round(roomCharge * taxRate);
            const discount = nights >= 3 ? 4000 : 0; // Discount for 3+ nights
            const total = roomCharge + taxes - discount;
            
            // Update price breakdown
            const priceRows = document.querySelectorAll('.price-breakdown .price-row');
            if (priceRows.length >= 4) {
                priceRows[0].innerHTML = `<span>Room Charge (${nights} nights)</span><span>₹${roomCharge.toLocaleString()}</span>`;
                priceRows[1].innerHTML = `<span>Taxes & Fees</span><span>₹${taxes.toLocaleString()}</span>`;
                priceRows[2].innerHTML = `<span>Discount</span><span>-₹${discount.toLocaleString()}</span>`;
                priceRows[3].innerHTML = `<span>Total</span><span>₹${total.toLocaleString()}</span>`;
            }
        }
        
        // Initialize price calculation
        updatePriceCalculation();
    }
    
    // Room selection functionality
    const roomSelectionBtns = document.querySelectorAll('.select-room-btn');
    const roomTypeSelect = document.getElementById('room-type');
    
    if (roomSelectionBtns.length && roomTypeSelect) {
        roomSelectionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const roomName = this.closest('.room-option-details').querySelector('h4').textContent;
                
                // Find and select the corresponding option
                for (let i = 0; i < roomTypeSelect.options.length; i++) {
                    if (roomTypeSelect.options[i].text === roomName) {
                        roomTypeSelect.selectedIndex = i;
                        break;
                    }
                }
                
                // Scroll to booking form
                document.querySelector('.booking-form').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }
    
    // Show more amenities functionality
    const showMoreAmenitiesBtn = document.querySelector('.show-more-amenities');
    if (showMoreAmenitiesBtn) {
        showMoreAmenitiesBtn.addEventListener('click', function() {
            alert('This would show all amenities in a modal in a real application.');
        });
    }
    
    // View all reviews functionality
    const viewAllReviewsBtn = document.querySelector('.view-all-reviews');
    if (viewAllReviewsBtn) {
        viewAllReviewsBtn.addEventListener('click', function() {
            alert('This would show all reviews in a dedicated page/modal in a real application.');
        });
    }
    
    // View on map functionality
    const viewMapBtn = document.querySelector('.view-map-btn');
    if (viewMapBtn) {
        viewMapBtn.addEventListener('click', function() {
            alert('This would open a full map view in a real application.');
        });
    }
    
    // Booking form submission
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('This would proceed to the payment page in a real application.');
        });
    }
    
    // Horizontal scrolling for similar hotels
    const scrollContainer = document.querySelector('.scroll-hotels');
    const scrollLeftBtn = document.querySelector('.scroll-arrow.left');
    const scrollRightBtn = document.querySelector('.scroll-arrow.right');
    
    if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
    
    // Booking functionality
    const bookNowButton = document.querySelector('.reserve-btn');
    const bookNowLargeButton = document.querySelector('.book-now-large');
    
    function handleBooking(e) {
        e.preventDefault();
        
        // Get selected hotel details
        const selectedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
        
        if (!selectedHotel) {
            alert('Hotel information not found. Please try again.');
            return;
        }
        
        // Get booking details
        const checkInDate = document.getElementById('check-in').value;
        const checkOutDate = document.getElementById('check-out').value;
        const guests = document.getElementById('guests').value;
        const roomType = document.getElementById('room-type').value;
        
        // Validation
        if (!checkInDate || !checkOutDate) {
            alert('Please select check-in and check-out dates.');
            return;
        }
        
        // Create booking object
        const booking = {
            id: Date.now().toString(), // unique ID based on timestamp
            hotelName: selectedHotel.name,
            hotelImage: selectedHotel.image,
            location: selectedHotel.location,
            price: selectedHotel.price,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests,
            roomType: roomType,
            bookingDate: new Date().toISOString().split('T')[0]
        };
        
        // Get existing bookings or initialize empty array
        const existingBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
        
        // Add new booking
        existingBookings.push(booking);
        
        // Save to localStorage
        localStorage.setItem('userBookings', JSON.stringify(existingBookings));
        
        // Show success message
        alert('Booking successful! Your booking has been added to your dashboard.');
        
        // Redirect to dashboard
        window.location.href = '../Dashboard/dashboard.html';
    }
    
    // Add event listeners to both book now buttons
    if (bookNowButton) {
        bookNowButton.addEventListener('click', handleBooking);
    }
    
    if (bookNowLargeButton) {
        bookNowLargeButton.addEventListener('click', handleBooking);
    }
});
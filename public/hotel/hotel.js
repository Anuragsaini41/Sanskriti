/* Add JavaScript to update the price display as slider moves */
function updatePriceDisplay() {
  const slider = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('currentPrice');
  
  if (slider && priceDisplay) {
    slider.addEventListener('input', function() {
      const value = this.value;
      priceDisplay.textContent = '₹' + parseInt(value).toLocaleString();
    });
  }
}

// Enhanced Hotel Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    updatePriceDisplay();
    
    // Add navbar shadow on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Heart favorite functionality
    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle heart icon and color
            const heartIcon = this.querySelector('i');
            if (heartIcon.classList.contains('far')) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                this.style.color = '#ff4757';
            } else {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                this.style.color = '#aaa';
            }
        });
    });

    // Quick filter tag selection
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.style.background = 'rgba(174, 136, 97, 0.3)';
            } else {
                this.style.background = 'rgba(255, 255, 255, 0.25)';
            }
        });
    });

    // Destination cards click
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(card => {
        card.addEventListener('click', function() {
            const destination = this.querySelector('h3').textContent;
            console.log(`Exploring: ${destination}`);
            // Redirect to destination page in a real app
        });
    });

    // Book Now buttons functionality
    const bookButtons = document.querySelectorAll('.book-now-btn');
    
    bookButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get hotel details from the parent card
            const hotelCard = this.closest('.hotel-card');
            
            if (!hotelCard) {
                console.error("Hotel card not found");
                return;
            }
            
            const hotelName = hotelCard.querySelector('.hotel-title').textContent;
            const hotelImage = hotelCard.querySelector('.hotel-image img').src;
            const hotelPrice = hotelCard.querySelector('.price-amount').textContent;
            const hotelLocation = hotelCard.querySelector('.hotel-location').textContent.trim();
            const hotelRating = hotelCard.querySelector('.hotel-rating').innerHTML;
            
            console.log("Selected hotel:", hotelName, hotelLocation, hotelImage);
            
            // Store hotel details in localStorage
            const hotelDetails = {
                name: hotelName,
                image: hotelImage,
                price: hotelPrice,
                location: hotelLocation,
                rating: hotelRating
            };
            
            localStorage.setItem('selectedHotel', JSON.stringify(hotelDetails));
            
            // Redirect to hotel-details.html
            window.location.href = 'hotel-details.html';
        });
    });

    // Simple date picker functionality (basic example)
    const dateInputs = document.querySelectorAll('.search-input input[placeholder="Check-in"], .search-input input[placeholder="Check-out"]');
    
    // Just a placeholder - in a real app, use a proper date picker library
    dateInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.type = 'date';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.type = 'text';
            }
        });
    });

    // Image loading animation
    const images = document.querySelectorAll('.hotel-image img, .destination-image img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = 1;
        });
        
        if (img.complete) {
            img.style.opacity = 1;
        } else {
            img.style.opacity = 0;
        }
    });

    // Sticky filter functionality
    window.addEventListener('scroll', function() {
        const filterOptions = document.querySelector('.filter-options');
        const filterPositionTop = filterOptions.getBoundingClientRect().top;
        
        if (filterPositionTop <= 70 && window.innerWidth > 992) {
            filterOptions.classList.add('sticky');
        } else {
            filterOptions.classList.remove('sticky');
        }
    });

    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const hotelGrid = document.querySelector('.hotel-grid');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get view type
            const viewType = this.getAttribute('data-view');
            
            // Toggle grid/list view
            if (viewType === 'list') {
                hotelGrid.classList.add('list-view');
            } else {
                hotelGrid.classList.remove('list-view');
            }
        });
    });

    // Sorting functionality
    document.getElementById('sort-options').addEventListener('change', function() {
        const sortBy = this.value;
        const hotelCards = Array.from(document.querySelectorAll('.hotel-card'));
        
        switch(sortBy) {
            case 'price-low':
                hotelCards.sort((a, b) => {
                    const priceA = parseInt(a.querySelector('.amount').innerText.replace(/[^\d]/g, ''));
                    const priceB = parseInt(b.querySelector('.amount').innerText.replace(/[^\d]/g, ''));
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                hotelCards.sort((a, b) => {
                    const priceA = parseInt(a.querySelector('.amount').innerText.replace(/[^\d]/g, ''));
                    const priceB = parseInt(b.querySelector('.amount').innerText.replace(/[^\d]/g, ''));
                    return priceB - priceA;
                });
                break;
            case 'rating':
                hotelCards.sort((a, b) => {
                    const ratingA = a.querySelector('.reviews').innerText.replace(/[()]/g, '');
                    const ratingB = b.querySelector('.reviews').innerText.replace(/[()]/g, '');
                    return parseInt(ratingB) - parseInt(ratingA);
                });
                break;
            default:
                // Default sorting (recommended)
                return;
        }
        
        // Clear the hotel grid
        hotelGrid.innerHTML = '';
        
        // Add sorted hotel cards back to the grid
        hotelCards.forEach(card => {
            hotelGrid.appendChild(card);
        });
    });
    
    // Price range slider functionality
    const priceSlider = document.querySelector('.price-range input[type="range"]');
    const currentPrice = document.querySelector('.current-price');
    
    if (priceSlider && currentPrice) {
      priceSlider.addEventListener('input', function() {
        currentPrice.textContent = '₹' + this.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      });
    }
    
    // Favorite button functionality
    const favoriteHotelButtons = document.querySelectorAll('.favorite-btn');
    favoriteHotelButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('active');
        
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
          icon.classList.remove('far');
          icon.classList.add('fas');
        } else {
          icon.classList.remove('fas');
          icon.classList.add('far');
        }
      });
    });
    
    // Filter reset button
    const resetButton = document.querySelector('.reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        
        if (priceSlider) {
          priceSlider.value = priceSlider.getAttribute('min');
          currentPrice.textContent = '₹' + priceSlider.getAttribute('min').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        const guestRatingSelect = document.querySelector('.guest-rating select');
        if (guestRatingSelect) {
          guestRatingSelect.selectedIndex = 0;
        }
      });
    }
});
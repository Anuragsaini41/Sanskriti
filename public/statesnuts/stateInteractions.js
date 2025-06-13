// Handle all interactive elements
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeGallery();
    initializeMapInteractions();

    // Handle cuisine filters
    const cuisineFilters = document.querySelectorAll('.cuisine-filters .filter-btn');
    cuisineFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            cuisineFilters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterCuisine(this.dataset.filter);
        });
    });

    // Handle tourist spot category filters
    const categoryFilters = document.querySelectorAll('.category-filters .category-btn');
    categoryFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryFilters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterSpots(this.dataset.category);
        });
    });

    // Handle travel info tabs
    const tabButtons = document.querySelectorAll('.info-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showTabContent(this.dataset.tab);
        });
    });
});

// Timeline scroll animation
function handleTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, {
        threshold: 0.1
    });

    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', handleTimelineAnimation);

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
}

function initializeGallery() {
    const gallery = document.querySelector('.overview-gallery');
    if (!gallery) return;

    let currentSlide = 0;
    const slides = gallery.querySelectorAll('.gallery-item');
    
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateGallery();
    }, 5000);
}

function initializeMapInteractions() {
    const map = L.map('touristMap');
    const markers = [];

    document.querySelectorAll('.place-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const spotId = this.dataset.spotId;
            highlightMarker(spotId);
        });
    });
}
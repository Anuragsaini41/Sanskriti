document.addEventListener("DOMContentLoaded", function () {
  // Simplified loader integration with clear transition flow
  const fromLoader = sessionStorage.getItem('fromLoader');
  
  if (!fromLoader && !window.location.href.includes('loader.html')) {
    // Redirect to loader without showing index page
    document.body.style.opacity = '0';
    document.body.style.visibility = 'hidden';
    sessionStorage.setItem('fromLoader', 'pending');
    window.location.href = '/loader/loader.html';
    return;
  } else if (fromLoader === 'pending') {
    // Coming from loader - make visible immediately to prevent flash
    document.body.style.visibility = 'visible'; 
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.98)';
    
    // Use one consistent transition
    document.body.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    
    // Wait for document to be fully ready
    setTimeout(function() {
      document.body.style.opacity = '1';
      document.body.style.transform = 'scale(1)';
      // Mark transition as complete
      sessionStorage.setItem('fromLoader', 'completed');
    }, 200); // Slightly longer delay for reliability
  } else {
    // Normal navigation (not from loader) - just make visible
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
  }
  
  // Initialize Lottie animation for hero section
  const heroAnimation = lottie.loadAnimation({
    container: document.getElementById('hero-animation-container'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/heroanimation.json', // Path to your animation file
    rendererSettings: {
      preserveAspectRatio: 'xMidYMax slice' // Changed from 'xMidYMid slice' to anchor bottom
    }
  });
  
  // Add women.json animation
  const womenAnimation = lottie.loadAnimation({
    container: document.getElementById('women-animation-container'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/women.json', 
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });
  
  // Slider logic
  const slides = document.querySelector(".slides");
  const slide = document.querySelectorAll(".slide");
  let currentIndex = 0;

  function showSlide(index) {
    slides.style.transform = `translateX(-${index * 100}%)`;
  }

  if (slides && slide.length > 0) {
    setInterval(function () {
      currentIndex = (currentIndex + 1) % slide.length;
      showSlide(currentIndex);
    }, 3000);
  }

  // Upload Button Logic
  const uploadButton = document.querySelector(".upload-btn");
  if (uploadButton) {
    uploadButton.addEventListener("click", function () {
      window.location.href = "./upload/UploadForm.html";
    });
  }

  // Navbar account dropdown toggle
  document.getElementById('accountBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    const dropdown = document.getElementById('dropdownContent');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdownContent');
    if (!document.getElementById('accountBtn').contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Redirect to dashboard on username click
  document.getElementById('userDisplayName').addEventListener('click', function () {
    window.location.href = './Dashboard/dashboard.html';
  });

  // Check if user is logged in
  const username = localStorage.getItem('username');
  if (username) {
    document.getElementById('signupLink').style.display = 'none';
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('userName').style.display = 'block';
    document.getElementById('userDisplayName').textContent = username;
  } else {
    document.getElementById('signupLink').style.display = 'block';
    document.getElementById('loginLink').style.display = 'block';
    document.getElementById('userName').style.display = 'none';
  }

  // Sign out logic
  document.getElementById('signOutBtn').addEventListener('click', function () {
    localStorage.removeItem('username');
    document.getElementById('signupLink').style.display = 'block';
    document.getElementById('loginLink').style.display = 'block';
    document.getElementById('userName').style.display = 'none';
    document.getElementById('dropdownContent').style.display = 'none';
    window.location.href = './index.html';
  });

  // Upcoming Festival Loader
  fetch("data/festivals.json")
    .then(response => response.json())
    .then(data => {
      const today = new Date();
      let upcomingFestival = null;

      const allFestivals = Object.values(data).flat();
      const sorted = allFestivals.sort((a, b) => new Date(a.date) - new Date(b.date));

      for (let fest of sorted) {
        const festDate = new Date(fest.date);
        if (festDate >= today) {
          upcomingFestival = fest;
          break;
        }
      }

      if (upcomingFestival) {
        const festDate = new Date(upcomingFestival.date);
        const formattedDate = `${festDate.getDate()} ${festDate.toLocaleString('default', { month: 'short' })}, ${festDate.getFullYear()}`;

        const thankYouContainer = document.querySelector("#thank-you .thankyou-content");

        if (thankYouContainer) {
          thankYouContainer.innerHTML = `
            <div class="professor-details">
              <h1>Upcoming Festival: ${formattedDate}</h1>
              <h3>${upcomingFestival.name}: A Festival of Joy and Tradition</h3>
              <p>${upcomingFestival.description}</p>
              
              <div class="festival-countdown">
                <div class="countdown-item">
                  <div class="countdown-number" id="countdown-days">--</div>
                  <div class="countdown-label">Days</div>
                </div>
                <div class="countdown-item">
                  <div class="countdown-number" id="countdown-hours">--</div>
                  <div class="countdown-label">Hours</div>
                </div>
                <div class="countdown-item">
                  <div class="countdown-number" id="countdown-mins">--</div>
                  <div class="countdown-label">Minutes</div>
                </div>
                <div class="countdown-item">
                  <div class="countdown-number" id="countdown-secs">--</div>
                  <div class="countdown-label">Seconds</div>
                </div>
              </div>
              
              <a href="./festivals/all-festivals.html" class="view-all-festivals">View All Festivals</a>
            </div>
            <div id="festival-image-container">
              <img id="festival-image" src="img/${upcomingFestival.image}" alt="${upcomingFestival.name}">
            </div>
          `;
          
          // Initialize countdown timer
          initFestivalCountdown(festDate);
        }
      }
    })
    .catch(err => console.error("Failed to load festivals:", err));

  // Add this function to initialize the countdown timer
  function initFestivalCountdown(targetDate) {
    // Update the countdown every second
    const countdownTimer = setInterval(function() {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Display the result
      document.getElementById("countdown-days").textContent = days;
      document.getElementById("countdown-hours").textContent = hours;
      document.getElementById("countdown-mins").textContent = minutes;
      document.getElementById("countdown-secs").textContent = seconds;
      
      // If the countdown is finished, display a message
      if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById("countdown-days").textContent = "0";
        document.getElementById("countdown-hours").textContent = "0";
        document.getElementById("countdown-mins").textContent = "0";
        document.getElementById("countdown-secs").textContent = "0";
      }
    }, 1000);
  }

  // Add scroll arrows functionality
  document.querySelectorAll('.scroll-nav').forEach(function(nav) {
    const container = nav.previousElementSibling;
    const leftArrow = nav.querySelector('.scroll-left');
    const rightArrow = nav.querySelector('.scroll-right');
    
    leftArrow.addEventListener('click', function() {
      container.scrollBy({ left: -350, behavior: 'smooth' });
    });
    
    rightArrow.addEventListener('click', function() {
      container.scrollBy({ left: 350, behavior: 'smooth' });
    });
  });

  // Show More Button Functionality
  const showMoreButtons = document.querySelectorAll('.show-more-btn');
    
  showMoreButtons.forEach(button => {
      button.addEventListener('click', function() {
          const sectionId = this.getAttribute('data-section-id');
          const section = document.getElementById(sectionId);
          const hiddenTraits = section.querySelectorAll('.hidden-trait');
          const isShowing = this.classList.contains('active');
          
          hiddenTraits.forEach(trait => {
              if (!isShowing) {
                  trait.style.display = 'block';
                  trait.style.animation = 'fadeIn 0.5s ease forwards';
              } else {
                  trait.style.display = 'none';
              }
          });
          
          // Toggle button text and active class
          this.textContent = isShowing ? 'Show More' : 'Show Less';
          this.classList.toggle('active');
      });
  });
});

document.addEventListener('DOMContentLoaded', function() {
    const sections = ['traditions', 'ancient-wisdom'];
    
    sections.forEach(sectionId => {
        const container = document.querySelector(`#${sectionId} .community-container`);
        const hiddenTraits = container.querySelectorAll('.hidden-trait');
        const showMoreBtn = container.querySelector('.show-more-btn');
        
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', function() {
                hiddenTraits.forEach(trait => {
                    if (trait.style.display === 'none' || !trait.style.display) {
                        trait.style.display = 'block';
                        trait.style.animation = 'fadeIn 0.5s ease forwards';
                        this.textContent = 'Show Less';
                        this.classList.add('active');
                    } else {
                        trait.style.display = 'none';
                        this.textContent = 'Show More';
                        this.classList.remove('active');
                    }
                });
            });
        }
    });
});


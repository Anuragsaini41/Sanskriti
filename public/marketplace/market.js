// Add this at the top of your file

// Page load animation fix
window.addEventListener('load', () => {
  // Force the loaded class to be applied immediately
  document.body.classList.add('loaded');
  
  // Clear navigation marker
  sessionStorage.removeItem('navigatingTo');
});

// Ensure the page is visible if coming from another page
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  document.body.classList.add('loaded');
}

// Add to the start of your script in market.js and product-details.js
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

let currentCategory = null;
let currentIndex = 0;

function moveSlide(direction) {
  const ads = document.querySelectorAll(".ad");
  const totalAds = ads.length;
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = totalAds - 1;
  else if (currentIndex >= totalAds) currentIndex = 0;
  document.querySelector(".ad-container").style.transform = `translateX(-${
    currentIndex * 100
  }%)`;
}

// Auto-scroll functionality
function startAutoScroll() {
  setInterval(() => {
    moveSlide(1); // Move to the next slide every 2 seconds
  }, 2000);
}

// Update renderProducts function to change the heading
function renderProducts(categoryKey) {
  const container = document.getElementById("category-products-list");
  if (!container || !products[categoryKey]) return;

  // Update the heading based on the selected category
  const categoryHeading = document.querySelector(".category-products h2");
  if (categoryHeading) {
    // Convert the category key to a more readable format
    const categoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    categoryHeading.textContent = `${categoryName} Collection`;
  }

  container.innerHTML = "";
  products[categoryKey].forEach((product, index) => {
    // Make sure we have the main image and the additional images array
    const mainImage = product.image;
    const productImages = product.images || [];
    
    // Create a complete array of all images including the main image
    let allImages = [mainImage];
    productImages.forEach(img => {
      if (!allImages.includes(img)) {
        allImages.push(img);
      }
    });
    
    const item = document.createElement("div");
    item.className = "product-card";
    item.style.animationDelay = `${index * 0.08}s`; // Add staggered animation delay
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₹${product.price} <span class="product-mrp">₹${Math.round(product.price * 1.2)}</span></p>
        <div class="product-thumbnails">
          <img src="${allImages[0]}" alt="Thumbnail 1" class="thumbnail">
          <img src="${allImages[1] || allImages[0]}" alt="Thumbnail 2" class="thumbnail">
          <img src="${allImages[2] || allImages[0]}" alt="Thumbnail 3" class="thumbnail">
        </div>
      </div>
    `;
    
    // Add thumbnail click functionality
    const thumbnails = item.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, idx) => {
      thumbnail.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click from triggering
        item.querySelector('.product-image').src = allImages[idx];
      });
    });
    
    item.onclick = () => {
      const selectedProduct = {
        ...product,
        images: allImages
      };
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
      localStorage.setItem("currentCategory", categoryKey);  // Save the category
      navigateTo("product-details.html");
    };
    container.appendChild(item);
  });
}

function renderFeaturedProducts() {
  const container = document.getElementById("featured-products-list");
  if (!container) return;

  container.innerHTML = "";
  featuredProducts.forEach((product) => {
    // Make sure we have the main image and the additional images array
    const mainImage = product.image;
    const productImages = product.images || [];
    
    // Create a complete array of all images including the main image
    let allImages = [mainImage];
    productImages.forEach(img => {
      if (!allImages.includes(img)) {
        allImages.push(img);
      }
    });
    
    const item = document.createElement("div");
    item.className = "product-card";
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₹${product.price} <span class="product-mrp">₹${Math.round(product.price * 1.2)}</span></p>
        <div class="product-thumbnails">
          <img src="${allImages[0]}" alt="Thumbnail 1" class="thumbnail">
          <img src="${allImages[1] || allImages[0]}" alt="Thumbnail 2" class="thumbnail">
          <img src="${allImages[2] || allImages[0]}" alt="Thumbnail 3" class="thumbnail">
        </div>
      </div>
    `;
    
    // Add thumbnail click functionality
    const thumbnails = item.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, idx) => {
      thumbnail.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click from triggering
        item.querySelector('.product-image').src = allImages[idx];
      });
    });
    
    item.onclick = () => {
      const selectedProduct = {
        ...product,
        images: allImages
      };
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
      // Since featured products might not have a specific category, set a default
      localStorage.setItem("currentCategory", product.category || "ethnic");
      navigateTo("product-details.html");
    };
    container.appendChild(item);
  });
}

function addToCart(categoryKey, index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(products[categoryKey]?.[index] || featuredProducts[index]);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(
    `${
      products[categoryKey]?.[index]?.name || featuredProducts[index].name
    } added to cart!`
  );
  updateCartCount();

  // Animate cart icon
  const cartIcon = document.querySelector('.cart-button');
  cartIcon.classList.add('cart-bounce');
  
  // Remove class after animation completes
  setTimeout(() => {
    cartIcon.classList.remove('cart-bounce');
  }, 800);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const countSpan = document.getElementById("cart-count");
  if (countSpan) {
    countSpan.textContent = cart.length;
  }
}

// Auto-scroll function with pause on hover
function autoScroll(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  let scrolling = true;
  let direction = 1;
  let scrollStep = 1;
  let scrollInterval;

  // Start the scrolling
  function startScroll() {
    scrollInterval = setInterval(() => {
      if (scrolling) {
        container.scrollLeft += scrollStep * direction;
        
        // Reverse direction when reaching the end or start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          direction = -1;
        } else if (container.scrollLeft <= 10) {
          direction = 1;
        }
      }
    }, 20);
  }

  // Add hover event listeners
  container.addEventListener('mouseenter', () => {
    scrolling = false;
  });

  container.addEventListener('mouseleave', () => {
    scrolling = true;
  });
  
  // Listen for custom events from the buttons
  container.addEventListener('pause-scroll', () => {
    scrolling = false;
  });
  
  container.addEventListener('resume-scroll', () => {
    scrolling = true;
  });

  // Start scrolling
  startScroll();
}

// Add scroll navigation buttons
function addScrollButtons() {
  // Function to create buttons for a container
  function createButtonsForContainer(container) {
    if (!container) return;
    
    // Create and add the previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '❮';
    prevButton.className = 'scroll-nav-btn prev-btn';
    prevButton.onclick = () => {
      container.scrollLeft -= 300; // Scroll by approximately one product card
    };
    
    // Create and add the next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '❯';
    nextButton.className = 'scroll-nav-btn next-btn';
    nextButton.onclick = () => {
      container.scrollLeft += 300; // Scroll by approximately one product card
    };
    
    // Create wrapper div for positioning if it doesn't exist
    const parent = container.parentElement;
    if (!parent.classList.contains('scroll-container-wrapper')) {
      // Add positioning class to parent
      parent.style.position = 'relative';
    }
    
    // Append buttons to parent
    parent.appendChild(prevButton);
    parent.appendChild(nextButton);
    
    // Add event listeners to buttons to pause auto-scroll on hover
    prevButton.addEventListener('mouseenter', () => {
      // Trigger a custom event that will be listened for in autoScroll
      const pauseEvent = new CustomEvent('pause-scroll');
      container.dispatchEvent(pauseEvent);
    });
    
    nextButton.addEventListener('mouseenter', () => {
      const pauseEvent = new CustomEvent('pause-scroll');
      container.dispatchEvent(pauseEvent);
    });
    
    // When mouse leaves the buttons, we need to check if it's going back to the container
    prevButton.addEventListener('mouseleave', (event) => {
      // Don't resume if moving to container or other button
      if (!container.contains(event.relatedTarget) && event.relatedTarget !== nextButton) {
        const resumeEvent = new CustomEvent('resume-scroll');
        container.dispatchEvent(resumeEvent);
      }
    });
    
    nextButton.addEventListener('mouseleave', (event) => {
      if (!container.contains(event.relatedTarget) && event.relatedTarget !== prevButton) {
        const resumeEvent = new CustomEvent('resume-scroll');
        container.dispatchEvent(resumeEvent);
      }
    });
  }
  
  // Add buttons to featured products
  createButtonsForContainer(document.getElementById('featured-products-list'));
  
  // Add buttons to category products
  createButtonsForContainer(document.getElementById('category-products-list'));
}

// Add CSS for buttons dynamically to avoid modifying CSS files
function addButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .scroll-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      width: 40px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.8);
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      font-size: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
    }
    
    .scroll-nav-btn:hover {
      background-color: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transform: translateY(-50%) scale(1.1);
    }
    
    .prev-btn {
      left: 10px;
    }
    
    .next-btn {
      right: 10px;
    }
  `;
  document.head.appendChild(style);
}

// Add to market.js before rendering products
function showLoadingCards(containerId, count = 4) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    const loadingCard = document.createElement('div');
    loadingCard.className = 'product-card loading';
    loadingCard.style.height = '320px';
    container.appendChild(loadingCard);
  }
}

// 🌟 Handle category selection
document.addEventListener("DOMContentLoaded", () => {
  // Add button styles to head
  addButtonStyles();
  
  // Add navigation buttons
  addScrollButtons();
  
  // Start auto-scroll
  autoScroll("featured-products-list");
  autoScroll("category-products-list");
  
  // Show loading cards before fetching products
  showLoadingCards('featured-products-list');
  showLoadingCards('category-products-list');
  
  // Other initialization code...
  updateCartCount();
  startAutoScroll(); // For the ad slider
});

// Also update the event listener for category selection
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[action='/search']");
  const categorySelect = document.getElementById("categories");
  const categoryProductsDiv = document.querySelector(".category-products");

  // Set default category to "ethnic" in the dropdown if it exists
  if (categorySelect) {
    categorySelect.value = "ethnic";
  }
  
  // Set current category to ethnic by default
  currentCategory = "ethnic";

  if (form && categorySelect) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = categorySelect.value;
      if (selected) {
        currentCategory = selected;
        renderProducts(selected);

        // Scroll to the category-products div
        categoryProductsDiv.scrollIntoView({
          behavior: "smooth", 
          block: "start", 
        });
      }
    });
  }

  // Fetch data from products.json in the Data folder
  fetch("../Data/products.json")
    .then(response => {
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data loaded successfully:", data);
      products = data.products;
      featuredProducts = data.featuredProducts;
      renderFeaturedProducts();
      
      // Always render ethnic category by default
      renderProducts("ethnic");
    })
    .catch(error => {
      console.error("Error loading product data:", error);
      // Show a user-friendly error message
      const container = document.getElementById("featured-products-list");
      if (container) {
        container.innerHTML = "<p>Unable to load products. Please try again later.</p>";
      }
    });
});

function searchProducts(query) {
  const container = document.getElementById("category-products-list");
  if (!container) return;

  container.innerHTML = ""; // Clear previous results
  const lowerCaseQuery = query.toLowerCase();

  // Combine all products from all categories into a single array
  const allProducts = Object.values(products).flat();

  // Filter products based on the search query
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.brand.toLowerCase().includes(lowerCaseQuery)
  );

  // Display filtered products
  if (filteredProducts.length > 0) {
    filteredProducts.forEach((product) => {
      const item = document.createElement("div");
      item.className = "items";
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="item-image">
        <div class="item-details">
          <span>
            <p class="item-name">${product.name}</p>
            <p class="item-brand">${product.brand}</p>
          </span>
          <p class="item-price">₹${product.price}</p>
          <div class="item-rating">
            <span>${"★".repeat(Math.floor(product.rating)) + "☆"}</span>
            <span>(${product.reviews} reviews)</span>
          </div>
        </div>
        <button class="add-to-cart" onclick="addToCart('search', ${allProducts.indexOf(
          product
        )})">Add to Cart</button>
      `;
      container.appendChild(item);
    });
  } else {
    container.innerHTML = "<p>No products found matching your search.</p>";
  }
}

// Handle search form submission
document.querySelector(".search-box").addEventListener("submit", (e) => {
  e.preventDefault();
  const query = e.target.querySelector("input[name='query']").value;
  if (query) {
    searchProducts(query);
  }
});

document.querySelectorAll(".thumbnail").forEach((thumbnail) => {
  thumbnail.addEventListener("click", (event) => {
    const mainImage = event.target.closest(".product-card").querySelector(".product-image");
    mainImage.src = event.target.src;
  });
});

// Initialize searchable products globally
let searchableProducts = [];

// Function to set up search autocomplete
function setupSearchAutocomplete() {
  const searchInput = document.getElementById('search-input');
  const suggestionsContainer = document.getElementById('search-suggestions');
  
  if (!searchInput || !suggestionsContainer) return;
  
  // Combine all products from all categories for searching
  searchableProducts = Object.values(products).flat();
  
  // Track input changes
  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    
    // Only show suggestions when 2 or more characters are typed (changed from 3 to 2)
    if (query.length >= 2) {
      // Filter products based on the query
      const matchingProducts = searchableProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.brand && product.brand.toLowerCase().includes(query))
      ).slice(0, 6); // Limit to 6 suggestions
      
      // Clear previous suggestions
      suggestionsContainer.innerHTML = '';
      
      // Add matching products to suggestions
      if (matchingProducts.length > 0) {
        matchingProducts.forEach(product => {
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.innerHTML = `
            <img class="suggestion-image" src="${product.image}" alt="${product.name}">
            <div class="suggestion-details">
              <div class="suggestion-name">${highlightMatch(product.name, query)}</div>
              <div class="suggestion-price">₹${product.price}</div>
            </div>
          `;
          
          // Add click event to open product details
          item.addEventListener('click', () => {
            // Create a complete array of all images including the main image
            const mainImage = product.image;
            const productImages = product.images || [];
            
            let allImages = [mainImage];
            productImages.forEach(img => {
              if (!allImages.includes(img)) {
                allImages.push(img);
              }
            });
            
            const selectedProduct = {
              ...product,
              description: "This is a detailed description of the product.", // This is overriding the real description
              images: allImages
            };
            
            localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
            navigateTo("product-details.html");
          });
          
          suggestionsContainer.appendChild(item);
        });
        
        // Show suggestions container
        suggestionsContainer.classList.add('active');
      } else {
        // No matches found
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item';
        noResults.textContent = 'No products found';
        suggestionsContainer.appendChild(noResults);
        suggestionsContainer.classList.add('active');
      }
    } else {
      // Hide suggestions if query is too short
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.remove('active');
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
  
  // Prevent form submission when selecting a suggestion
  searchInput.closest('form').addEventListener('submit', (e) => {
    if (suggestionsContainer.classList.contains('active') && suggestionsContainer.children.length > 0) {
      e.preventDefault();
    }
  });
}

// Helper function to highlight matching text
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong style="color: #ae8861;">$1</strong>');
}

// Call setupSearchAutocomplete in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // All your existing initialization code...
  
  // Fetch data from products.json in the Data folder
  fetch("../Data/products.json")
    .then(response => {
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data loaded successfully:", data);
      products = data.products;
      featuredProducts = data.featuredProducts;
      renderFeaturedProducts();
      renderProducts("ethnic");
      
      // Initialize search autocomplete after loading products
      setupSearchAutocomplete();
    })
    .catch(error => {
      console.error("Error loading product data:", error);
      // Show a user-friendly error message
      const container = document.getElementById("featured-products-list");
      if (container) {
        container.innerHTML = "<p>Unable to load products. Please try again later.</p>";
      }
    });
});

// Account button functionality
document.getElementById('account-btn').addEventListener('click', () => {
  const username = localStorage.getItem('username');
  
  if (username) {
    // User is logged in, redirect to dashboard
    navigateTo('../Dashboard/dashboard.html');
  } else {
    // User is not logged in, redirect to login page
    navigateTo('../auth/login.html');
  }
});

// Add to market.js
function initScrollReveal() {
  const sections = document.querySelectorAll('.featured-products, .category-products');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });
  
  sections.forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
  });
}

// Add to market.js
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.2;
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
}

// Add to navigation links and buttons that lead to new pages
function navigateTo(url) {
  document.body.classList.remove('loaded');
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// Call at the end of your DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  // Your existing code...
  initScrollReveal();
  initParallax();
});


document.addEventListener('DOMContentLoaded', function() {
   
    const allElements = document.querySelectorAll('body > *');
    const lastElement = allElements[allElements.length - 1];
    
    if (lastElement && !lastElement.matches('footer')) {
        lastElement.style.backgroundColor = '#1a1a1a';
        lastElement.style.color = 'rgba(255, 255, 255, 0.7)';
        lastElement.style.width = '100%';
        lastElement.style.margin = '0';
        lastElement.style.padding = '15px 0';
    }
    
    
    const copyrightText = document.querySelector('body > p:last-child, footer + p, div > p:contains("2025")');
    if (copyrightText) {
        copyrightText.style.backgroundColor = '#1a1a1a';
        copyrightText.style.margin = '0';
        copyrightText.style.padding = '15px 0';
        copyrightText.style.width = '100%';
        copyrightText.parentElement.style.backgroundColor = '#1a1a1a';
    }
});

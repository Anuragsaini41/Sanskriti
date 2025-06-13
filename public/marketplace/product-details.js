// Add to the start of your script in market.js and product-details.js
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// Update the existing navigateTo function
function navigateTo(url) {
  // Store the destination in sessionStorage
  sessionStorage.setItem('navigatingTo', url);
  
  // Fade out current page
  document.body.classList.remove('loaded');
  
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  const productData = JSON.parse(localStorage.getItem("selectedProduct"));
  if (!productData) {
    alert("No product selected!");
    navigateTo("market.html");
    return;
  }

  // Populate product details
  document.getElementById("product-name").textContent = productData.name;
  document.getElementById("product-brand").textContent = `Brand: ${productData.brand}`;
  document.getElementById("product-price").textContent = `Price: ₹${productData.price}`;
  document.getElementById("product-description").textContent = productData.description || "No description available.";

  // Setup image slider
  const mainImage = productData.image;
  const additionalImages = productData.images || [];
  
  // Create a complete array of images including the main image
  let allImages = [mainImage];
  additionalImages.forEach(img => {
    if (!allImages.includes(img)) {
      allImages.push(img);
    }
  });
  
  let currentImageIndex = 0;
  
  // Set main image source
  const mainImageElement = document.getElementById("main-image");
  mainImageElement.src = allImages[currentImageIndex];
  mainImageElement.alt = productData.name;
  
  // Add arrow button functionality
  document.querySelector(".prev-arrow").addEventListener("click", () => {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    mainImageElement.src = allImages[currentImageIndex];
  });
  
  document.querySelector(".next-arrow").addEventListener("click", () => {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    mainImageElement.src = allImages[currentImageIndex];
  });

  // Add reviews
  const reviewsList = document.getElementById("reviews-list");
  if (productData.reviews && productData.reviews.length > 0) {
    productData.reviews.forEach((review) => {
      const li = document.createElement("li");
      
      // Check if review is in old format (just text) or new format (object with username)
      if (typeof review === 'string') {
        // Old format
        li.innerHTML = `
          <div class="review-header">
            <strong>Anonymous User</strong>
          </div>
          <div class="review-text">${review}</div>
        `;
      } else {
        // New format with username
        li.innerHTML = `
          <div class="review-header">
            <strong>${review.username}</strong>
            <span class="review-date">${review.date || 'Unknown date'}</span>
          </div>
          <div class="review-text">${review.text}</div>
        `;
      }
      
      reviewsList.appendChild(li);
    });
  } else {
    reviewsList.innerHTML = "<li>No reviews available.</li>";
  }

  // Add to cart functionality
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(productData);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${productData.name} added to cart!`);
    
    // Update cart count if it exists
    const countSpan = document.getElementById("cart-count");
    if (countSpan) {
      countSpan.textContent = cart.length;
    }
  });

  // Add submit review functionality
  document.getElementById("submit-review").addEventListener("click", () => {
    const reviewInput = document.getElementById("review-input");
    const reviewText = reviewInput.value.trim();
    
    if (!reviewText) {
      alert("Please write a review first!");
      return;
    }
    
    // Get username from localStorage
    const username = localStorage.getItem('username') || 'Anonymous User';
    
    // Create review with username
    const reviewWithUsername = {
      username: username,
      text: reviewText,
      date: new Date().toLocaleDateString()
    };
    
    // Add review to UI
    const reviewsList = document.getElementById("reviews-list");
    
    // Remove "No reviews available" message if present
    if (reviewsList.innerHTML.includes("No reviews available")) {
      reviewsList.innerHTML = "";
    }
    
    // Create and append new review with username
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="review-header">
        <strong>${reviewWithUsername.username}</strong>
        <span class="review-date">${reviewWithUsername.date}</span>
      </div>
      <div class="review-text">${reviewWithUsername.text}</div>
    `;
    reviewsList.appendChild(li);
    
    // Clear input
    reviewInput.value = "";
    
    // Get current product data
    const productData = JSON.parse(localStorage.getItem("selectedProduct"));
    
    // Initialize reviews array if it doesn't exist
    if (!productData.reviews) {
      productData.reviews = [];
    }
    
    // Add the new review and save back to localStorage
    productData.reviews.push(reviewWithUsername);
    localStorage.setItem("selectedProduct", JSON.stringify(productData));
    
    alert("Thank you for your review!");
  });

  // Load related products from the same category
  loadRelatedProducts(productData);

  // Fix for the back to market button
  const backButton = document.querySelector("a[href='market.html']");
  if (backButton) {
    backButton.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("market.html");
    });
  }
});

// Fix for related products loading
function loadRelatedProducts(currentProduct) {
  const relatedProductsContainer = document.getElementById("related-products-list");
  if (!relatedProductsContainer) return;

  const category = localStorage.getItem("currentCategory") || "ethnic";
  
  console.log("Current category:", category); // Debug log
  console.log("Current product:", currentProduct.name); // Debug log
  
  // Fetch all products data
  fetch("../Data/products.json")
    .then(response => response.json())
    .then(data => {
      console.log("Products data loaded:", data); // Debug log
      
      // Get products from the same category
      const categoryProducts = data.products[category] || [];
      
      console.log("Category products found:", categoryProducts.length); // Debug log
      
      // Filter out the current product - use name instead of id
      const relatedProducts = categoryProducts.filter(product => 
        product.name !== currentProduct.name
      ); // Show all remaining products in category
      
      console.log("Related products after filter:", relatedProducts.length); // Debug log
      
      if (relatedProducts.length > 0) {
        relatedProductsContainer.innerHTML = "";
        
        // Display related products
        relatedProducts.forEach(product => {
          const productCard = document.createElement("div");
          productCard.className = "product-card";
          
          productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-details">
              <h3 class="product-name">${product.name}</h3>
              <div class="product-price">₹${product.price} <span class="product-mrp">₹${Math.round(product.price * 1.2)}</span></div>
            </div>
          `;
          
          productCard.addEventListener('click', () => {
            // Create a complete array of all images
            const mainImage = product.image;
            const productImages = product.images || [];
            
            let allImages = [mainImage];
            if (productImages && productImages.length) {
              productImages.forEach(img => {
                if (!allImages.includes(img)) {
                  allImages.push(img);
                }
              });
            }
            
            const selectedProduct = {
              ...product,
              images: allImages
            };
            
            localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
            localStorage.setItem("currentCategory", category);
            navigateTo("product-details.html");
          });
          
          relatedProductsContainer.appendChild(productCard);
        });
        
        // After all products are added, setup scrolling
        setupRelatedProductsScroll();
      } else {
        relatedProductsContainer.innerHTML = "<p class='no-products'>No related products found in this category.</p>";
      }
    })
    .catch(error => {
      console.error("Error loading related products:", error);
      relatedProductsContainer.innerHTML = "<p class='no-products'>Failed to load related products. Check console for details.</p>";
    });
}

// Better auto-scroll function like market.js
function setupRelatedProductsScroll() {
  const container = document.getElementById('related-products-list');
  const prevBtn = document.querySelector('.related-prev');
  const nextBtn = document.querySelector('.related-next');
  
  if (!container || !prevBtn || !nextBtn) {
    console.error("Required elements for related products scrolling not found");
    return;
  }
  
  console.log("Setting up market-style auto-scroll for related products");
  
  // Make sure buttons are visible
  prevBtn.style.display = 'flex';
  nextBtn.style.display = 'flex';
  
  // Similar to market.js autoScroll function
  let scrolling = true;
  let direction = 1;
  let scrollStep = 1;
  let scrollInterval;
  
  function startScroll() {
    // Clear any existing interval
    if (scrollInterval) clearInterval(scrollInterval);
    
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
    }, 20); // Smooth continuous scrolling with small steps
  }
  
  // Button click handlers
  prevBtn.onclick = function() {
    container.scrollBy({ left: -280, behavior: 'smooth' });
    // Pause auto-scrolling temporarily when user interacts
    scrolling = false;
    setTimeout(() => { scrolling = true; }, 5000);
  };
  
  nextBtn.onclick = function() {
    container.scrollBy({ left: 280, behavior: 'smooth' });
    // Pause auto-scrolling temporarily when user interacts
    scrolling = false;
    setTimeout(() => { scrolling = true; }, 5000);
  };
  
  // Add hover event listeners - pause on hover
  container.addEventListener('mouseenter', () => {
    scrolling = false;
  });
  
  container.addEventListener('mouseleave', () => {
    scrolling = true;
  });
  
  // Add hover event listeners for buttons too
  prevBtn.addEventListener('mouseenter', () => {
    scrolling = false;
  });
  
  nextBtn.addEventListener('mouseenter', () => {
    scrolling = false;
  });
  
  prevBtn.addEventListener('mouseleave', (event) => {
    // Only resume if not moving to container or other button
    if (!container.contains(event.relatedTarget) && event.relatedTarget !== nextBtn) {
      scrolling = true;
    }
  });
  
  nextBtn.addEventListener('mouseleave', (event) => {
    // Only resume if not moving to container or other button
    if (!container.contains(event.relatedTarget) && event.relatedTarget !== prevBtn) {
      scrolling = true;
    }
  });
  
  // Start scrolling
  startScroll();
}
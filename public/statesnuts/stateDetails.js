import { stateDetails } from './statesData.js';

const debug = true;

function log(message, data) {
    if (debug) {
        console.log(message, data);
    }
}

function handleSectionUpdate(section, updateFn, data) {
    try {
        if (!data) {
            console.warn(`No data provided for ${section} section`);
            return;
        }
        updateFn(data);
    } catch (error) {
        console.error(`Error updating ${section} section:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Add debug logging
    console.log('DOM Content Loaded');

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const stateId = urlParams.get('state');
        console.log('State ID from URL:', stateId);

        if (!stateId) {
            throw new Error('No state specified in URL');
        }

        // Clean up the state ID to match our data keys
        const cleanStateId = stateId.toLowerCase()
            .replace(/-/g, '') // Remove hyphens
            .trim();
        
        console.log('Cleaned State ID:', cleanStateId);
        console.log('Available states:', Object.keys(stateDetails));

        const state = stateDetails[cleanStateId];
        console.log('Found state data:', state);

        if (!state) {
            throw new Error(`State '${stateId}' not found`);
        }

        // Update all sections with error handling
        handleSectionUpdate('hero', updateHeroSection, state.basicInfo);
        handleSectionUpdate('overview', updateOverviewSection, state.overview);
        handleSectionUpdate('timeline', updateHistoricalTimeline, state.history);
        handleSectionUpdate('cultural', updateCulturalSection, state.culture);
        handleSectionUpdate('cuisine', updateCuisineSection, state.cuisine);
        handleSectionUpdate('spots', updateSpotsList, state.touristSpots);
        handleSectionUpdate('map', initializeMap, state.touristSpots);
        handleSectionUpdate('experiences', updateExperiences, state.experiences);
        handleSectionUpdate('travel', updateTravelInfo, state.travelInfo);

    } catch (error) {
        console.error('Error loading state:', error);
        handleError(error.message);
    }
});

function handleError(message) {
    console.error(message);
    const errorElement = document.querySelector('.state-not-found');
    if (errorElement) {
        errorElement.style.display = 'block';
    }
    const heroSection = document.querySelector('.state-hero');
    if (heroSection) {
        heroSection.style.display = 'none';
    }
}

function updateHeroSection(info) {
    // Add error handling and logging
    try {
        log('Updating hero section with data:', info);

        // Verify required data
        if (!info) {
            throw new Error('No basic info provided');
        }

        // Update background image with fallback
        const heroSection = document.querySelector('.state-hero');
        if (info.banner) {
            const img = new Image();
            img.onload = () => {
                heroSection.style.backgroundImage = `url(${info.banner})`;
            };
            img.onerror = () => {
                console.error('Failed to load banner image:', info.banner);
                heroSection.style.backgroundImage = 'url("../img/default-state-banner.jpg")';
            };
            img.src = info.banner;
        }

        // Update text content with null checks
        document.getElementById('stateName').textContent = info.name || 'State Name';
        document.getElementById('stateTagline').textContent = info.tagline || 'State Tagline';
        document.getElementById('formationDay').textContent = 
            `Formation Day: ${info.formationDay || 'N/A'}`;
        document.getElementById('capital').textContent = 
            `Capital: ${info.capital || 'N/A'}`;
        document.getElementById('population').textContent = 
            `Population: ${info.population || 'N/A'}`;
        document.getElementById('area').textContent = 
            `Area: ${info.area || 'N/A'}`;

        // Add languages if available
        if (info.languages && info.languages.length > 0) {
            const languagesStr = info.languages.join(', ');
            const languageItem = document.createElement('div');
            languageItem.className = 'stat-item';
            languageItem.innerHTML = `
                <i class="fas fa-language"></i>
                <span>Languages: ${languagesStr}</span>
            `;
            document.querySelector('.hero-quick-stats').appendChild(languageItem);
        }

        log('Hero section updated successfully');
    } catch (error) {
        console.error('Error updating hero section:', error);
        handleError('Failed to update hero section');
    }
}

function updateOverviewSection(overview) {
    document.querySelector('.state-description').textContent = overview.description;
    
    const highlightsList = document.querySelector('.key-highlights ul');
    highlightsList.innerHTML = overview.keyHighlights.map(highlight => 
        `<li><i class="fas fa-check"></i> ${highlight}</li>`
    ).join('');
    
    updateGallery(overview.gallery);
}

function updateGallery(gallery) {
    const galleryContainer = document.querySelector('.overview-gallery');
    galleryContainer.innerHTML = gallery.map(item => `
        <div class="gallery-item">
            <img src="${item.url}" alt="${item.title}">
            <div class="gallery-caption">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
}

function updateHistoricalTimeline(history) {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = history.timeline.map(event => `
        <div class="timeline-item">
            <h3>${event.year}</h3>
            <h4>${event.event}</h4>
            <p>${event.description}</p>
        </div>
    `).join('');
}

function updateCulturalSection(culture) {
    // Update traditions
    const traditionContent = document.querySelector('.tradition-content');
    traditionContent.innerHTML = culture.traditions.map(tradition => `
        <div class="tradition-item">
            <img src="${tradition.image}" alt="${tradition.name}">
            <h4>${tradition.name}</h4>
            <p>${tradition.description}</p>
        </div>
    `).join('');

    // Update festivals
    const festivalTimeline = document.querySelector('.festival-timeline');
    festivalTimeline.innerHTML = culture.festivals.map(festival => `
        <div class="festival-item">
            <img src="${festival.image}" alt="${festival.name}">
            <div class="festival-info">
                <h4>${festival.name}</h4>
                <span class="month">${festival.month}</span>
                <p>${festival.description}</p>
            </div>
        </div>
    `).join('');
}

function updateCuisineSection(cuisine) {
    const cuisineGrid = document.querySelector('.cuisine-grid');
    const renderDishes = (dishes, type) => dishes.map(dish => `
        <div class="cuisine-card" data-type="${type}">
            <img src="${dish.image}" alt="${dish.name}">
            <h4>${dish.name}</h4>
            <p>${dish.description}</p>
            <div class="ingredients">
                <h5>Key Ingredients:</h5>
                <ul>${dish.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
            </div>
        </div>
    `).join('');

    cuisineGrid.innerHTML = [
        ...renderDishes(cuisine.vegetarian, 'vegetarian'),
        ...renderDishes(cuisine.nonVegetarian, 'non-vegetarian'),
        ...renderDishes(cuisine.sweets, 'sweets')
    ].join('');
}

function initializeMap(spots) {
    if (!spots || !spots.historical) return;
    
    const map = L.map('touristMap').setView([26.9124, 75.7873], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const allSpots = [
        ...spots.historical,
        ...spots.religious,
        ...spots.nature
    ];

    const bounds = L.latLngBounds();
    
    allSpots.forEach(spot => {
        if (spot.coordinates) {
            const marker = L.marker(spot.coordinates)
                .bindPopup(`
                    <h3>${spot.name}</h3>
                    <p>${spot.description}</p>
                    <img src="${spot.image}" style="width:200px; height:150px; object-fit:cover;">
                `);
            marker.addTo(map);
            bounds.extend(spot.coordinates);
        }
    });

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    }
}

function updateSpotsList(spots) {
    const placesGrid = document.querySelector('.places-grid');
    const allSpots = [...spots.historical, ...spots.religious, ...spots.nature];
    
    placesGrid.innerHTML = allSpots.map(spot => {
        const category = spot.type || (
            spots.historical.includes(spot) ? 'historical' :
            spots.religious.includes(spot) ? 'religious' : 'nature'
        );
        return `
            <div class="place-card" data-category="${category}">
                <img src="${spot.image}" alt="${spot.name}">
                <div class="place-info">
                    <h3>${spot.name}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${spot.location}</p>
                    <p>${spot.description}</p>
                    ${spot.timing ? `<p class="timing"><i class="far fa-clock"></i> ${spot.timing}</p>` : ''}
                    ${spot.entryFee ? `<p class="entry-fee"><i class="fas fa-ticket-alt"></i> ${spot.entryFee}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function updateExperiences(experiences) {
    const experiencesGrid = document.querySelector('.experiences-grid');
    experiencesGrid.innerHTML = experiences.map(exp => `
        <div class="experience-card">
            <img src="${exp.image}" alt="${exp.name}">
            <div class="experience-info">
                <h3>${exp.name}</h3>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${exp.location}</p>
                <p class="duration"><i class="far fa-clock"></i> ${exp.duration}</p>
                <p class="price"><i class="fas fa-tag"></i> ${exp.price}</p>
                <p>${exp.description}</p>
                <a href="${exp.bookingLink}" class="book-btn">Book Now</a>
            </div>
        </div>
    `).join('');
}

function updateTravelInfo(info) {
    // Update transportation info
    const transportContent = document.createElement('div');
    transportContent.innerHTML = `
        <div class="transport-info">
            <div class="transport-section">
                <h3><i class="fas fa-plane"></i> Airports</h3>
                <ul>${info.transport.airports.map(airport => `<li>${airport}</li>`).join('')}</ul>
            </div>
            <div class="transport-section">
                <h3><i class="fas fa-train"></i> Railways</h3>
                <ul>${info.transport.railways.map(railway => `<li>${railway}</li>`).join('')}</ul>
            </div>
            <div class="transport-section">
                <h3><i class="fas fa-bus"></i> Bus Stands</h3>
                <ul>${info.transport.busStands.map(bus => `<li>${bus}</li>`).join('')}</ul>
            </div>
        </div>
    `;
    document.querySelector('[data-content="transport"]').appendChild(transportContent);

    // Update weather cards
    updateWeatherCards(info.weather);
}

function updateWeatherCards(weather) {
    // Summer
    document.querySelector('.season-card.summer').innerHTML += `
        <p class="months">${weather.summer.months}</p>
        <p class="temp">${weather.summer.temperature}</p>
        <p>${weather.summer.description}</p>
        <p class="clothing">What to wear: ${weather.summer.clothing}</p>
    `;

    // Monsoon
    document.querySelector('.season-card.monsoon').innerHTML += `
        <p class="months">${weather.monsoon.months}</p>
        <p class="rainfall">Rainfall: ${weather.monsoon.rainfall}</p>
        <p>${weather.monsoon.description}</p>
        <p class="clothing">What to wear: ${weather.monsoon.clothing}</p>
    `;

    // Winter
    document.querySelector('.season-card.winter').innerHTML += `
        <p class="months">${weather.winter.months}</p>
        <p class="temp">${weather.winter.temperature}</p>
        <p>${weather.winter.description}</p>
        <p class="clothing">What to wear: ${weather.winter.clothing}</p>
    `;

    // Best Time
    document.querySelector('.season-card.best-time').innerHTML += `
        <p class="months">${weather.bestTime.months}</p>
        <p>${weather.bestTime.reason}</p>
        <div class="events">
            <h4>Major Events:</h4>
            <ul>${weather.bestTime.events.map(event => `<li>${event}</li>`).join('')}</ul>
        </div>
    `;
}

// Add event listeners for filters
document.addEventListener('DOMContentLoaded', function() {
    // Cuisine filters
    document.querySelectorAll('.cuisine-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterCuisine(filter);
            toggleActiveClass(this, '.cuisine-filters .filter-btn');
        });
    });

    // Tourist spot filters
    document.querySelectorAll('.category-filters .category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterSpots(category);
            toggleActiveClass(this, '.category-filters .category-btn');
        });
    });

    // Travel info tabs
    document.querySelectorAll('.info-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
            toggleActiveClass(this, '.info-tabs .tab-btn');
        });
    });
});

function toggleActiveClass(element, siblingSelector) {
    document.querySelectorAll(siblingSelector).forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

function filterCuisine(filter) {
    const cards = document.querySelectorAll('.cuisine-card');
    cards.forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterSpots(category) {
    const cards = document.querySelectorAll('.place-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content > div').forEach(div => div.style.display = 'none');
    document.querySelector(`[data-content="${tab}"]`).style.display = 'block';
}


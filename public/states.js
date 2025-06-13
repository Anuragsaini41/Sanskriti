const listDom = document.querySelector('.carousel .list');
const thumbDom = document.querySelector('.carousel .thumbnail');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

const data = [
    // Existing states
    {
        img: 'img/delhi.jpg',
        state: 'Delhi',
        tagline: 'The Capital Territory',
        desc: 'Experience the blend of ancient history and modern architecture in India\'s capital.'
    },
    {
        img: 'img/assam.jpg',
        state: 'Assam',
        tagline: 'Tea Garden',
        desc: 'Experience the lush tea plantations and scenic beauty of Assam.'
    },
    {
        img: 'img/aruna.jpg',
        state: 'Arunachal Pradesh',
        tagline: 'Land of the Rising Sun',
        desc: 'Explore the easternmost frontier with rich tribal culture and nature.'
    },
    {
        img: 'img/up.jpg',
        state: 'Uttar Pradesh',
        tagline: 'Heart of India',
        desc: 'From heritage cities to spiritual centers, experience India\'s core.'
    },
    {
        img: 'img/rj.jpeg',
        state: 'Rajasthan',
        tagline: 'Land of Kings',
        desc: 'Explore majestic forts, vibrant culture, and the golden sands of the Thar desert.'
    },
    {
        img: 'img/gujrat.jpg',
        state: 'Gujarat',
        tagline: 'Vibrant Gujarat',
        desc: 'Experience diverse traditions, historical monuments and the unique Rann of Kutch.'
    },
    {
        img: 'img/tamilnadu.jpg',
        state: 'Tamil Nadu',
        tagline: 'Land of Temples',
        desc: 'Visit ancient temples, experience classical arts and enjoy coastal beauty.'
    },
    
    // Added more states
    {
        img: 'img/maharashtra.jpg',
        state: 'Maharashtra',
        tagline: 'Gateway to the Heart of India',
        desc: 'From bustling Mumbai to ancient caves, experience the rich blend of tradition and modernity.'
    },
    {
        img: 'img/kerala.jpg',
        state: 'Kerala',
        tagline: 'God\'s Own Country',
        desc: 'Explore the serene backwaters, lush hills, and pristine beaches of this tropical paradise.'
    },
    {
        img: 'img/wb.jpeg',
        state: 'West Bengal',
        tagline: 'Cultural Capital of India',
        desc: 'Home to literary giants, revolutionary thinkers, and the magnificent Sundarbans.'
    },
    {
        img: 'img/punjab.jpg',
        state: 'Punjab',
        tagline: 'Land of Five Rivers',
        desc: 'Experience vibrant culture, delicious cuisine, and the warmth of Punjabi hospitality.'
    },
    {
        img: 'img/himachalpradesh.jpeg',
        state: 'Himachal Pradesh',
        tagline: 'Dev Bhoomi',
        desc: 'Nestled in the Himalayas, discover breathtaking landscapes, adventure sports, and spiritual retreats.'
    },
    {
        img: 'img/karnataka.jpg',
        state: 'Karnataka',
        tagline: 'One State, Many Worlds',
        desc: 'From tech hub Bangalore to ancient Hampi, experience diversity in all its forms.'
    },
    {
        img: 'img/goa.jpg',
        state: 'Goa',
        tagline: 'Pearl of the Orient',
        desc: 'Relax on pristine beaches, explore Portuguese heritage, and enjoy the vibrant nightlife.'
    },
    
    // Added Union Territories
    {
        img: 'img/jammu_kashmir.jpg',
        state: 'Jammu & Kashmir',
        tagline: 'Paradise on Earth',
        desc: 'Explore majestic mountains, serene lakes, and experience the unique Kashmiri culture.'
    },
    {
        img: 'img/ladakh.jpg',
        state: 'Ladakh',
        tagline: 'Land of High Passes',
        desc: 'Discover Buddhist monasteries, stark landscapes, and the world\'s highest motorable roads.'
    },
    {
        img: 'img/andaman.jpg',
        state: 'Andaman & Nicobar',
        tagline: 'Emerald Islands',
        desc: 'Experience pristine beaches, crystal clear waters, and rich marine biodiversity.'
    },
    {
        img: 'img/puducherry.jpg',
        state: 'Puducherry',
        tagline: 'A Slice of France in India',
        desc: 'Explore charming French quarters, peaceful beaches, and spiritual communities.'
    },
    {
        img: 'img/chandigarh.jpg',
        state: 'Chandigarh',
        tagline: 'The City Beautiful',
        desc: 'Experience India\'s first planned city with its unique architecture and urban design.'
    },
    {
        img: 'img/lakshadweep.jpg',
        state: 'Lakshadweep',
        tagline: 'Coral Paradise',
        desc: 'Discover pristine coral reefs, turquoise lagoons, and untouched natural beauty.'
    },

    // Missing states
    {
        img: 'img/andhrapradesh.jpg',
        state: 'Andhra Pradesh',
        tagline: 'Land of Ancient Temples',
        desc: 'Home to rich heritage, delicious cuisine, and the spiritual city of Tirupati.'
    },
    {
        img: 'img/bihar.jpg',
        state: 'Bihar',
        tagline: 'Land of Buddha',
        desc: 'Explore ancient Buddhist sites, vibrant culture, and the land of enlightenment.'
    },
    {
        img: 'img/chhattisgarh.jpg',
        state: 'Chhattisgarh',
        tagline: 'Rice Bowl of Central India',
        desc: 'Discover tribal heritage, dense forests, and ancient cave paintings.'
    },
    {
        img: 'img/haryana.jpg',
        state: 'Haryana',
        tagline: 'Land of Rotis',
        desc: 'Experience rural charm, rich agricultural heritage, and historic battlefields.'
    },
    {
        img: 'img/jharkhand.jpg',
        state: 'Jharkhand',
        tagline: 'Land of Forests',
        desc: 'Explore lush forests, tribal culture, and the industrial heartland of eastern India.'
    },
    {
        img: 'img/madhyapradesh.jpg',
        state: 'Madhya Pradesh',
        tagline: 'Heart of Incredible India',
        desc: 'Discover ancient temples, majestic tigers, and the rich heritage of central India.'
    },
    {
        img: 'img/manipur.jpg',
        state: 'Manipur',
        tagline: 'Jewel of the Northeast',
        desc: 'Experience unique dance forms, floating islands, and scenic beauty.'
    },
    {
        img: 'img/meghalaya.jpg',
        state: 'Meghalaya',
        tagline: 'Abode of Clouds',
        desc: 'Explore living root bridges, waterfalls, and the wettest place on Earth.'
    },
    {
        img: 'img/mizoram.jpg',
        state: 'Mizoram',
        tagline: 'Land of the Highlanders',
        desc: 'Discover pristine landscapes, vibrant festivals, and warm hospitality.'
    },
    {
        img: 'img/nagaland.jpg',
        state: 'Nagaland',
        tagline: 'Land of Festivals',
        desc: 'Experience unique tribal culture, colorful festivals, and untouched natural beauty.'
    },
    {
        img: 'img/odisha.jpg',
        state: 'Odisha',
        tagline: 'Soul of India',
        desc: 'Explore ancient temples, pristine beaches, and rich tribal heritage.'
    },
    {
        img: 'img/sikkim.jpg',
        state: 'Sikkim',
        tagline: 'Small but Beautiful',
        desc: 'Experience breathtaking Himalayan views, monasteries, and organic farming.'
    },
    {
        img: 'img/telangana.jpg',
        state: 'Telangana',
        tagline: 'Land of Nizams',
        desc: 'Discover historic Hyderabad, ancient forts, and vibrant culture.'
    },
    {
        img: 'img/tripura.jpg',
        state: 'Tripura',
        tagline: 'Land of Diversity',
        desc: 'Experience unique rock-cut sculptures, tribal heritage, and lush greenery.'
    },
    {
        img: 'img/uttarakhand.jpg',
        state: 'Uttarakhand',
        tagline: 'Land of Gods',
        desc: 'Explore sacred rivers, majestic Himalayas, and spiritual retreats.'
    },

    // Missing Union Territory
    {
        img: 'img/dnhdd.jpg',
        state: 'Dadra & Nagar Haveli and Daman & Diu',
        tagline: 'Paradise of Beaches',
        desc: 'Experience Portuguese heritage, pristine beaches, and tax-free shopping.'
    }
];

function renderItems() {
    listDom.innerHTML = '';
    thumbDom.innerHTML = '';
    
    // First make thumbnail container visible
    thumbDom.style.opacity = '1';

    data.forEach((item, index) => {
        // Main slide code remains the same
        const slide = document.createElement('div');
        slide.className = 'item' + (index === 0 ? ' active' : '');
        slide.innerHTML = `
            <img src="${item.img}" alt="${item.state}" onerror="this.src='img/default-state.jpg'; this.onerror='';">
            <div class="content">
                <div class="state">${item.state}</div>
                <div class="tagline">${item.tagline}</div>
                <div class="desc">${item.desc}</div>
                <div class="buttons"><button>Explore</button></div>
            </div>`;
        listDom.appendChild(slide);

        // Create thumbnail with animation delay
        const thumb = document.createElement('div');
        thumb.className = 'item' + (index === 0 ? ' active' : '');
        // Add staggered animation delay
        thumb.style.setProperty('--i', index);
        
        // Debug the image path
        console.log(`Creating thumbnail for: ${item.state}, image path: ${item.img}`);
        
        thumb.innerHTML = `
            <img src="${item.img}" alt="${item.state}" onerror="this.onerror=null; this.src='img/default-state.jpg'; console.log('Image failed to load: ${item.img}');">
            <div class="caption">
                <div class="state">${item.state}</div>
                <div class="tagline">${item.tagline}</div>
            </div>`;
        
        // Add click handler with ripple effect
        thumb.addEventListener('click', () => {
            const currentActive = thumbDom.querySelector('.item.active');
            if (currentActive) currentActive.classList.remove('active');
            thumb.classList.add('active');
            
            // Move this state to the front
            while (data[0].state !== item.state) {
                moveToNextSlide();
            }
        });
        
        // Explicitly make visible and append
        thumb.style.display = 'block';
        thumb.style.opacity = '1';
        thumbDom.appendChild(thumb);
    });
    
    // Reset animations for new slide
    const activeContent = document.querySelector('.carousel .item.active .content');
    if (activeContent) {
        activeContent.querySelectorAll('*').forEach(el => {
            el.style.animation = 'none';
            void el.offsetWidth; // Trigger reflow
            el.style.animation = null;
        });
    }
}

function moveToNextSlide() {
    data.push(data.shift());
    updateSlides();
}

function moveToPrevSlide() {
    data.unshift(data.pop());
    updateSlides();
}

function updateSlides() {
    renderItems();
    resetAutoPlay();
}

next.addEventListener('click', moveToNextSlide);
prev.addEventListener('click', moveToPrevSlide);

let autoPlay = setInterval(moveToNextSlide, 5000);

function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(moveToNextSlide, 5000);
}

renderItems();
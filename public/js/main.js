document.addEventListener('DOMContentLoaded', () => {

    // -----------------------
    // Auto-detect API base
    // -----------------------
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const API_BASE = isLocal
        ? "http://localhost:5000"   // <-- local backend
        : "https://xylexgaminginc.onrender.com"; // <-- production backend

    // -----------------------
    // Loading indicator functions (ADD THIS NEW SECTION)
    // -----------------------
    function showLoading(element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    function hideLoading(element) {
        element.innerHTML = '';
    }

    // -----------------------
    // Fetch and render games (MODIFY THIS EXISTING FUNCTION)
    // -----------------------
    async function loadGames() {
        const gameGrid = document.querySelector('.game-grid');
        showLoading(gameGrid); // ADD THIS LINE
        
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            // Add error handling for HTTP errors
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const games = await res.json();
            gameGrid.innerHTML = ""; // clear before rendering

            games.forEach(game => {
                const card = document.createElement('div');
                card.classList.add('game-card');

                // Create image container
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('game-img');

                // Dynamically add image (point to backend)
                const img = document.createElement('img');
                img.src = `${API_BASE}/${game.image}`;
                img.alt = game.title;
                imgContainer.appendChild(img);

                // Create content container
                const content = document.createElement('div');
                content.classList.add('game-content');
                content.innerHTML = `
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <a href="${game.link}" class="btn btn-outline">Learn More</a>
                `;

                // Append image and content to card
                card.appendChild(imgContainer);
                card.appendChild(content);

                // Append card to grid
                gameGrid.appendChild(card);
            });
        } catch (err) {
            // MODIFY THIS ERROR HANDLING
            gameGrid.innerHTML = '<p class="error-message">Failed to load games. Please try again later.</p>';
            console.error("Error loading games:", err);
        }
    }

    // -----------------------
    // Fetch and render technology (MODIFY THIS EXISTING FUNCTION)
    // -----------------------
    async function loadTechnology() {
        const techContainer = document.querySelector('.tech-container');
        showLoading(techContainer); // ADD THIS LINE
        
        try {
            const res = await fetch(`${API_BASE}/api/technology`);
            // Add error handling for HTTP errors
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const techList = await res.json();
            techContainer.innerHTML = "";

            techList.forEach(tech => {
                const card = document.createElement('div');
                card.classList.add('tech-card');
                card.innerHTML = `
                    <div class="tech-icon"><i class="${tech.icon}"></i></div>
                    <h3>${tech.title}</h3>
                    <p>${tech.description}</p>`;
                techContainer.appendChild(card);
            });
        } catch (err) {
            // MODIFY THIS ERROR HANDLING
            techContainer.innerHTML = '<p class="error-message">Failed to load technology. Please try again later.</p>';
            console.error("Error loading technology:", err);
        }
    }

    // Call both loaders
    loadGames();
    loadTechnology();

    // -----------------------
    // Animate elements when they scroll into view
    // -----------------------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.game-card, .tech-card').forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // -----------------------
    // Header scroll effect
    // -----------------------
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            header.style.padding = '10px 0';
        } else {
            header.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
            header.style.padding = '15px 0';
        }
    });

});


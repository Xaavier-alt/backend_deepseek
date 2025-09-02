document.addEventListener('DOMContentLoaded', () => {

    // -----------------------
    // Auto-detect API base
    // -----------------------
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const API_BASE = isLocal
        ? "http://localhost:5000"   // <-- local backend
        : "https://xylexgaminginc.onrender.com"; // <-- production backend

    // -----------------------
    // Loading indicator functions
    // -----------------------
    function showLoading(element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    function hideLoading(element) {
        element.innerHTML = '';
    }

    // -----------------------
    // Fetch and render games
    // -----------------------
    async function loadGames() {
        const gameGrid = document.querySelector('.game-grid');
        showLoading(gameGrid);
        
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const games = await res.json();
            gameGrid.innerHTML = "";

            games.forEach(game => {
                const card = document.createElement('div');
                card.classList.add('game-card');

                const imgContainer = document.createElement('div');
                imgContainer.classList.add('game-img');

                const img = document.createElement('img');
                img.src = `${API_BASE}/${game.image}`;
                img.alt = game.title;
                imgContainer.appendChild(img);

                const content = document.createElement('div');
                content.classList.add('game-content');
                content.innerHTML = `
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <a href="${game.link}" class="btn btn-outline">Learn More</a>
                `;

                card.appendChild(imgContainer);
                card.appendChild(content);
                gameGrid.appendChild(card);
            });
        } catch (err) {
            gameGrid.innerHTML = '<p class="error-message">Failed to load games. Please try again later.</p>';
            console.error("Error loading games:", err);
        }
    }

    // -----------------------
    // Fetch and render technology
    // -----------------------
    async function loadTechnology() {
        const techContainer = document.querySelector('.tech-container');
        showLoading(techContainer);
        
        try {
            const res = await fetch(`${API_BASE}/api/technology`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
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
            techContainer.innerHTML = '<p class="error-message">Failed to load technology. Please try again later.</p>';
            console.error("Error loading technology:", err);
        }
    }

    // Call both loaders
    loadGames();
    loadTechnology();

    // -----------------------
    // Animate elements on scroll
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

    // -----------------------
    // Modal functionality
    // -----------------------
    const signInBtn = document.getElementById('signInBtn');
    const modal = document.getElementById('signInModal');
    const closeModal = document.querySelector('.close-modal');
    const signInForm = document.getElementById('signInForm');

    if (signInBtn && modal && closeModal && signInForm) {
        signInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('Sign in attempt:', { email, password });
            alert('Sign in functionality would connect to your backend. Check the console for details.');
            modal.style.display = 'none';
        });
    }

});

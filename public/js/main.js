document.addEventListener('DOMContentLoaded', () => {
    // Fallback data in case API calls fail
    const fallbackGames = [
        {
            title: "FURIOSA: A Mad-Max Saga (UNRELEASED)",
            description: "Embark on a scorching odyssey of vengeance across a savage wasteland in this vehicular combat masterpiece.",
            image: "/images/FURIOSAoverlay main.png",
            link: "#"
        },
        {
            title: "JOHN WICK (coming soon...)",
            description: "Live the story of a secret assassin on a relentless crusade through the assassin underworld in this brutally elegant and intense action-packed gameplay.",
            image: "/images/JOHNWICKoverlay main.png",
            link: "#"
        },
        {
            title: "THE STAR WARS (coming soon...)",
            description: "Experience hyper-realistic journey on a galactic odyssey to become a Jedi and restore balance to the galaxy in this legendary space adventure game with next-gen graphics and physics.",
            image: "/images/STARWARSoverlay unreal.png",
            link: "#"
        }
    ];

    const fallbackTechnology = [
        { title: "XGI AI Systems", description: "Next-generation AI that creates dynamic, responsive gameplay experiences.", icon: "fas fa-brain" },
        { title: "Immersive Reality", description: "Breakthrough VR and AR technologies that blur the line between virtual and real world.", icon: "fas fa-vr-cardboard" },
        { title: "Quantum Engine", description: "Proprietary game engine powering photorealistic graphics and massive open worlds.", icon: "fas fa-bolt" }
    ];

    // -----------------------
    // Auto-detect API base
    // -----------------------
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const API_BASE = isLocal
        ? "http://localhost:5000"
        : "https://xylexgaminginc.onrender.com";

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
    // Fetch and render games with fallback
    // -----------------------
    async function loadGames() {
        const gameGrid = document.getElementById('gameGrid');
        
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const games = await res.json();
            renderGames(games);
        } catch (err) {
            console.error("Error loading games from API, using fallback data:", err);
            renderGames(fallbackGames);
        }
    }

    function renderGames(games) {
        const gameGrid = document.getElementById('gameGrid');
        gameGrid.innerHTML = "";

        games.forEach(game => {
            const card = document.createElement('div');
            card.classList.add('game-card');

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('game-img');

            const img = document.createElement('img');
            // Use the image from API or fallback
            img.src = game.image.startsWith('http') ? game.image : `${API_BASE}${game.image}`;
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
    }

    // -----------------------
    // Fetch and render technology with fallback
    // -----------------------
    async function loadTechnology() {
        const techContainer = document.getElementById('techContainer');
        
        try {
            const res = await fetch(`${API_BASE}/api/technology`);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const techList = await res.json();
            renderTechnology(techList);
        } catch (err) {
            console.error("Error loading technology from API, using fallback data:", err);
            renderTechnology(fallbackTechnology);
        }
    }

    function renderTechnology(techList) {
        const techContainer = document.getElementById('techContainer');
        techContainer.innerHTML = "";

        techList.forEach(tech => {
            const card = document.createElement('div');
            card.classList.add('tech-card');
            card.innerHTML = `
                <div class="tech-icon"><i class="${tech.icon}"></i></div>
                <h3>${tech.title}</h3>
                <p>${tech.description}</p>
            `;
            techContainer.appendChild(card);
        });
    }

    // Call both loaders
    loadGames();
    loadTechnology();

    // -----------------------
    // Modal functionality
    // -----------------------
    const signInBtn = document.getElementById('signInBtn');
    const modal = document.getElementById('signInModal');
    const closeModal = document.querySelector('.close-modal');
    const signInForm = document.getElementById('signInForm');

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
        
        // Here you would normally send this data to your backend
        console.log('Sign in attempt:', { email, password });
        
        // Show success message
        alert('Sign in functionality would connect to your backend. Check the console for details.');
        modal.style.display = 'none';
    });

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
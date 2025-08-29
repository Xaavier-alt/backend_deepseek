document.addEventListener('DOMContentLoaded', () => {

 const API_BASE = "https://xylexgaminginc.onrender.com";


    // -----------------------
    // Fetch and render games
    // -----------------------
    async function loadGames() {
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            const games = await res.json();

            const gameGrid = document.querySelector('.game-grid');
            gameGrid.innerHTML = ""; // clear before rendering

            games.forEach(game => {
                const card = document.createElement('div');
                card.classList.add('game-card');

                // Create image container
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('game-img');

                // Dynamically add image (point to backend)
                const img = document.createElement('img');
                img.src = `${API_BASE}/${game.image}`;  // FIXED
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
            console.error("Error loading games:", err);
        }
    }

    // -----------------------
    // Fetch and render technology
    // -----------------------
    async function loadTechnology() {
        try {
            const res = await fetch(`${API_BASE}/api/technology`);
            const techList = await res.json();

            const techContainer = document.querySelector('.tech-container');
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

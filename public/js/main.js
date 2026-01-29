document.addEventListener('DOMContentLoaded', () => {
    // -----------------------
    // Add navigation buttons styling
    // -----------------------
    const style = document.createElement('style');
    style.textContent = `
        .nav-buttons {
            display: flex;
            gap: 15px;
        }  

        .btn {
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
            font-size: 14px;
            cursor: pointer;
            display: inline-block;
        }
        
        .btn-outline {
            border: 1px solid var(--accent);
            color: var(--accent);
        }
        
        .btn-outline:hover {
            background-color: var(--accent);
            color: var(--text);
        }
        
        .btn-primary {
            background-color: var(--accent);
            color: var(--text);
        }
        
        .btn-primary:hover {
            background-color: var(--accent-light);
        }
    `;
    document.head.appendChild(style);

    // -----------------------
    // Fallback data
    // -----------------------
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
        { title: "XGI AI Systems", description: "Next-generation AI that creates dynamic, responsive gameplay experiences.", icon: "fas fa-brain", type: "icon" },
        { title: "Immersive Reality", description: "Breakthrough VR and AR technologies that blur the line between virtual and real world.", icon: "fas fa-vr-cardboard", type: "icon" },
        { 
            title: "Unreal Engine", 
            description: "Unreal game engine powering photorealistic graphics and massive open worlds.", 
            icon: "/images/unreal_engine_logo.png", 
            type: "image" 
        }
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
        if (!gameGrid) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/games`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const games = await res.json();
            renderGames(games);
        } catch (err) {
            console.error("Error loading games from API, using fallback data:", err);
            renderGames(fallbackGames);
        }
    }

    function renderGames(games) {
        const gameGrid = document.getElementById('gameGrid');
        if (!gameGrid) return;
        
        gameGrid.innerHTML = "";

        games.forEach((game, index) => {
            const card = document.createElement('div');
            card.classList.add('game-card');
            const cardId = `game-card-${index}`;
            card.id = cardId;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('game-img');

            const img = document.createElement('img');
            img.src = game.image.startsWith('http') ? game.image : `${API_BASE}${game.image}`;
            img.alt = game.title;
            imgContainer.appendChild(img);

            const content = document.createElement('div');
            content.classList.add('game-content');
            
            const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const slug = slugify(game.title || '');

            const learnMoreId = `learn-more-${index}`;
            const downloadBtnId = `download-icon-${index}`;
            content.innerHTML = `
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="game-actions">
                    <button id="${learnMoreId}" class="btn btn-outline">Learn More</button>
                    <button id="${downloadBtnId}" class="download-icon-btn" title="Download Game"><i class="fas fa-download"></i></button>
                </div>
            `;

            card.appendChild(imgContainer);
            card.appendChild(content);
            gameGrid.appendChild(card);
            
            // Add event listener for Learn More button
            const learnMoreBtn = document.getElementById(learnMoreId);
            if (learnMoreBtn && game.youtube) {
                learnMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleGameVideo(cardId, game);
                });
            }

            // Add event listener for download icon
            const downloadIconBtn = document.getElementById(downloadBtnId);
            if (downloadIconBtn) {
                downloadIconBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modal = document.getElementById('downloadModal');
                    if (modal) {
                        modal.style.display = 'block';
                    }
                });
            }
        });
    }
    
    // Function to toggle video display
    function toggleGameVideo(cardId, game) {
        const card = document.getElementById(cardId);
        let videoContainer = card.querySelector('.game-video-container');
        
        if (videoContainer) {
            // If video already exists, toggle visibility
            videoContainer.style.display = videoContainer.style.display === 'none' ? 'block' : 'none';
        } else {
            // Create new video container
            videoContainer = document.createElement('div');
            videoContainer.classList.add('game-video-container');
            videoContainer.innerHTML = `
                <div class="video-wrapper">
                    <button class="close-video">✕</button>
                    <iframe width="100%" height="400" 
                        src="${game.youtube}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="document.getElementById('downloadModal').style.display='block';">Download Game</button>
            `;
            card.appendChild(videoContainer);
            
            // Add close button functionality
            const closeBtn = videoContainer.querySelector('.close-video');
            closeBtn.addEventListener('click', () => {
                videoContainer.style.display = 'none';
            });
        }
    }

    // -----------------------
    // Fetch and render technology with fallback
    // -----------------------
    async function loadTechnology() {
        const techContainer = document.getElementById('techContainer');
        if (!techContainer) return; 
        
        try {
            const res = await fetch(`${API_BASE}/api/technology`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const techList = await res.json();
            renderTechnology(techList);
        } catch (err) {
            console.error("Error loading technology from API, using fallback data:", err);
            renderTechnology(fallbackTechnology);
        }
    }

    function renderTechnology(techList) {
        const techContainer = document.getElementById('techContainer');
        if (!techContainer) return;
        
        techContainer.innerHTML = "";

        techList.forEach(tech => {
            const card = document.createElement('div');
            card.classList.add('tech-card');

            let iconHTML = "";
            if (tech.type === "image") {
                // ✅ Make PNG behave like the Font Awesome icons (3rem)
                iconHTML = `<img src="${tech.icon}" alt="${tech.title} Logo" style="width:3rem;height:3rem;object-fit:contain;display:inline-block;">`;
            } else {
                iconHTML = `<i class="${tech.icon}"></i>`;
            }

            card.innerHTML = `
                <div class="tech-icon">${iconHTML}</div>
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
    // Sign In Modal functionality
    // -----------------------
    const signInBtn = document.getElementById('signInBtn');
    const modal = document.getElementById('signInModal');
    const closeModal = document.querySelector('.close-modal');
    const signInForm = document.getElementById('signInForm');

    if (signInBtn && modal) {
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

        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                console.log('Sign in attempt:', { email, password });
                
                alert('Sign in functionality would connect to your backend. Check the console for details.');
                modal.style.display = 'none';
            });
        }
    }

    // -----------------------
    // Download Modal functionality
    // -----------------------
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadModal = document.getElementById('downloadModal');
    const closeDownloadModal = downloadModal ? downloadModal.querySelector('.close-modal') : null;
    const pcDownloadBtn = document.querySelector('.pc-download');
    const comingSoonMessage = document.getElementById('comingSoonMessage');

    if (downloadBtn && downloadModal) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadModal.style.display = 'flex';
        });

        if (closeDownloadModal) {
            closeDownloadModal.addEventListener('click', function() {
                downloadModal.style.display = 'none';
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === downloadModal) {
                downloadModal.style.display = 'none';
            }
        });

        if (pcDownloadBtn) {
            pcDownloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (comingSoonMessage) {
                    comingSoonMessage.style.display = 'block';
                }
                
                setTimeout(() => {
                    alert('PC client is coming soon! Sign up for our newsletter to be notified when it launches.');
                }, 300);
            });
        }

        document.querySelectorAll('.platform-option').forEach(option => {
            option.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            });
            
            option.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
        });
    }

    // -----------------------
    // Job Application Form functionality
    // -----------------------
    const jobForm = document.getElementById('jobApplicationForm');
    if (jobForm) {
        const resumeInput = document.getElementById('resume');
        const fileName = document.getElementById('fileName');
        const successMessage = document.getElementById('successMessage');
        
        if (resumeInput && fileName) {
            resumeInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    fileName.textContent = this.files[0].name;
                } else {
                    fileName.textContent = 'No file chosen';
                }
            });
        }
        
        jobForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const requiredFields = jobForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ff6b6b';
                } else {
                    field.style.borderColor = '#333';
                }
            });
            
            if (isValid) {
                console.log('Job application submitted with:', {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    position: document.getElementById('position').value,
                    experience: document.getElementById('experience').value,
                    coverLetter: document.getElementById('coverLetter').value,
                    portfolio: document.getElementById('portfolio').value,
                    howHeard: document.getElementById('howHeard').value
                });
                
                if (successMessage) {
                    successMessage.style.display = 'block';
                    jobForm.reset();
                    
                    if (fileName) {
                        fileName.textContent = 'No file chosen';
                    }
                    
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const positionParam = urlParams.get('position');
        
        if (positionParam) {
            const positionSelect = document.getElementById('position');
            if (positionSelect) {
                const decodedPosition = decodeURIComponent(positionParam.replace(/\+/g, ' '));
                
                for (let i = 0; i < positionSelect.options.length; i++) {
                    if (positionSelect.options[i].value === decodedPosition || 
                        positionSelect.options[i].text === decodedPosition) {
                        positionSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }

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
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                header.style.padding = '10px 0';
            } else {
                header.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                header.style.padding = '15px 0';
            }
        });
    }
});
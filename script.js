

document.addEventListener('DOMContentLoaded', () => {

    // --- Menu Burger ---
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links .nav-item');

    burgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burgerMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll'); // Empêche le scroll du body
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            burgerMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // --- Chargement des sections via AJAX (pour la modularité) ---
    async function loadSection(containerId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const htmlContent = await response.text();
            document.getElementById(containerId).innerHTML = htmlContent;
            // Une fois le contenu chargé, déclencher l'observation pour la révélation
            const loadedSection = document.getElementById(containerId).querySelector('section');
            if (loadedSection) {
                observer.observe(loadedSection);
            }
            // Si c'est la section projets, initialiser le carrousel
            if (containerId === 'projects-section-container') {
                initializeProjectCarousels();
            }
        } catch (error) {
            console.error(`Impossible de charger la section ${filePath}:`, error);
            // Fallback: Si le chargement échoue, ajouter un message d'erreur ou un contenu par défaut
            document.getElementById(containerId).innerHTML = `<section><h2 class="section-title">Erreur de chargement</h2><p>Impossible de charger le contenu de cette section.</p></section>`;
        }
    }

    loadSection('greeting-section-container', 'sections/greeting.html');
    loadSection('about-section-container', 'sections/about.html');
    loadSection('skills-section-container', 'sections/skills.html');
    loadSection('projects-section-container', 'sections/projects.html');
    loadSection('contact-section-container', 'sections/contact.html');


    // --- Animation de révélation des sections au scroll (Intersection Observer) ---
    // Note: Les éléments .reveal sont maintenant les conteneurs div vides
    const revealElements = document.querySelectorAll('.common-section'); // Sélectionne les div conteneurs

    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed'); // Ajoute la classe 'revealed'
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initialisation des observateurs pour les conteneurs (avant qu'ils ne soient remplis)
    // Les sections elles-mêmes seront observées après leur chargement dans loadSection
    revealElements.forEach(element => {
        observer.observe(element);
    });


    // --- Scroll Smooth pour les liens de navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector('.main-header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Carrousel d'images au survol des projets ---
    const imageCarouselModal = document.getElementById('image-carousel-modal');
    const closeButton = document.querySelector('.modal .close-button');
    const carouselImagesContainer = document.querySelector('.carousel-images');
    const prevSlideBtn = document.querySelector('.modal .prev-slide');
    const nextSlideBtn = document.querySelector('.modal .next-slide');

    let currentProjectImages = [];
    let currentImageIndex = 0;

    function openCarouselModal(images) {
        currentProjectImages = images;
        currentImageIndex = 0;
        carouselImagesContainer.innerHTML = ''; // Nettoyer les images précédentes

        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Image du projet';
            carouselImagesContainer.appendChild(img);
        });

        // Afficher la première image
        if (carouselImagesContainer.children.length > 0) {
            carouselImagesContainer.children[0].classList.add('active');
        }

        imageCarouselModal.style.display = 'flex'; // Afficher la modale
        document.body.classList.add('no-scroll'); // Empêcher le scroll du body
    }

    function showImage(index) {
        const images = carouselImagesContainer.children;
        if (images.length === 0) return;

        // Cacher toutes les images
        for (let i = 0; i < images.length; i++) {
            images[i].classList.remove('active');
        }

        // Afficher l'image à l'index donné
        images[index].classList.add('active');
        images[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;
        showImage(currentImageIndex);
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
        showImage(currentImageIndex);
    }

    // Gestionnaires d'événements pour le carrousel
    closeButton.addEventListener('click', () => {
        imageCarouselModal.style.display = 'none';
        document.body.classList.remove('no-scroll');
    });

    prevSlideBtn.addEventListener('click', prevImage);
    nextSlideBtn.addEventListener('click', nextImage);

    // Fermer la modale si l'on clique en dehors du contenu
    window.addEventListener('click', (event) => {
        if (event.target == imageCarouselModal) {
            imageCarouselModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    });

    // Écouteurs d'événements pour les cartes de projet
    function initializeProjectCarousels() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const imagesAttr = card.getAttribute('data-images');
            if (imagesAttr) {
                const images = imagesAttr.split(',');
                // Au clic sur la carte, ouvrir le carrousel
                card.addEventListener('click', () => {
                    openCarouselModal(images);
                });
            }
        });
    }

    // Le carrousel au survol (version simple si vous ne voulez pas de modale)
    // Pour une version plus simple sans modale, où l'image change juste au survol sur la carte:
    // Vous pouvez remplacer la logique openCarouselModal par ça:
    /*
    const projectImageWrappers = document.querySelectorAll('.project-image-wrapper');
    projectImageWrappers.forEach(wrapper => {
        let imageIndex = 0;
        let intervalId;
        const images = Array.from(wrapper.children); // Get actual image elements within the wrapper

        wrapper.addEventListener('mouseenter', () => {
            if (images.length > 1) {
                images[0].classList.add('active'); // Ensure first image is active on hover
                intervalId = setInterval(() => {
                    images[imageIndex].classList.remove('active');
                    imageIndex = (imageIndex + 1) % images.length;
                    images[imageIndex].classList.add('active');
                }, 1000); // Change image every 1 second
            } else if (images.length === 1) {
                 images[0].classList.add('active'); // Just show the single image if only one
            }
        });

        wrapper.addEventListener('mouseleave', () => {
            clearInterval(intervalId);
            images.forEach(img => img.classList.remove('active')); // Hide all images
            // Optionally, set the first image back as active if you want a default image
            // if (images.length > 0) {
            //     images[0].classList.add('active');
            // }
        });
    });
    */
});
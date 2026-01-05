// Target date: Friday January 9, 2026 at 8:00 AM Miami time (EST)
const TARGET_DATE = new Date('2026-01-09T08:00:00-05:00');

// Default fun facts about Miami/Key Biscayne in Argentinian Spanish
const DEFAULT_FACTS = [
    "El Faro de Cape Florida, ubicado en Key Biscayne, es la estructura mas antigua del condado Miami-Dade. Fue construido en 1825.",
    "El nombre 'Biscayne' proviene de un marinero del Golfo de Vizcaya (Bay of Biscay) que naufragó y vivió en la costa este de Florida.",
    "Antes del desarrollo residencial, Key Biscayne operaba como la plantación de cocos mas grande de los Estados Unidos continentales.",
    "El presidente Richard Nixon visitó Key Biscayne mas de 50 veces entre 1969 y 1973. Tenia una casa de descanso ahi.",
    "Key Biscayne se incorporó como municipio en 1991, siendo la primera ciudad nueva en Miami-Dade en mas de 50 años.",
    "El carrusel historico de Crandon Park fue construido en 1949 y todavia funciona en condiciones casi originales de fabrica.",
    "Cerca de Key Biscayne hay un sendero arqueologico submarino, el unico reconocido federalmente en Estados Unidos.",
    "La familia Matheson donó mas de 800 acres de su tierra al condado en 1940 para crear Crandon Park, a cambio de que construyeran el puente a la isla.",
    "El Parque Nacional Biscayne protege el tercer arrecife de coral mas grande del mundo y tiene evidencia de 10,000 años de historia humana.",
    "En 1951, se podía comprar una casa nueva en Key Biscayne por solo $9,540 dolares, con $500 de anticipo.",
    "El Rickenbacker Causeway, el puente que conecta Key Biscayne con Miami, fue inaugurado en 1947 y mide 6 kilometros de largo.",
    "Andy Garcia y el musico colombiano Juanes viven en Key Biscayne."
];

// Storage key for localStorage
const STORAGE_KEY = 'countdown_facts';

// Get facts from localStorage or use defaults
function getFacts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            let parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Migrate old format {title, text} to new format (string)
                parsed = parsed.map(f => typeof f === 'object' && f.text ? f.text : f);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing stored facts:', e);
        }
    }
    // Initialize with defaults if nothing stored
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FACTS));
    return DEFAULT_FACTS;
}

// Countdown logic
function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        document.querySelector('.container').classList.add('arrived');
        document.querySelector('h1').textContent = 'Ya llegaron!';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Carousel logic
let currentSlide = 0;
let facts = [];
let autoSlideInterval;

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createCarouselSlides() {
    facts = shuffleArray(getFacts());
    const track = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');

    track.innerHTML = '';
    indicators.innerHTML = '';

    facts.forEach((fact, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <h3>Fun Facts</h3>
            <p>${fact}</p>
        `;
        track.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'carousel-indicator' + (index === 0 ? ' active' : '');
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });
}

function goToSlide(index) {
    currentSlide = index;
    const track = document.getElementById('carousel-track');
    track.style.transform = `translateX(-${index * 100}%)`;

    // Update indicators
    document.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });

    // Reset auto-slide timer
    resetAutoSlide();
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % facts.length;
    goToSlide(nextIndex);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 6000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);

    createCarouselSlides();
    resetAutoSlide();
});

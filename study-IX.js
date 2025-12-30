// DOM Elements (guarded)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const videoModal = document.querySelector('.modal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const watchButtons = document.querySelectorAll('.watch-btn');
const downloadButtons = document.querySelectorAll('.download-btn');
const prepButtons = document.querySelectorAll('.prep-btn');
const joinBtn = document.querySelector('.join-btn');

// Video data for Class IX
const videoData = {
    'trigonometry': {
        title: 'Trigonometry - Basics',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Introduction to trigonometric ratios, identities, and applications.'
    },
    'gravitation': {
        title: 'Physics - Gravitation',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Universal law of gravitation, free fall, and mass vs weight concepts.'
    },
    'atoms-molecules': {
        title: 'Chemistry - Atoms & Molecules',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Atomic structure, molecules, and mole concept with numericals.'
    },
    'cell-structure': {
        title: 'Biology - Cell Structure',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Detailed study of cell organelles and their functions.'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Class IX Resources Page Loaded');
    console.log('Total Videos: 100+');
    console.log('Subjects: 8');
    console.log('Study Materials: 200+');
    console.log('Board Preparation Resources: Available');
});

// Mobile Menu Toggle
if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Watch button click handlers
watchButtons.forEach(button => {
    button.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video-id');
        playVideo(videoId);
    });
});

// Play video function
function playVideo(videoId) {
    if(videoData[videoId]) {
        if (modalTitle) modalTitle.textContent = videoData[videoId].title;
        if (videoFrame) videoFrame.src = videoData[videoId].url;
        if (videoModal) videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close video modal
if (closeModalBtn) closeModalBtn.addEventListener('click', closeVideo);

// Close video function
function closeVideo() {
    if (videoModal) videoModal.classList.remove('active');
    if (videoFrame) videoFrame.src = '';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
if (videoModal) {
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideo();
        }
    });
}

// Download buttons functionality
downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
        alert('Download started! In the actual implementation, this would download the resource.');
        console.log('Downloading resource...');
    });
});

// Prep buttons functionality
prepButtons.forEach(button => {
    button.addEventListener('click', function() {
        alert('Download started! In the actual implementation, this would download the board preparation resource.');
        console.log('Downloading board prep resource...');
    });
});

// Join live class button
if (joinBtn) joinBtn.addEventListener('click', function() {
    alert('Redirecting to live class... This would open the live session in the actual implementation.');
    console.log('Joining live class...');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
        closeVideo();
    }
});

// Class IX specific functions
window.classIX = {
    playVideo: playVideo,
    closeVideo: closeVideo,
    getVideoCount: () => {
        return Object.keys(videoData).length;
    },
    getClassInfo: () => {
        return {
            className: 'Class IX',
            videos: '100+',
            subjects: '8',
            materials: '200+',
            boardPrep: 'Available',
            liveClasses: 'Daily'
        };
    }
};

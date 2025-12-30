// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const videoModal = document.querySelector('.modal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const watchButtons = document.querySelectorAll('.watch-btn');
const downloadButtons = document.querySelectorAll('.download-btn');
const joinBtn = document.querySelector('.join-btn');

// Video data for Class VII
const videoData = {
    'linear-equations': {
        title: 'Algebra - Linear Equations',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Solving linear equations with one variable and practical applications.'
    },
    'motion-force': {
        title: 'Physics - Motion & Force',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Understanding concepts of motion, speed, velocity, and force.'
    },
    'acids-bases': {
        title: 'Chemistry - Acids & Bases',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Properties of acids and bases with experiments and indicators.'
    },
    'medieval-india': {
        title: 'History - Medieval India',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Detailed study of medieval Indian kingdoms and culture.'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Class VII Resources Page Loaded');
    console.log('Total Videos: 60+');
    console.log('Subjects: 8');
    console.log('Study Materials: 120+');
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

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
        modalTitle.textContent = videoData[videoId].title;
        videoFrame.src = videoData[videoId].url;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close video modal
closeModalBtn.addEventListener('click', closeVideo);

// Close video function
function closeVideo() {
    videoModal.classList.remove('active');
    videoFrame.src = '';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
videoModal.addEventListener('click', (e) => {
    if(e.target === videoModal) {
        closeVideo();
    }
});

// Download buttons functionality
downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
        alert('Download started! In the actual implementation, this would download the resource.');
        console.log('Downloading resource...');
    });
});

// Join live class button
joinBtn.addEventListener('click', function() {
    alert('Redirecting to live class... This would open the live session in the actual implementation.');
    console.log('Joining live class...');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if(e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideo();
    }
});

// Class VII specific functions
window.classVII = {
    playVideo: playVideo,
    closeVideo: closeVideo,
    getVideoCount: () => {
        return Object.keys(videoData).length;
    },
    getClassInfo: () => {
        return {
            className: 'Class VII',
            videos: '60+',
            subjects: '8',
            materials: '120+',
            liveClasses: '4 per week'
        };
    }
};
// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const videoModal = document.querySelector('.modal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const watchButtons = document.querySelectorAll('.watch-btn');
const downloadButtons = document.querySelectorAll('.download-btn');
const quizButtons = document.querySelectorAll('.quiz-btn');
const joinBtn = document.querySelector('.join-btn');

// Video data for Class VIII
const videoData = {
    'quadrilaterals': {
        title: 'Geometry - Quadrilaterals',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Properties and theorems related to different types of quadrilaterals.'
    },
    'light-reflection': {
        title: 'Physics - Light & Reflection',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Understanding reflection of light, mirrors, and image formation.'
    },
    'metals-nonmetals': {
        title: 'Chemistry - Metals & Non-metals',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Properties, reactivity series, and uses of metals and non-metals.'
    },
    'indian-constitution': {
        title: 'Civics - Indian Constitution',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Understanding the features and importance of Indian Constitution.'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Class VIII Resources Page Loaded');
    console.log('Total Videos: 75+');
    console.log('Subjects: 8');
    console.log('Study Materials: 150+');
    console.log('Quizzes: 4 Available');
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

// Quiz buttons functionality
quizButtons.forEach(button => {
    button.addEventListener('click', function() {
        alert('Starting quiz... In the actual implementation, this would open the quiz interface.');
        console.log('Starting quiz...');
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

// Class VIII specific functions
window.classVIII = {
    playVideo: playVideo,
    closeVideo: closeVideo,
    getVideoCount: () => {
        return Object.keys(videoData).length;
    },
    getClassInfo: () => {
        return {
            className: 'Class VIII',
            videos: '75+',
            subjects: '8',
            materials: '150+',
            quizzes: '4 Available',
            liveClasses: '4 per week'
        };
    }
};
// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

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

// Video Modal Functions
const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');

// Sample video data for Class X
const videoData = {
    'circles': {
        title: 'Mathematics - Circles',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    'electricity': {
        title: 'Physics - Electricity',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    'chemical-reactions': {
        title: 'Chemistry - Chemical Reactions',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    'heredity-evolution': {
        title: 'Biology - Heredity & Evolution',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
};

function playVideo(videoId) {
    if(videoData[videoId]) {
        modalTitle.textContent = videoData[videoId].title;
        videoFrame.src = videoData[videoId].url;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeVideo() {
    videoModal.style.display = 'none';
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
document.querySelectorAll('.download-btn, .feature-btn, .test-btn').forEach(button => {
    button.addEventListener('click', function() {
        if(this.classList.contains('test-btn')) {
            alert('Starting mock test... In the actual implementation, this would open the test interface.');
        } else {
            alert('Download started! In the actual implementation, this would download the resource.');
        }
    });
});

// Join live class button
document.querySelector('.join-btn').addEventListener('click', function() {
    alert('Redirecting to live class... This would open the live session in the actual implementation.');
});

// Log class info
console.log('📚 Class X Resources Page Loaded');
console.log('Total Videos: 120+');
console.log('Subjects: 8');
console.log('Study Materials: 250+');
console.log('Mock Tests: 4 Available');
console.log('Final Exam Preparation: Complete Package');
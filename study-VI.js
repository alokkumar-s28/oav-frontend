// Consolidated and safe DOM/script for study-VI
const _mobileMenuBtn = document.getElementById('mobileMenuBtn');
const _navLinks = document.getElementById('navLinks');
const _videoModal = document.getElementById('videoModal') || document.querySelector('.modal');
const _videoFrame = document.getElementById('videoFrame');
const _modalTitle = document.getElementById('modalTitle');
const _closeModalBtn = document.getElementById('closeModalBtn');
const _watchButtons = document.querySelectorAll('.watch-btn');
const _downloadButtons = document.querySelectorAll('.download-btn');
const _joinBtn = document.querySelector('.join-btn');

// Video data for Class VI
const _videoData = {
    'intro-to-numbers': { title: 'Mathematics - Introduction to Numbers', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    'living-organisms': { title: 'Science - Living Organisms', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    'parts-of-speech': { title: 'English Grammar - Parts of Speech', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    'our-earth': { title: 'Social Studies - Our Earth', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
};

function initStudyVI() {
    console.log('📚 Class VI Resources Page Loaded');
    console.log('Total Videos: 45+');
    console.log('Subjects: 8');
    console.log('Study Materials: 100+');

    // Mobile menu toggle
    if (_mobileMenuBtn && _navLinks) {
        _mobileMenuBtn.addEventListener('click', () => {
            _navLinks.classList.toggle('active');
            _mobileMenuBtn.innerHTML = _navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    // Close mobile menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (_navLinks) _navLinks.classList.remove('active');
            if (_mobileMenuBtn) _mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
        });
    });

    // Watch buttons
    _watchButtons.forEach(btn => btn.addEventListener('click', function () {
        const id = this.getAttribute('data-video-id');
        playVideo(id);
    }));

    // Download buttons
    _downloadButtons.forEach(btn => btn.addEventListener('click', function () {
        alert('Download started! In the actual implementation, this would download the resource.');
    }));

    // Join live class
    if (_joinBtn) _joinBtn.addEventListener('click', function () { alert('Redirecting to live class...'); });

    // Modal close
    if (_closeModalBtn) _closeModalBtn.addEventListener('click', closeVideo);
    if (_videoModal) {
        _videoModal.addEventListener('click', (e) => { if (e.target === _videoModal) closeVideo(); });
    }

    // Keyboard escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && _videoModal && _videoModal.classList.contains('active')) closeVideo();
    });

    // expose to window for console/testing
    window.classVI = {
        playVideo: playVideo,
        closeVideo: closeVideo,
        getVideoCount: () => Object.keys(_videoData).length,
        getClassInfo: () => ({ className: 'Class VI', videos: '45+', subjects: '8', materials: '100+', liveClasses: '4 per week' })
    };
}

function playVideo(id) {
    if (!_videoData[id]) return;
    if (_modalTitle) _modalTitle.textContent = _videoData[id].title;
    if (_videoFrame) _videoFrame.src = _videoData[id].url;
    if (_videoModal) {
        _videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeVideo() {
    if (_videoModal) _videoModal.classList.remove('active');
    if (_videoFrame) _videoFrame.src = '';
    document.body.style.overflow = 'auto';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudyVI);
} else {
    initStudyVI();
}


/**
 * OAV Mantra Classes - Universal Study Portal Engine
 * Powers interactive video learning, lesson progress syncing,
 * interactive MCQ quizzes, and printable notes for Classes VI - X.
 */

"use strict";

const API_BASE = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
    if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
    return '';
})();

window.studyEngine = (function () {
    let currentGrade = 'VI';
    let currentStudent = null;
    let completedLessonIds = new Set();
    let classLessons = [];

    const escapeHtml = text => String(text || '').replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[char]);

    function extractYouTubeId(url) {
        if (!url) return null;
        let str = String(url).trim();
        const srcMatch = str.match(/src=["']([^"']+)["']/i);
        if (srcMatch) str = srcMatch[1];
        const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+?&v=))([\w-]{11})/i);
        if (match && match[1]) return match[1];
        const simple = str.match(/^[\w-]{11}$/);
        if (simple) return simple[0];
        return null;
    }


    // Question banks for Grade Quizzes
    const quizBanks = {
        'VI': [
            {
                q: "What is the smallest natural number?",
                options: ["0", "1", "2", "-1"],
                ans: 1,
                exp: "Natural numbers are counting numbers beginning from 1 (1, 2, 3, ...). Zero is a whole number."
            },
            {
                q: "Which of the following is rich in Vitamin C?",
                options: ["Rice", "Lemon / Citrus Fruits", "Butter", "Egg Yolk"],
                ans: 1,
                exp: "Citrus fruits like lemons, oranges, and amla are rich sources of Vitamin C."
            },
            {
                q: "What is the capital of Odisha?",
                options: ["Cuttack", "Bhubaneswar", "Puri", "Sambalpur"],
                ans: 1,
                exp: "Bhubaneswar is the capital city of Odisha, known as the Temple City of India."
            }
        ],
        'VII': [
            {
                q: "What is the product of (-5) and (-4)?",
                options: ["-20", "20", "-9", "1"],
                ans: 1,
                exp: "The product of two negative numbers is always positive: (-5) × (-4) = +20."
            },
            {
                q: "Which organelle is known as the kitchen of the plant cell?",
                options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
                ans: 1,
                exp: "Chloroplasts contain chlorophyll where photosynthesis occurs, synthesizing food for plants."
            },
            {
                q: "Who was the founder of the Mughal Empire in India?",
                options: ["Akbar", "Babur", "Humayun", "Shah Jahan"],
                ans: 1,
                exp: "Babur founded the Mughal Empire in 1526 after winning the First Battle of Panipat."
            }
        ],
        'VIII': [
            {
                q: "Which property is shown by: a + b = b + a?",
                options: ["Associative", "Commutative", "Distributive", "Closure"],
                ans: 1,
                exp: "Commutative property of addition states that the order of addends does not affect the sum."
            },
            {
                q: "Which crop is sown in the rainy season (Kharif)?",
                options: ["Wheat", "Paddy (Rice)", "Gram", "Mustard"],
                ans: 1,
                exp: "Paddy, maize, and soyabean are Kharif crops sown during the monsoon season."
            },
            {
                q: "What is the minimum age to vote in elections in India?",
                options: ["16", "18", "21", "25"],
                ans: 1,
                exp: "Universal adult suffrage in India grants voting rights to all citizens aged 18 and above."
            }
        ],
        'IX': [
            {
                q: "What is the SI unit of acceleration?",
                options: ["m/s", "m/s²", "km/h", "Newton"],
                ans: 1,
                exp: "Acceleration is rate of change of velocity with time: (m/s) / s = m/s²."
            },
            {
                q: "Which state of matter has a fixed volume but no fixed shape?",
                options: ["Solid", "Liquid", "Gas", "Plasma"],
                ans: 1,
                exp: "Liquids take the shape of the container they are in while maintaining a definite volume."
            },
            {
                q: "When did the French Revolution begin with the storming of the Bastille?",
                options: ["1776", "1789", "1799", "1815"],
                ans: 1,
                exp: "The storming of the Bastille took place on 14 July 1789, sparking the French Revolution."
            }
        ],
        'X': [
            {
                q: "According to Euclid's division lemma, a = bq + r, what is the range of r?",
                options: ["0 ≤ r < b", "0 < r ≤ b", "r > b", "r = 0 only"],
                ans: 0,
                exp: "The remainder r must satisfy 0 ≤ r < b."
            },
            {
                q: "What type of reaction is: 2H₂ + O₂ → 2H₂O?",
                options: ["Decomposition", "Combination", "Displacement", "Double Displacement"],
                ans: 1,
                exp: "Two reactants combine to form a single product, so it is a Combination reaction."
            },
            {
                q: "Who was proclaimed the first King of united Italy in 1861?",
                options: ["Giuseppe Garibaldi", "Victor Emmanuel II", "Count Cavour", "Mazzini"],
                ans: 1,
                exp: "Victor Emmanuel II was proclaimed King of unified Italy in 1861."
            }
        ]
    };

    let classNotes = [];

    async function init(grade) {
        currentGrade = grade;

        try {
            await verifyAuth();
        } catch (e) {
            console.warn("verifyAuth notice:", e);
        }

        try {
            await Promise.all([loadLessons(), loadProgress(), loadNotes()]);
        } catch (e) {
            console.warn("loadData notice:", e);
        }

        try { renderLessons(); } catch (e) { console.error("renderLessons err:", e); }
        try { renderNotes(); } catch (e) { console.error("renderNotes err:", e); }
        try { renderSubjects(); } catch (e) { console.error("renderSubjects err:", e); }
        try { renderLiveSchedule(); } catch (e) { console.error("renderLiveSchedule err:", e); }
        try { setupModals(); } catch (e) { console.error("setupModals err:", e); }
        try { setupQuiz(); } catch (e) { console.error("setupQuiz err:", e); }
        try { setupNotesDownloader(); } catch (e) { console.error("setupNotesDownloader err:", e); }
        try { setupMobileMenu(); } catch (e) { console.error("setupMobileMenu err:", e); }
    }

    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            navLinks.querySelectorAll('a').forEach(l => {
                l.addEventListener('click', () => navLinks.classList.remove('active'));
            });
        }
    }

    async function verifyAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const isPreview = urlParams.get('preview') === 'true' || Boolean(sessionStorage.getItem('oav_admin_token') || localStorage.getItem('oav_admin_token'));

        try {
            const res = await fetch(`${API_BASE}/api/student/me`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.student && (data.student.status === 'active' || data.student.status === 'verified')) {
                    currentStudent = data.student;
                }
            }
        } catch (e) {}

        if (!currentStudent) {
            const saved = JSON.parse(localStorage.getItem('oav_current_student') || 'null');
            if (saved && (saved.status === 'active' || saved.status === 'verified')) {
                currentStudent = saved;
            }
        }

        const authSlot = document.getElementById('authNavSlot');
        const userPill = document.getElementById('userPill');

        if (currentStudent) {
            const studentHtml = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <a href="dashboard.html" style="color:#2563eb; font-weight:700; font-size:0.85rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:#eff6ff; padding:6px 12px; border-radius:20px; border:1px solid #bfdbfe;">
                        <i class="fas fa-user-graduate"></i> My Dashboard (${escapeHtml(currentStudent.full_name.split(' ')[0])})
                    </a>
                </div>
            `;
            if (authSlot) authSlot.innerHTML = studentHtml;
            if (userPill) userPill.innerHTML = studentHtml;
        } else if (isPreview) {
            const previewHtml = `
                <span style="background:#fef3c7; color:#92400e; font-size:0.8rem; font-weight:700; padding:4px 10px; border-radius:12px;">
                    <i class="fas fa-shield-alt"></i> Admin Preview
                </span>
            `;
            if (authSlot) authSlot.innerHTML = previewHtml;
            if (userPill) userPill.innerHTML = previewHtml;
        } else {
            const guestHtml = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <a href="login.html" style="color:#2563eb; font-weight:700; font-size:0.85rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:#eff6ff; padding:6px 12px; border-radius:20px; border:1px solid #bfdbfe;">
                        <i class="fas fa-sign-in-alt"></i> Student Login
                    </a>
                </div>
            `;
            if (authSlot) authSlot.innerHTML = guestHtml;
            if (userPill) userPill.innerHTML = guestHtml;
        }

        return true;
    }

    async function loadLessons() {
        try {
            if (window.OAV_SUPABASE) {
                classLessons = await window.OAV_SUPABASE.getLessons(currentGrade);
            } else {
                const res = await fetch(`${API_BASE}/api/lessons?class=${encodeURIComponent(currentGrade)}`);
                if (res.ok) {
                    const data = await res.json();
                    classLessons = Array.isArray(data) ? data : (data.lessons || []);
                }
            }
        } catch (e) {
            console.warn('Could not load lessons from server:', e.message);
            classLessons = [];
        }
    }

    async function loadNotes() {
        try {
            if (window.OAV_SUPABASE) {
                classNotes = await window.OAV_SUPABASE.getStudyNotes(currentGrade);
            } else {
                const res = await fetch(`${API_BASE}/api/notes?class=${encodeURIComponent(currentGrade)}`);
                if (res.ok) {
                    const data = await res.json();
                    classNotes = Array.isArray(data) ? data : (data.notes || []);
                }
            }
        } catch (e) {
            console.warn('Could not load notes from server:', e.message);
            classNotes = [];
        }
    }

    async function loadProgress() {
        try {
            const res = await fetch(`${API_BASE}/api/progress`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                completedLessonIds = new Set(data.completed_lesson_ids || []);
            }
        } catch (e) {
            const localDone = JSON.parse(localStorage.getItem(`oav_done_${currentGrade}`) || '[]');
            completedLessonIds = new Set(localDone);
        }
    }

    let activeSubject = 'All';

    const allSubjectList = [
        { name: "Mathematics", icon: "fa-calculator", color: "#2563eb" },
        { name: "Science", icon: "fa-flask", color: "#10b981" },
        { name: "English", icon: "fa-language", color: "#8b5cf6" },
        { name: "Social Studies", icon: "fa-globe-asia", color: "#f59e0b" },
        { name: "Odia", icon: "fa-book", color: "#ec4899" },
        { name: "Hindi", icon: "fa-font", color: "#f97316" },
        { name: "Sanskrit", icon: "fa-om", color: "#6366f1" },
        { name: "ICT", icon: "fa-laptop-code", color: "#06b6d4" }
    ];

    function setSubjectFilter(subj) {
        activeSubject = subj;
        renderLessons();
        renderNotes();
        renderSubjects();
    }

    function renderSubjectFilterBar(containerId) {
        const subjects = ['All', 'Science', 'Mathematics', 'English', 'Social Studies', 'Odia', 'Hindi', 'Sanskrit', 'ICT'];
        return `
            <div style="display:flex; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; width:100%; padding-bottom:12px; margin-bottom:20px; scrollbar-width:thin;">
                ${subjects.map(s => `
                    <button onclick="studyEngine.setSubjectFilter('${s}')" style="background:${activeSubject === s ? '#2563eb' : '#ffffff'}; color:${activeSubject === s ? '#ffffff' : '#334155'}; border:1px solid ${activeSubject === s ? '#2563eb' : '#cbd5e1'}; padding:8px 16px; border-radius:20px; font-weight:700; font-size:0.85rem; cursor:pointer; white-space:nowrap; transition:all 0.2s ease; flex-shrink:0;">
                        ${s === 'All' ? '🌟 All Subjects' : s}
                    </button>
                `).join('')}
            </div>
        `;
    }

    function renderSubjects() {
        const grid = document.querySelector('.subjects-grid');
        if (!grid) return;

        grid.innerHTML = allSubjectList.map(sub => {
            const vCount = classLessons.filter(l => (l.subject || '').toLowerCase() === sub.name.toLowerCase()).length;
            const nCount = classNotes.filter(n => (n.subject || '').toLowerCase() === sub.name.toLowerCase()).length;
            const isSelected = activeSubject.toLowerCase() === sub.name.toLowerCase();

            return `
                <div class="subject-card ${isSelected ? 'subject-active' : ''}" onclick="studyEngine.setSubjectFilter('${sub.name}')" style="cursor:pointer; transition:all 0.25s ease; border:${isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0'}; background:${isSelected ? '#eff6ff' : '#ffffff'}; border-radius:12px; padding:20px; text-align:center;">
                    <div class="subject-icon" style="color:${sub.color}; font-size:2rem; margin-bottom:10px;">
                        <i class="fas ${sub.icon}"></i>
                    </div>
                    <div class="subject-info">
                        <h3 style="margin:0 0 6px; font-size:1.1rem; color:#0f172a;">${sub.name}</h3>
                        <p style="margin:0; font-size:0.85rem; color:#64748b;">${vCount} Videos • ${nCount} Notes</p>
                        <div style="margin-top:10px;">
                            <span style="display:inline-block; font-size:0.8rem; font-weight:700; color:${isSelected ? '#1d4ed8' : '#2563eb'}; background:${isSelected ? '#dbeafe' : '#f1f5f9'}; padding:4px 10px; border-radius:14px;">
                                ${isSelected ? '✓ Showing Lessons' : 'Filter Lessons →'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderLiveSchedule() {
        const liveSection = document.getElementById('live');
        if (!liveSection) return;

        const liveLessons = classLessons.filter(l => l.lesson_type === 'live');

        if (liveLessons.length > 0) {
            liveSection.innerHTML = `
                <h2 class="live-title" style="color:#1e3a8a;"><i class="fas fa-broadcast-tower" style="color:#dc2626;"></i> Active Live Classes</h2>
                <p style="color:#64748b; margin-bottom:20px;">Join live interactive video sessions with your teachers.</p>
                <div class="schedule-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
                    ${liveLessons.map(l => `
                        <div class="schedule-item" style="background:#ffffff; border:1.5px solid #fecdd3; border-radius:12px; padding:20px; text-align:left; box-shadow:0 4px 14px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <span style="background:#dc2626; color:#fff; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:4px;"><i class="fas fa-circle" style="font-size:0.5rem;"></i> LIVE NOW</span>
                                <strong style="color:#2563eb; font-size:0.9rem;">${escapeHtml(l.subject)}</strong>
                            </div>
                            <h3 style="margin:0 0 8px; font-size:1.1rem; color:#0f172a;">${escapeHtml(l.title)}</h3>
                            ${l.description ? `<p style="font-size:0.88rem; color:#64748b; margin-bottom:14px;">${escapeHtml(l.description)}</p>` : ''}
                            <button onclick="studyEngine.playLesson(${l.id})" style="background:#dc2626; color:#fff; border:none; padding:12px 20px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.95rem; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                                <i class="fas fa-video"></i> Enter Live Class Room
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            liveSection.innerHTML = `
                <h2 class="live-title" style="color:#1e3a8a;"><i class="fas fa-broadcast-tower" style="color:#2563eb;"></i> Live Classes</h2>
                <div style="background:#ffffff; border:1.5px dashed #cbd5e1; border-radius:14px; padding:32px 20px; text-align:center; margin-top:16px;">
                    <div style="width:50px; height:50px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.4rem;">
                        <i class="fas fa-video-slash"></i>
                    </div>
                    <h3 style="margin:0 0 6px; color:#1e3a8a; font-size:1.1rem;">No Live Class Currently Scheduled</h3>
                    <p style="margin:0 auto; color:#64748b; font-size:0.9rem; max-width:440px;">When a teacher starts a live class session, the link to join will appear right here with instant notification.</p>
                </div>
            `;
        }
    }

    function renderLessons() {
        const grid = document.querySelector('.video-grid');
        if (!grid) return;

        let filteredLessons = classLessons;
        if (activeSubject !== 'All') {
            filteredLessons = classLessons.filter(l => (l.subject || '').toLowerCase() === activeSubject.toLowerCase());
        }

        const recordedLessons = filteredLessons.filter(l => l.lesson_type !== 'live');

        // Render Subject Filter Bar above video grid
        let filterBarHtml = renderSubjectFilterBar('videoFilterBar');

        // Render Recorded Video Lessons
        if (!recordedLessons.length) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; width: 100%;">
                    ${filterBarHtml}
                    <div style="background:#ffffff; border:1.5px dashed #cbd5e1; border-radius:14px; padding:36px 20px; text-align:center;">
                        <div style="width:56px; height:56px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.5rem;">
                            <i class="fas fa-video"></i>
                        </div>
                        <h3 style="color:#1e3a8a; margin:0 0 6px; font-size:1.15rem;">No Video Lessons in ${escapeHtml(activeSubject)}</h3>
                        <p style="color:#64748b; font-size:0.9rem; margin:0 auto; max-width:440px;">Syllabus video classes added by teachers in the admin panel will appear here.</p>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%;">
                ${filterBarHtml}
            </div>
            ${recordedLessons.map(lesson => {
                const isDone = completedLessonIds.has(lesson.id);
                return `
                    <div class="video-card ${isDone ? 'lesson-completed' : ''}" id="lesson-card-${lesson.id}">
                        <div class="video-thumbnail" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); position:relative; cursor:pointer;" onclick="studyEngine.playLesson(${lesson.id})">
                            <i class="fas fa-play-circle play-icon" style="font-size:3rem; color:#fff; opacity:0.95;"></i>
                            ${isDone ? '<span style="position:absolute; top:10px; right:10px; background:#10b981; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:800;"><i class="fas fa-check"></i> Completed</span>' : ''}
                        </div>
                        <div class="video-info">
                            <span style="font-size:0.8rem; font-weight:700; color:#2563eb; text-transform:uppercase;">${escapeHtml(lesson.subject)}</span>
                            <h3 class="video-title" style="margin:4px 0 8px;">${escapeHtml(lesson.title)}</h3>
                            <p class="video-description">${escapeHtml(lesson.description || 'Comprehensive conceptual video class.')}</p>
                            <div style="display:flex; gap:10px; margin-top:12px;">
                                <button class="watch-btn" onclick="studyEngine.playLesson(${lesson.id})" style="flex:1;">
                                    <i class="fas fa-play"></i> Watch Video
                                </button>
                                <button class="btn-sm ${isDone ? 'btn-done' : ''}" id="btn-complete-${lesson.id}" onclick="studyEngine.toggleComplete(${lesson.id})" style="background:${isDone ? '#10b981' : '#f1f5f9'}; color:${isDone ? '#fff' : '#334155'}; border:1px solid #cbd5e1; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600;">
                                    <i class="fas fa-check"></i> ${isDone ? 'Done' : 'Mark Done'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    function renderNotes() {
        const materialsGrid = document.querySelector('.materials-grid');
        if (!materialsGrid) return;

        let filteredNotes = classNotes;
        if (activeSubject !== 'All') {
            filteredNotes = classNotes.filter(n => (n.subject || '').toLowerCase() === activeSubject.toLowerCase());
        }

        if (filteredNotes && filteredNotes.length > 0) {
            materialsGrid.innerHTML = filteredNotes.map(note => `
                <div class="material-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div class="material-icon">
                            <i class="fas fa-file-pdf" style="color:#ef4444;"></i>
                        </div>
                        <span style="font-size:0.78rem; font-weight:800; color:#2563eb; text-transform:uppercase;">${escapeHtml(note.subject)}</span>
                        <h3 class="material-title" style="margin:6px 0 8px; font-size:1.05rem;">${escapeHtml(note.title)}</h3>
                        ${note.content ? `<p style="font-size:0.85rem; color:#64748b; margin-bottom:14px;">${escapeHtml(note.content.slice(0, 100))}${note.content.length > 100 ? '...' : ''}</p>` : ''}
                    </div>
                    <div>
                        ${note.file_url ? `
                            <a href="${escapeHtml(note.file_url)}" target="_blank" rel="noopener" class="download-btn" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; width:100%; box-sizing:border-box;">
                                <i class="fas fa-download"></i> Download / View PDF
                            </a>
                        ` : `
                            <button class="download-btn" onclick="studyEngine.viewCustomNote(${note.id})" style="width:100%;">
                                <i class="fas fa-book-open"></i> Read Study Notes
                            </button>
                        `}
                    </div>
                </div>
            `).join('');
        } else {
            materialsGrid.innerHTML = `
                <div style="background:#ffffff; border:1.5px dashed #cbd5e1; border-radius:14px; padding:36px 20px; text-align:center; grid-column: 1 / -1;">
                    <div style="width:56px; height:56px; background:#fef2f2; color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.5rem;">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 style="color:#1e3a8a; margin:0 0 6px; font-size:1.15rem;">No Study Notes Published for ${escapeHtml(activeSubject)}</h3>
                    <p style="color:#64748b; font-size:0.9rem; margin:0 auto; max-width:440px;">Chapter formulas, revision notes, and PDF download links will appear here once uploaded by the admin.</p>
                </div>
            `;
        }
    }

    function viewCustomNote(id) {
        const note = classNotes.find(n => n.id === id);
        if (!note) return;

        const win = window.open('', '_blank');
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${escapeHtml(note.title)} - OAV Mantra</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.7; max-width: 800px; margin: 0 auto; }
                    .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                    .header h1 { margin: 0; color: #1e3a8a; }
                    .content { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; white-space: pre-wrap; font-size: 1rem; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${escapeHtml(note.title)}</h1>
                    <p style="color:#64748b; margin:4px 0 0;">Class ${escapeHtml(note.student_class)} • ${escapeHtml(note.subject)} • OAV Mantra Classes</p>
                </div>
                <div class="content">${escapeHtml(note.content || 'Detailed notes for revision.')}</div>
                <div style="margin-top:24px; text-align:center;">
                    <button onclick="window.print()" style="background:#2563eb; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer;">Print / Save as PDF</button>
                </div>
            </body>
            </html>
        `);
        win.document.close();
    }

    let currentActiveLesson = null;

    function playLesson(id) {
        const lesson = classLessons.find(l => l.id === id);
        if (!lesson) return;

        currentActiveLesson = lesson;

        const modalTitle = document.getElementById('modalTitle');
        const modal = document.getElementById('videoModal');
        const container = document.getElementById('videoContainerBox') || document.querySelector('.video-container');

        if (modalTitle) modalTitle.textContent = `${lesson.subject}: ${lesson.title}`;

        let rawUrl = (lesson.video_url || '').trim();

        // Clean raw iframe pasted code
        const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
        let cleanUrl = srcMatch && srcMatch[1] ? srcMatch[1].trim() : rawUrl;

        const ytId = extractYouTubeId(cleanUrl);
        const isDirectVideo = /\.(mp4|webm|ogg|mov)($|\?)/i.test(cleanUrl);
        const isMeeting = /meet\.google\.com|zoom\.us|teams\.microsoft\.com/i.test(cleanUrl);

        if (container) {
            if (isMeeting) {
                container.innerHTML = `
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; color:#fff;">
                        <i class="fas fa-video" style="font-size:3.5rem; color:#dc2626; margin-bottom:16px;"></i>
                        <h3 style="margin:0 0 10px; color:#fff; font-size:1.3rem;">Live Class Session Ready</h3>
                        <p style="color:#94a3b8; max-width:480px; margin-bottom:20px; font-size:0.95rem;">Join your teacher and classmates in the live meeting room.</p>
                        <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener" style="background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; font-weight:700; text-decoration:none; font-size:1rem; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                            <i class="fas fa-external-link-alt"></i> Enter Live Class Room Now
                        </a>
                    </div>
                `;
            } else if (isDirectVideo) {
                container.innerHTML = `<video id="activePlayerVideo" src="${escapeHtml(cleanUrl)}" controls autoplay playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000;"></video>`;
            } else if (ytId) {
                const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`;
                container.innerHTML = `
                    <iframe id="videoFrame" src="${escapeHtml(embedUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; z-index:1;"></iframe>
                    <!-- Top Brand Header Bar -->
                    <div style="position:absolute; top:0; left:0; width:100%; height:44px; background:linear-gradient(to bottom, rgba(15,23,42,0.92), transparent); z-index:10; pointer-events:none; display:flex; align-items:center; justify-content:space-between; padding:0 16px;">
                        <span style="color:#ffffff; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px;"><i class="fas fa-graduation-cap" style="color:#3b82f6;"></i> OAV Mantra Classes</span>
                        <span style="background:rgba(37,99,235,0.85); color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">Class ${escapeHtml(currentGrade)}</span>
                    </div>
                    <!-- Bottom-Right Watermark Shield: Completely masks YouTube watermark -->
                    <div style="position:absolute; bottom:0; right:0; width:120px; height:48px; background:#000000; z-index:10; pointer-events:none; display:flex; align-items:center; justify-content:center; border-top-left-radius:8px;">
                        <span style="color:#60a5fa; font-size:11px; font-weight:800; letter-spacing:0.5px;"><i class="fas fa-play" style="font-size:9px; margin-right:4px;"></i> OAV CLASS</span>
                    </div>
                `;
            } else if (cleanUrl.includes("drive.google.com/file/d/")) {
                const embedUrl = cleanUrl.replace(/\/view.*$/, "/preview");
                container.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(embedUrl)}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
            } else if (cleanUrl.includes("vimeo.com/")) {
                const vMatch = cleanUrl.match(/vimeo\.com\/(\d+)/i);
                const embedUrl = vMatch && vMatch[1] ? `https://player.vimeo.com/video/${vMatch[1]}?autoplay=1` : cleanUrl;
                container.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(embedUrl)}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
            } else {
                container.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(cleanUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
            }
        }

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    let streamAltIndex = 0;
    function switchPlayerStream() {
        if (!currentActiveLesson) return;
        const ytId = extractYouTubeId(currentActiveLesson.video_url || '');
        if (!ytId) return;

        const frame = document.getElementById('videoFrame');
        if (!frame) return;

        streamAltIndex = (streamAltIndex + 1) % 3;
        if (streamAltIndex === 0) {
            frame.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`;
        } else if (streamAltIndex === 1) {
            frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`;
        } else {
            frame.src = `https://www.youtube.com/embed/${ytId}?feature=oembed&autoplay=1`;
        }
    }

    function togglePlayerFullscreen() {
        const target = document.getElementById('videoContainerBox') || document.getElementById('videoFrame') || document.getElementById('activePlayerVideo');
        if (!target) return;

        if (!document.fullscreenElement) {
            if (target.requestFullscreen) {
                target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            } else if (target.msRequestFullscreen) {
                target.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    function reloadPlayer() {
        if (currentActiveLesson) {
            playLesson(currentActiveLesson.id);
        }
    }

    function closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const container = document.getElementById('videoContainerBox');
        if (container) container.innerHTML = '';
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    async function toggleComplete(id) {
        const isDone = completedLessonIds.has(id);
        const newStatus = !isDone;

        try {
            await fetch(`${API_BASE}/api/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ lessonId: id, completed: newStatus })
            });

            if (newStatus) completedLessonIds.add(id);
            else completedLessonIds.delete(id);

            renderLessons();
        } catch (e) {
            alert('Failed to update lesson progress.');
        }
    }

    function setupModals() {
        const modal = document.getElementById('videoModal');
        const closeBtn = document.getElementById('closeModalBtn');

        if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === modal) closeVideoModal();
            });
        }
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeVideoModal();
        });
    }

    function setupQuiz() {
        const container = document.getElementById('interactiveQuizContainer');
        if (!container) return;

        const questions = quizBanks[currentGrade] || [
            { q: `What is the key objective of Class ${currentGrade} conceptual foundations?`, options: ['Memorization only', 'Conceptual mastery and problem solving', 'Skipping practice', 'Random guessing'], ans: 1, exp: 'Understanding core concepts gives durable long-term retention.' },
            { q: 'Which method guarantees highest retention in academic board prep?', options: ['Regular revision and chapter tests', 'Studying once a year', 'Skipping formulas', 'No note taking'], ans: 0, exp: 'Spaced repetition and chapter quizzes solidify memory.' },
            { q: 'What is the standard pass criteria for Odisha Adarsha Vidyalaya examinations?', options: ['10%', '33% and above', '0%', '20%'], ans: 1, exp: '33% marks in each subject is required to pass.' }
        ];

        container.innerHTML = `
            <div style="background:#ffffff; border-radius:16px; padding:28px; box-shadow:0 4px 20px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:14px; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h3 style="margin:0 0 4px; color:#1e3a8a;"><i class="fas fa-award" style="color:#2563eb;"></i> Class ${currentGrade} Chapter Mastery Quiz</h3>
                        <p style="margin:0; color:#64748b; font-size:0.88rem;">Test your chapter knowledge with instant explanations.</p>
                    </div>
                    <span style="background:#eff6ff; color:#2563eb; font-size:0.85rem; font-weight:800; padding:4px 12px; border-radius:20px;">${questions.length} Questions</span>
                </div>
                <form id="studyQuizForm">
                    ${questions.map((q, idx) => `
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:18px;">
                            <p style="font-weight:700; margin-bottom:12px; color:#0f172a; font-size:1rem;">Question ${idx + 1}: ${escapeHtml(q.q)}</p>
                            <div style="display:grid; gap:8px;">
                                ${q.options.map((opt, oIdx) => `
                                    <label style="display:flex; align-items:center; gap:10px; background:#ffffff; border:1px solid #cbd5e1; padding:10px 14px; border-radius:8px; cursor:pointer; font-size:0.92rem; color:#334155; transition:all 0.2s ease;">
                                        <input type="radio" name="q_${idx}" value="${oIdx}" required style="accent-color:#2563eb;">
                                        <span>${escapeHtml(opt)}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <div id="q_exp_${idx}" style="display:none; margin-top:10px; padding:10px; border-radius:6px; font-size:0.88rem;"></div>
                        </div>
                    `).join('')}
                    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                        <button type="submit" class="cta-button" style="padding:12px 24px; font-size:0.95rem; border-radius:8px; cursor:pointer;">
                            <i class="fas fa-check-circle"></i> Submit Quiz Answers
                        </button>
                        <button type="button" onclick="studyEngine.setupQuiz()" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:12px 18px; border-radius:8px; font-weight:700; cursor:pointer;">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                    <div id="quizResultMsg" style="margin-top:16px;"></div>
                </form>
            </div>
        `;

        const form = document.getElementById('studyQuizForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let score = 0;

            questions.forEach((q, idx) => {
                const selected = form.querySelector(`input[name="q_${idx}"]:checked`);
                const expBox = document.getElementById(`q_exp_${idx}`);
                const isCorrect = selected && Number(selected.value) === q.ans;

                if (isCorrect) {
                    score++;
                    if (expBox) {
                        expBox.style.display = 'block';
                        expBox.style.background = '#ecfdf5';
                        expBox.style.color = '#065f46';
                        expBox.innerHTML = `<strong>✓ Correct!</strong> ${escapeHtml(q.exp || '')}`;
                    }
                } else {
                    if (expBox) {
                        expBox.style.display = 'block';
                        expBox.style.background = '#fef2f2';
                        expBox.style.color = '#991b1b';
                        expBox.innerHTML = `<strong>✗ Incorrect. Correct answer is: ${escapeHtml(q.options[q.ans])}</strong><br>${escapeHtml(q.exp || '')}`;
                    }
                }
            });

            const percent = Math.round((score / questions.length) * 100);
            const resultMsg = document.getElementById('quizResultMsg');
            resultMsg.innerHTML = `
                <div style="background:${percent >= 70 ? '#ecfdf5' : '#eff6ff'}; border:1.5px solid ${percent >= 70 ? '#10b981' : '#3b82f6'}; border-radius:12px; padding:18px; text-align:center;">
                    <h3 style="margin:0 0 6px; color:${percent >= 70 ? '#065f46' : '#1e40af'};">Your Score: ${score} / ${questions.length} (${percent}%)</h3>
                    <p style="margin:0; font-size:0.92rem; color:${percent >= 70 ? '#047857' : '#1e3a8a'};">${percent === 100 ? '🌟 Outstanding! Full Marks!' : (percent >= 70 ? '🎉 Great Job! Keep up the momentum!' : '📚 Good practice! Review the explanations above.')}</p>
                </div>
            `;

            try {
                await fetch(`${API_BASE}/api/quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        class: currentGrade,
                        subject: 'Comprehensive',
                        score,
                        total: questions.length
                    })
                });
            } catch (err) {}
        });
    }

    function setupNotesDownloader() {
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                if (!this.getAttribute('onclick') && !this.getAttribute('href')) {
                    e.preventDefault();
                    openPrintableNotes();
                }
            });
        });
    }

    function openPrintableNotes() {
        const win = window.open('', '_blank');
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>OAV Mantra - Class ${currentGrade} Chapter Study Notes</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                    .header h1 { margin: 0; color: #1e3a8a; }
                    .module { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
                    .module h3 { color: #2563eb; margin-top: 0; }
                    ul { padding-left: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>OAV MANTRA CLASSES</h1>
                    <p>Class ${currentGrade} Academic Revision Notes & Formula Guide</p>
                </div>

                <div class="module">
                    <h3>1. Mathematics: Conceptual Cheat Sheet</h3>
                    <ul>
                        <li><strong>Definitions:</strong> Fundamental properties, identities, and number system hierarchies.</li>
                        <li><strong>Step-by-step Algorithms:</strong> Solved examples aligning with Odisha Board & CBSE criteria.</li>
                        <li><strong>Formula Review:</strong> Essential formulas for quick board examination recall.</li>
                    </ul>
                </div>

                <div class="module">
                    <h3>2. Science: Core Theories & Experiments</h3>
                    <ul>
                        <li><strong>Key Definitions:</strong> Clear, concise terminology explanations.</li>
                        <li><strong>Labeled Diagrams:</strong> High-yield examination diagram notes.</li>
                        <li><strong>Activity Questions:</strong> Common reasoning questions frequently asked in final exams.</li>
                    </ul>
                </div>

                <div class="module">
                    <h3>3. Social Science, Odia, English & ICT</h3>
                    <ul>
                        <li><strong>Timeline & Map Work:</strong> Historical dates and geographical features.</li>
                        <li><strong>Grammar Rules:</strong> Byakarana and English syntax rules with examples.</li>
                    </ul>
                </div>

                <p style="text-align:center; font-size:13px; color:#64748b; margin-top:30px;">
                    © 2026 OAV Mantra Classes · Quality Education for Academic Excellence in Odisha
                </p>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `);
        win.document.close();
    }

    return {
        init,
        playLesson,
        toggleComplete,
        viewCustomNote,
        setSubjectFilter,
        setupQuiz,
        togglePlayerFullscreen,
        reloadPlayer,
        switchPlayerStream,
        closeVideoModal,
        closeModal: closeVideoModal
    };
})();
var studyEngine = window.studyEngine;

(function() {
    "use strict";

    const API_BASE = "https://oavmantra.vercel.app";
    const urlParams = new URLSearchParams(window.location.search);
    const targetGrade = (urlParams.get("class") || "VI").toUpperCase();
    let currentLessonId = parseInt(urlParams.get("id"), 10) || null;

    let classLessons = [];
    let classNotes = [];
    let completedLessonIds = new Set();
    let currentActiveLesson = null;
    let activeSubject = "All";
    let searchQuery = "";
    let streamAltIndex = 0;
    let autoplayEnabled = true;

    // Subject theme palettes for dynamic ambient cinema lighting
    const subjectThemes = {
        "mathematics": { glow: "rgba(37, 99, 235, 0.45)", badge: "#2563eb" },
        "science": { glow: "rgba(5, 150, 105, 0.45)", badge: "#059669" },
        "english": { glow: "rgba(124, 58, 237, 0.45)", badge: "#7c3aed" },
        "social studies": { glow: "rgba(217, 119, 6, 0.45)", badge: "#d97706" },
        "odia": { glow: "rgba(225, 29, 72, 0.45)", badge: "#e11d48" },
        "hindi": { glow: "rgba(234, 88, 12, 0.45)", badge: "#ea580c" },
        "sanskrit": { glow: "rgba(79, 70, 229, 0.45)", badge: "#4f46e5" },
        "ict": { glow: "rgba(8, 145, 178, 0.45)", badge: "#0891b2" }
    };

    // Grade Quizzes
    const quizBanks = {
        'VI': [
            {
                q: "What is the smallest natural number?",
                options: ["0", "1", "2", "-1"],
                ans: 1,
                exp: "Natural numbers start from 1 (1, 2, 3...). Zero is a whole number."
            },
            {
                q: "Which vitamin is most abundant in lemons & citrus fruits?",
                options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
                ans: 1,
                exp: "Citrus fruits like lemons, oranges, and amla are rich in Vitamin C."
            },
            {
                q: "What is the capital city of Odisha?",
                options: ["Cuttack", "Bhubaneswar", "Puri", "Sambalpur"],
                ans: 1,
                exp: "Bhubaneswar is the capital of Odisha, famous as the Temple City."
            }
        ],
        'VII': [
            {
                q: "What is (-5) × (-4)?",
                options: ["-20", "20", "-9", "1"],
                ans: 1,
                exp: "Product of two negative integers is always positive: (-5) × (-4) = +20."
            },
            {
                q: "Which organelle is the 'kitchen of the plant cell'?",
                options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"],
                ans: 1,
                exp: "Chloroplast contains chlorophyll where photosynthesis makes food for plants."
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
                q: "What is the square root of 625?",
                options: ["15", "25", "35", "45"],
                ans: 1,
                exp: "25 × 25 = 625."
            },
            {
                q: "Which metal is stored in kerosene due to high reactivity?",
                options: ["Iron", "Sodium", "Copper", "Aluminium"],
                ans: 1,
                exp: "Sodium is an alkali metal that vigorously catches fire with air/moisture."
            },
            {
                q: "In which year was the Battle of Plassey fought?",
                options: ["1757", "1764", "1857", "1707"],
                ans: 0,
                exp: "The Battle of Plassey was fought on 23 June 1757."
            }
        ],
        'IX': [
            {
                q: "Is π (pi) a rational or irrational number?",
                options: ["Rational", "Irrational", "Integer", "Whole Number"],
                ans: 1,
                exp: "Pi is a non-terminating, non-repeating decimal, making it irrational."
            },
            {
                q: "What is the SI unit of force?",
                options: ["Joule", "Newton", "Pascal", "Watt"],
                ans: 1,
                exp: "1 Newton = 1 kg·m/s²."
            },
            {
                q: "When did the French Revolution begin with the storming of Bastille?",
                options: ["1789", "1799", "1815", "1776"],
                ans: 0,
                exp: "The storming of the Bastille occurred on 14 July 1789."
            }
        ],
        'X': [
            {
                q: "In Euclid's division lemma a = bq + r, what is the range of r?",
                options: ["0 ≤ r < b", "0 < r ≤ b", "r > b", "r = 0 only"],
                ans: 0,
                exp: "The remainder r satisfies 0 ≤ r < b."
            },
            {
                q: "What type of reaction is 2H₂ + O₂ → 2H₂O?",
                options: ["Decomposition", "Combination", "Displacement", "Redox only"],
                ans: 1,
                exp: "Two reactants synthesize into a single compound."
            },
            {
                q: "Who was proclaimed the first King of united Italy in 1861?",
                options: ["Mazzini", "Victor Emmanuel II", "Garibaldi", "Cavour"],
                ans: 1,
                exp: "Victor Emmanuel II was crowned King of unified Italy."
            }
        ]
    };

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

    function escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Mobile screen orientation auto-lock to landscape on native fullscreen
    function handleFullscreenRotation() {
        const isFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        const isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent) || window.innerWidth <= 768;

        if (isFs && isMobile && screen.orientation && typeof screen.orientation.lock === 'function') {
            screen.orientation.lock('landscape').catch(() => {});
        } else if (!isFs && screen.orientation && typeof screen.orientation.unlock === 'function') {
            try { screen.orientation.unlock(); } catch(e) {}
        }
    }

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, handleFullscreenRotation);
    });

    async function init() {
        const backBtn = document.getElementById("navBackBtn");
        const studyRoomLink = document.getElementById("watchStudyRoomLink");
        const studyPage = "study-" + targetGrade + ".html";

        if (backBtn) backBtn.href = studyPage;
        if (studyRoomLink) studyRoomLink.href = studyPage;

        setupTabs();
        setupSearch();
        setupActionButtons();
        setupAutoplayToggle();
        setupScratchpad();

        await Promise.all([loadLessons(), loadProgress(), loadNotes()]);

        if (classLessons.length === 0) {
            document.getElementById("watchTitle").textContent = "No video lessons found for Class " + targetGrade;
            document.getElementById("watchViewport").innerHTML = `
                <div class="watch-loading-spinner">
                    <i class="fas fa-video-slash" style="font-size:2.5rem; color:#ef4444;"></i>
                    <span>No video lessons published yet for Class ${targetGrade}.</span>
                </div>
            `;
            return;
        }

        // Active Lesson Selection
        if (currentLessonId) {
            currentActiveLesson = classLessons.find(l => l.id === currentLessonId);
        }
        if (!currentActiveLesson) {
            currentActiveLesson = classLessons[0];
            currentLessonId = currentActiveLesson.id;
        }

        playActiveLesson(currentActiveLesson);
        renderFilters();
        renderPlaylist();
        renderNotesTab();
        renderQuizTab();
        updateProgressWidget();
    }

    async function loadLessons() {
        try {
            if (window.OAV_SUPABASE) {
                classLessons = await window.OAV_SUPABASE.getLessons(targetGrade);
            } else {
                const res = await fetch(`${API_BASE}/api/lessons?class=${encodeURIComponent(targetGrade)}`);
                if (res.ok) {
                    const data = await res.json();
                    classLessons = Array.isArray(data) ? data : (data.lessons || []);
                }
            }
        } catch(e) {
            console.warn("Could not fetch lessons:", e);
            classLessons = [];
        }
    }

    async function loadNotes() {
        try {
            if (window.OAV_SUPABASE) {
                classNotes = await window.OAV_SUPABASE.getNotes(targetGrade);
            } else {
                const res = await fetch(`${API_BASE}/api/materials?class=${encodeURIComponent(targetGrade)}`);
                if (res.ok) {
                    const data = await res.json();
                    classNotes = Array.isArray(data) ? data : (data.materials || []);
                }
            }
        } catch(e) {
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
        } catch(e) {
            const localDone = JSON.parse(localStorage.getItem(`oav_done_${targetGrade}`) || '[]');
            completedLessonIds = new Set(localDone);
        }
    }

    function playActiveLesson(lesson) {
        if (!lesson) return;
        currentActiveLesson = lesson;
        currentLessonId = lesson.id;

        // Update URL query string without reloading page
        const newUrl = `watch.html?id=${lesson.id}&class=${targetGrade}`;
        window.history.replaceState({ id: lesson.id }, "", newUrl);

        // Update Page Title
        document.title = `${lesson.title} - Class ${targetGrade} Video | OAV Mantra`;

        // Update Badges & Titles
        document.getElementById("watchGradeBadge").textContent = "Class " + targetGrade;
        document.getElementById("watchSubjectBadge").textContent = lesson.subject || "Syllabus Video";
        document.getElementById("watchTitle").textContent = lesson.title;
        document.getElementById("watchDescText").textContent = lesson.description || "Comprehensive conceptual syllabus video class designed for high-scoring Odisha Board and CBSE preparation.";

        // Dynamic Ambient Glow
        updateAmbientGlow(lesson.subject);

        // Update Mastered state button
        syncMasteredBtn(completedLessonIds.has(lesson.id));

        // Generate embed
        let rawUrl = (lesson.video_url || '').trim();
        const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
        let cleanUrl = srcMatch && srcMatch[1] ? srcMatch[1].trim() : rawUrl;

        const ytId = extractYouTubeId(cleanUrl);
        const isDirectVideo = /\.(mp4|webm|ogg|mov)($|\?)/i.test(cleanUrl);
        const isMeeting = /meet\.google\.com|zoom\.us|teams\.microsoft\.com/i.test(cleanUrl);

        const viewport = document.getElementById("watchViewport");

        if (isMeeting) {
            viewport.innerHTML = `
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; color:#fff;">
                    <i class="fas fa-video" style="font-size:3.5rem; color:#dc2626; margin-bottom:16px;"></i>
                    <h3 style="margin:0 0 10px; color:#fff; font-size:1.3rem;">Live Meeting Classroom</h3>
                    <p style="color:#94a3b8; max-width:460px; margin-bottom:20px; font-size:0.95rem;">Join your live batch session with the teacher.</p>
                    <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener" class="watch-btn" style="background:#dc2626; color:#fff; padding:12px 24px; font-size:1rem; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                        <i class="fas fa-external-link-alt"></i> Enter Live Room
                    </a>
                </div>
            `;
        } else if (isDirectVideo) {
            viewport.innerHTML = `<video id="activePlayerVideo" src="${escapeHtml(cleanUrl)}" controls autoplay playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000;"></video>`;
        } else if (ytId) {
            // Unobstructed YouTube embed with fs=1, enablejsapi=1
            const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&fs=1&enablejsapi=1`;
            viewport.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(embedUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
        } else {
            viewport.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(cleanUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
        }

        // Highlight active card in playlist
        document.querySelectorAll(".playlist-video-card").forEach(c => c.classList.remove("is-active-playing"));
        const activeCard = document.getElementById(`playlist-card-${lesson.id}`);
        if (activeCard) {
            activeCard.classList.add("is-active-playing");
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Update Prev/Next button states
        updatePrevNextButtons();
        renderNotesTab();
    }

    function updateAmbientGlow(subjectName) {
        const glowElem = document.getElementById("ambientGlow");
        if (!glowElem) return;

        const subKey = (subjectName || "").toLowerCase();
        const theme = subjectThemes[subKey] || { glow: "rgba(37, 99, 235, 0.45)" };
        glowElem.style.background = `radial-gradient(circle, ${theme.glow} 0%, rgba(56, 189, 248, 0.15) 50%, transparent 80%)`;
    }

    function syncMasteredBtn(isDone) {
        const btn = document.getElementById("watchMasteredBtn");
        const txt = document.getElementById("watchMasteredText");
        if (!btn) return;

        if (isDone) {
            btn.classList.add("is-done");
            if (txt) txt.textContent = "Mastered ✓";
            const icon = btn.querySelector("i");
            if (icon) icon.className = "fas fa-check-circle";
        } else {
            btn.classList.remove("is-done");
            if (txt) txt.textContent = "Mark Mastered";
            const icon = btn.querySelector("i");
            if (icon) icon.className = "far fa-circle";
        }
    }

    async function toggleMastered() {
        if (!currentActiveLesson) return;
        const id = currentActiveLesson.id;
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

            // Update local storage backup
            localStorage.setItem(`oav_done_${targetGrade}`, JSON.stringify(Array.from(completedLessonIds)));

            syncMasteredBtn(newStatus);
            renderPlaylist();
            updateProgressWidget();

            // If user completed lesson and autoplay is on, offer auto advance
            if (newStatus && autoplayEnabled) {
                const recorded = classLessons.filter(l => l.lesson_type !== 'live');
                const idx = recorded.findIndex(l => l.id === id);
                if (idx >= 0 && idx < recorded.length - 1) {
                    setTimeout(() => {
                        playNextLesson();
                    }, 1200);
                }
            }
        } catch(e) {
            // Local fallback
            if (newStatus) completedLessonIds.add(id);
            else completedLessonIds.delete(id);
            localStorage.setItem(`oav_done_${targetGrade}`, JSON.stringify(Array.from(completedLessonIds)));
            syncMasteredBtn(newStatus);
            renderPlaylist();
            updateProgressWidget();
        }
    }

    function updateProgressWidget() {
        const recorded = classLessons.filter(l => l.lesson_type !== 'live');
        const total = recorded.length;
        const done = completedLessonIds.size;
        const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

        const fill = document.getElementById("playlistProgressFill");
        const txt = document.getElementById("playlistProgressText");

        if (fill) fill.style.width = pct + "%";
        if (txt) txt.textContent = `${done}/${total} (${pct}%)`;
    }

    function updatePrevNextButtons() {
        const prevBtn = document.getElementById("watchPrevBtn");
        const nextBtn = document.getElementById("watchNextBtn");
        if (!currentActiveLesson) return;

        const recorded = classLessons.filter(l => l.lesson_type !== 'live');
        const idx = recorded.findIndex(l => l.id === currentActiveLesson.id);

        if (prevBtn) {
            prevBtn.style.opacity = idx > 0 ? "1" : "0.45";
            prevBtn.style.pointerEvents = idx > 0 ? "auto" : "none";
        }
        if (nextBtn) {
            nextBtn.style.opacity = (idx >= 0 && idx < recorded.length - 1) ? "1" : "0.45";
            nextBtn.style.pointerEvents = (idx >= 0 && idx < recorded.length - 1) ? "auto" : "none";
        }
    }

    function playPrevLesson() {
        if (!currentActiveLesson) return;
        const recorded = classLessons.filter(l => l.lesson_type !== 'live');
        const idx = recorded.findIndex(l => l.id === currentActiveLesson.id);
        if (idx > 0) {
            selectLesson(recorded[idx - 1].id);
        }
    }

    function playNextLesson() {
        if (!currentActiveLesson) return;
        const recorded = classLessons.filter(l => l.lesson_type !== 'live');
        const idx = recorded.findIndex(l => l.id === currentActiveLesson.id);
        if (idx >= 0 && idx < recorded.length - 1) {
            selectLesson(recorded[idx + 1].id);
        }
    }

    function reloadPlayer() {
        if (currentActiveLesson) playActiveLesson(currentActiveLesson);
    }

    function switchStream() {
        if (!currentActiveLesson) return;
        const ytId = extractYouTubeId(currentActiveLesson.video_url || '');
        if (!ytId) return;

        const frame = document.getElementById('videoFrame');
        if (!frame) return;

        streamAltIndex = (streamAltIndex + 1) % 3;
        if (streamAltIndex === 0) {
            frame.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&fs=1&enablejsapi=1`;
        } else if (streamAltIndex === 1) {
            frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&fs=1`;
        } else {
            frame.src = `https://www.youtube.com/embed/${ytId}?feature=oembed&autoplay=1&fs=1`;
        }
    }

    function shareVideo() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("Video link copied to clipboard!");
            }).catch(() => {
                prompt("Copy video link:", window.location.href);
            });
        }
    }

    function setupActionButtons() {
        const masteredBtn = document.getElementById("watchMasteredBtn");
        const prevBtn = document.getElementById("watchPrevBtn");
        const nextBtn = document.getElementById("watchNextBtn");
        const replayBtn = document.getElementById("watchReplayBtn");
        const streamBtn = document.getElementById("watchStreamBtn");
        const shareBtn = document.getElementById("watchShareBtn");

        if (masteredBtn) masteredBtn.addEventListener("click", toggleMastered);
        if (prevBtn) prevBtn.addEventListener("click", playPrevLesson);
        if (nextBtn) nextBtn.addEventListener("click", playNextLesson);
        if (replayBtn) replayBtn.addEventListener("click", reloadPlayer);
        if (streamBtn) streamBtn.addEventListener("click", switchStream);
        if (shareBtn) shareBtn.addEventListener("click", shareVideo);
    }

    function setupAutoplayToggle() {
        const toggle = document.getElementById("autoplayToggle");
        if (!toggle) return;
        toggle.checked = autoplayEnabled;
        toggle.addEventListener("change", (e) => {
            autoplayEnabled = e.target.checked;
        });
    }

    function setupTabs() {
        const tabBtns = document.querySelectorAll(".watch-tab-btn");
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-tab");
                tabBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                document.querySelectorAll(".watch-tab-pane").forEach(pane => {
                    pane.classList.remove("active");
                });
                const activePane = document.getElementById("tab-" + target);
                if (activePane) activePane.classList.add("active");
            });
        });
    }

    function setupSearch() {
        const input = document.getElementById("watchSearchInput");
        const clear = document.getElementById("watchSearchClear");
        if (!input) return;

        input.addEventListener("input", (e) => {
            searchQuery = (e.target.value || "").trim().toLowerCase();
            if (clear) clear.style.display = searchQuery ? "inline-flex" : "none";
            renderPlaylist();
        });

        if (clear) {
            clear.addEventListener("click", () => {
                input.value = "";
                searchQuery = "";
                clear.style.display = "none";
                renderPlaylist();
                input.focus();
            });
        }
    }

    function setupScratchpad() {
        const textarea = document.getElementById("studentNotesArea");
        const clearBtn = document.getElementById("clearMyNotesBtn");
        const status = document.getElementById("scratchpadSaveStatus");
        if (!textarea) return;

        const storageKey = `oav_student_notes_${targetGrade}`;
        textarea.value = localStorage.getItem(storageKey) || "";

        let timeout = null;
        textarea.addEventListener("input", (e) => {
            if (status) status.innerHTML = '<i class="fas fa-sync fa-spin"></i> Saving...';
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                localStorage.setItem(storageKey, e.target.value);
                if (status) status.innerHTML = '<i class="fas fa-check"></i> Saved automatically';
            }, 500);
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (confirm("Clear all your saved notes for this class?")) {
                    textarea.value = "";
                    localStorage.removeItem(storageKey);
                    if (status) status.innerHTML = '<i class="fas fa-trash"></i> Notes cleared';
                }
            });
        }
    }

    function renderFilters() {
        const chipsContainer = document.getElementById("watchFilterChips");
        if (!chipsContainer) return;

        const subjects = ["All"];
        classLessons.forEach(l => {
            if (l.subject && !subjects.includes(l.subject)) {
                subjects.push(l.subject);
            }
        });

        chipsContainer.innerHTML = subjects.map(sub => `
            <button type="button" class="watch-chip ${activeSubject.toLowerCase() === sub.toLowerCase() ? 'active' : ''}" onclick="window.watchPlayer.setSubject('${escapeHtml(sub)}')">
                ${sub === 'All' ? '<i class="fas fa-star" style="color:#f59e0b; margin-right:4px;"></i> All' : escapeHtml(sub)}
            </button>
        `).join('');
    }

    function setSubject(sub) {
        activeSubject = sub;
        renderFilters();
        renderPlaylist();
    }

    function renderPlaylist() {
        const track = document.getElementById("watchVideosGrid");
        const countBadge = document.getElementById("watchLessonsCount");
        if (!track) return;

        let filtered = classLessons.filter(l => l.lesson_type !== 'live');

        if (activeSubject !== "All") {
            filtered = filtered.filter(l => (l.subject || "").toLowerCase() === activeSubject.toLowerCase());
        }

        if (searchQuery) {
            filtered = filtered.filter(l =>
                (l.title || "").toLowerCase().includes(searchQuery) ||
                (l.description || "").toLowerCase().includes(searchQuery) ||
                (l.subject || "").toLowerCase().includes(searchQuery)
            );
        }

        if (countBadge) {
            countBadge.textContent = `${filtered.length} Videos`;
        }

        if (filtered.length === 0) {
            track.innerHTML = `
                <div style="text-align: center; padding: 36px 16px; color: #94a3b8;">
                    <i class="fas fa-search" style="font-size: 1.8rem; color: #64748b; margin-bottom: 10px;"></i>
                    <p style="font-size: 0.95rem; color: #f8fafc; font-weight: 700;">No lessons match your search</p>
                    <p style="font-size: 0.8rem;">Try clearing search or picking another subject.</p>
                </div>
            `;
            return;
        }

        track.innerHTML = filtered.map(lesson => {
            const isDone = completedLessonIds.has(lesson.id);
            const isPlaying = currentActiveLesson && currentActiveLesson.id === lesson.id;
            const ytId = extractYouTubeId(lesson.video_url || '');
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

            return `
                <div class="playlist-video-card ${isPlaying ? 'is-active-playing' : ''}" id="playlist-card-${lesson.id}" onclick="window.watchPlayer.selectLesson(${lesson.id})">
                    <div class="playlist-card-thumb">
                        ${thumbUrl ? `
                            <img src="${thumbUrl}" alt="${escapeHtml(lesson.title)}" loading="lazy">
                        ` : `
                            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#3b82f6;">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                        `}
                        <span class="playlist-card-duration">15 Mins</span>
                        ${isPlaying ? '<span class="playlist-badge-playing"><i class="fas fa-play"></i></span>' : ''}
                    </div>
                    <div class="playlist-card-body">
                        <div class="playlist-card-meta">
                            <span class="playlist-card-subject">${escapeHtml(lesson.subject || 'Class ' + targetGrade)}</span>
                            ${isDone ? '<span class="playlist-card-done"><i class="fas fa-check-circle"></i> Mastered</span>' : ''}
                        </div>
                        <h4 class="playlist-card-title">${escapeHtml(lesson.title)}</h4>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderNotesTab() {
        const hub = document.getElementById("watchNotesHub");
        if (!hub) return;

        let filtered = classNotes;
        if (currentActiveLesson && currentActiveLesson.subject) {
            const subNotes = classNotes.filter(n => (n.subject || "").toLowerCase() === currentActiveLesson.subject.toLowerCase());
            if (subNotes.length > 0) filtered = subNotes;
        }

        if (filtered.length === 0) {
            hub.innerHTML = `
                <div style="text-align:center; padding:24px 16px; color:#94a3b8;">
                    <i class="fas fa-file-pdf" style="font-size:2rem; color:#64748b; margin-bottom:8px;"></i>
                    <p style="color:#f8fafc; font-weight:700; font-size:0.95rem;">No Study Notes uploaded yet</p>
                    <p style="font-size:0.82rem;">Chapter formulas and revision summaries will be posted by teachers.</p>
                </div>
            `;
            return;
        }

        hub.innerHTML = filtered.map(note => `
            <div class="notes-hub-item">
                <div class="notes-item-left">
                    <div class="notes-item-icon"><i class="fas fa-file-pdf"></i></div>
                    <div>
                        <div class="notes-item-title">${escapeHtml(note.title)}</div>
                        <div class="notes-item-sub">${escapeHtml(note.subject || 'Class ' + targetGrade)} · Revision Material</div>
                    </div>
                </div>
                <div>
                    ${note.file_url ? `
                        <a href="${escapeHtml(note.file_url)}" target="_blank" rel="noopener" class="watch-btn watch-btn-room">
                            <i class="fas fa-file-download"></i> PDF
                        </a>
                    ` : `
                        <button type="button" onclick="window.watchPlayer.openNoteModal(${note.id})" class="watch-btn watch-btn-subtle">
                            <i class="fas fa-book-open"></i> Read
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    function renderQuizTab() {
        const quizHub = document.getElementById("watchQuizHub");
        if (!quizHub) return;

        const bank = quizBanks[targetGrade] || quizBanks['VI'];
        quizHub.innerHTML = bank.map((item, qIdx) => `
            <div class="quiz-card" id="quiz-card-${qIdx}">
                <div class="quiz-q-num">Question ${qIdx + 1} of ${bank.length}</div>
                <h4 class="quiz-question">${escapeHtml(item.q)}</h4>
                <div class="quiz-options-list">
                    ${item.options.map((opt, optIdx) => `
                        <button type="button" class="quiz-opt-btn" onclick="window.watchPlayer.answerQuiz(${qIdx}, ${optIdx})">
                            ${escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
                <div class="quiz-exp-box" id="quiz-exp-${qIdx}" style="display:none;"></div>
            </div>
        `).join('');
    }

    function answerQuiz(qIdx, selectedOptIdx) {
        const bank = quizBanks[targetGrade] || quizBanks['VI'];
        const item = bank[qIdx];
        if (!item) return;

        const card = document.getElementById(`quiz-card-${qIdx}`);
        if (!card) return;

        const buttons = card.querySelectorAll(".quiz-opt-btn");
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === item.ans) {
                btn.classList.add("correct");
            } else if (idx === selectedOptIdx) {
                btn.classList.add("wrong");
            }
        });

        const expBox = document.getElementById(`quiz-exp-${qIdx}`);
        if (expBox) {
            const isRight = selectedOptIdx === item.ans;
            expBox.innerHTML = `
                <strong style="color:${isRight ? '#10b981' : '#ef4444'};">${isRight ? '✓ Correct Answer!' : '✗ Incorrect'}</strong>
                <p style="margin-top:4px;">${escapeHtml(item.exp)}</p>
            `;
            expBox.style.display = "block";
        }
    }

    function openNoteModal(id) {
        const note = classNotes.find(n => n.id === id);
        if (!note) return;

        const modal = document.getElementById("watchNoteModal");
        const title = document.getElementById("modalNoteTitle");
        const subject = document.getElementById("modalNoteSubject");
        const body = document.getElementById("modalNoteBody");
        const closeBtn = document.getElementById("modalNoteCloseBtn");
        const doneBtn = document.getElementById("modalNoteDoneBtn");

        if (title) title.textContent = note.title;
        if (subject) subject.textContent = `${note.subject} · Class ${targetGrade}`;
        if (body) body.textContent = note.content || "No detailed text content provided.";

        if (modal) modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        const closeFunc = () => {
            if (modal) modal.style.display = "none";
            document.body.style.overflow = "auto";
        };
        if (closeBtn) closeBtn.onclick = closeFunc;
        if (doneBtn) doneBtn.onclick = closeFunc;
    }

    function selectLesson(id) {
        const lesson = classLessons.find(l => l.id === id);
        if (!lesson) return;

        playActiveLesson(lesson);
        renderPlaylist();

        // Smooth scroll to player on mobile
        if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    window.watchPlayer = {
        setSubject,
        selectLesson,
        answerQuiz,
        openNoteModal
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

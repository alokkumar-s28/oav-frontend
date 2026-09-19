(function() {
    "use strict";

    const API_BASE = "https://oavmantra.vercel.app";
    const urlParams = new URLSearchParams(window.location.search);
    const targetGrade = (urlParams.get("class") || "VI").toUpperCase();
    let currentLessonId = parseInt(urlParams.get("id"), 10) || null;

    let classLessons = [];
    let completedLessonIds = new Set();
    let currentActiveLesson = null;
    let activeSubject = "All";
    let searchQuery = "";
    let streamAltIndex = 0;

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

    // Auto-rotate mobile screen on YouTube native fullscreen
    function handleFullscreenMobileRotation() {
        const isFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        const isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent) || window.innerWidth <= 768;

        if (isFs) {
            if (isMobile && screen.orientation && typeof screen.orientation.lock === 'function') {
                screen.orientation.lock('landscape').catch(function(err) {
                    console.log('Mobile landscape orientation lock notice:', err);
                });
            }
        } else {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                try {
                    screen.orientation.unlock();
                } catch(e) {}
            }
        }
    }

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, handleFullscreenMobileRotation);
    });

    async function init() {
        const backBtn = document.getElementById("navBackBtn");
        const studyRoomLink = document.getElementById("watchStudyRoomLink");
        const studyPage = "study-" + targetGrade + ".html";

        if (backBtn) backBtn.href = studyPage;
        if (studyRoomLink) studyRoomLink.href = studyPage;

        setupSearch();
        setupActionButtons();

        await Promise.all([loadLessons(), loadProgress()]);

        if (classLessons.length === 0) {
            document.getElementById("watchTitle").textContent = "No lessons found for Class " + targetGrade;
            document.getElementById("watchViewport").innerHTML = `
                <div class="watch-loading-spinner">
                    <i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>
                    <span>No video lessons published yet for Class ${targetGrade}.</span>
                </div>
            `;
            return;
        }

        // Find active lesson
        if (currentLessonId) {
            currentActiveLesson = classLessons.find(l => l.id === currentLessonId);
        }
        if (!currentActiveLesson) {
            currentActiveLesson = classLessons[0];
            currentLessonId = currentActiveLesson.id;
        }

        playActiveLesson(currentActiveLesson);
        renderFilters();
        renderAnotherVideos();
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
        document.getElementById("watchSubjectBadge").textContent = lesson.subject || "Lesson";
        document.getElementById("watchTitle").textContent = lesson.title;
        document.getElementById("watchDescText").textContent = lesson.description || "Comprehensive syllabus video class designed for academic board preparation.";

        // Update Mastered button state
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
                    <h3 style="margin:0 0 10px; color:#fff; font-size:1.3rem;">Live Class Session Ready</h3>
                    <p style="color:#94a3b8; max-width:480px; margin-bottom:20px; font-size:0.95rem;">Join your teacher and classmates in the live meeting room.</p>
                    <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener" style="background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; font-weight:700; text-decoration:none; font-size:1rem; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                        <i class="fas fa-external-link-alt"></i> Enter Live Class Room Now
                    </a>
                </div>
            `;
        } else if (isDirectVideo) {
            viewport.innerHTML = `<video id="activePlayerVideo" src="${escapeHtml(cleanUrl)}" controls autoplay playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000;"></video>`;
        } else if (ytId) {
            const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&fs=1&enablejsapi=1`;
            viewport.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(embedUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
        } else {
            viewport.innerHTML = `<iframe id="videoFrame" src="${escapeHtml(cleanUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
        }

        // Highlight active card in the grid below
        document.querySelectorAll(".watch-card").forEach(c => c.classList.remove("is-active-playing"));
        const activeCard = document.getElementById(`watch-card-${lesson.id}`);
        if (activeCard) activeCard.classList.add("is-active-playing");
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

            syncMasteredBtn(newStatus);
            renderAnotherVideos();
        } catch(e) {
            alert("Failed to update progress.");
        }
    }

    function reloadPlayer() {
        if (currentActiveLesson) {
            playActiveLesson(currentActiveLesson);
        }
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
        const replayBtn = document.getElementById("watchReplayBtn");
        const streamBtn = document.getElementById("watchStreamBtn");
        const shareBtn = document.getElementById("watchShareBtn");

        if (masteredBtn) masteredBtn.addEventListener("click", toggleMastered);
        if (replayBtn) replayBtn.addEventListener("click", reloadPlayer);
        if (streamBtn) streamBtn.addEventListener("click", switchStream);
        if (shareBtn) shareBtn.addEventListener("click", shareVideo);
    }

    function setupSearch() {
        const input = document.getElementById("watchSearchInput");
        const clear = document.getElementById("watchSearchClear");
        if (!input) return;

        input.addEventListener("input", (e) => {
            searchQuery = (e.target.value || "").trim().toLowerCase();
            if (clear) clear.style.display = searchQuery ? "inline-flex" : "none";
            renderAnotherVideos();
        });

        if (clear) {
            clear.addEventListener("click", () => {
                input.value = "";
                searchQuery = "";
                clear.style.display = "none";
                renderAnotherVideos();
                input.focus();
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
                ${sub === 'All' ? '<i class="fas fa-star" style="color:#f59e0b; margin-right:4px;"></i> All Subjects' : escapeHtml(sub)}
            </button>
        `).join('');
    }

    function setSubject(sub) {
        activeSubject = sub;
        renderFilters();
        renderAnotherVideos();
    }

    function renderAnotherVideos() {
        const grid = document.getElementById("watchVideosGrid");
        const countBadge = document.getElementById("watchLessonsCount");
        if (!grid) return;

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
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #64748b; margin-bottom: 12px;"></i>
                    <p style="font-size: 1rem; color: #f8fafc; font-weight: 700;">No other video lessons found</p>
                    <p style="font-size: 0.85rem;">Try selecting another subject or clearing your search.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(lesson => {
            const isDone = completedLessonIds.has(lesson.id);
            const isPlaying = currentActiveLesson && currentActiveLesson.id === lesson.id;
            const ytId = extractYouTubeId(lesson.video_url || '');
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

            return `
                <div class="watch-card ${isPlaying ? 'is-active-playing' : ''}" id="watch-card-${lesson.id}" onclick="window.watchPlayer.selectLesson(${lesson.id})">
                    <div class="watch-card-thumb">
                        ${thumbUrl ? `
                            <img src="${thumbUrl}" alt="${escapeHtml(lesson.title)}" loading="lazy">
                        ` : `
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#3b82f6; font-size:2rem;">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                        `}
                        <div class="watch-thumb-play-icon"><i class="fas fa-play"></i></div>
                        <span class="watch-card-duration">15 Mins</span>
                        ${isPlaying ? '<span class="watch-badge-playing-now"><i class="fas fa-play"></i> Playing</span>' : ''}
                    </div>
                    <div class="watch-card-body">
                        <div class="watch-card-meta">
                            <span class="watch-card-subject">${escapeHtml(lesson.subject || 'Class ' + targetGrade)}</span>
                            ${isDone ? '<span class="watch-card-done-badge"><i class="fas fa-check-circle"></i> Mastered</span>' : ''}
                        </div>
                        <h3 class="watch-card-title">${escapeHtml(lesson.title)}</h3>
                    </div>
                </div>
            `;
        }).join('');
    }

    function selectLesson(id) {
        const lesson = classLessons.find(l => l.id === id);
        if (!lesson) return;

        playActiveLesson(lesson);
        renderAnotherVideos();

        // Smooth scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.watchPlayer = {
        setSubject,
        selectLesson
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
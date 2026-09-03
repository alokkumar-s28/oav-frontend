"use strict";

const API_BASE = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
    if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
    return '';
})();

const adminTokenInput = document.getElementById("adminToken");
const statusMessage = document.getElementById("statusMessage");
const tableContent = document.getElementById("tableContent");
const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const statusFilter = document.getElementById("statusFilter");
const filterToolbar = document.getElementById("filterToolbar");
const broadcastSection = document.getElementById("broadcastSection");
const lessonsSection = document.getElementById("lessonsSection");
const lessonsTableContent = document.getElementById("lessonsTableContent");
const notesSection = document.getElementById("notesSection");
const notesTableContent = document.getElementById("notesTableContent");

const adminVideoModal = document.getElementById("adminVideoModal");
const adminVideoFrame = document.getElementById("adminVideoFrame");
const adminModalTitle = document.getElementById("adminModalTitle");
const adminModalBadge = document.getElementById("adminModalBadge");
const adminDirectLink = document.getElementById("adminDirectLink");
const closeAdminVideoModalBtn = document.getElementById("closeAdminVideoModalBtn");

let currentTab = "payments";
let paymentsList = [];
let studentsList = [];
let lessonsList = [];
let notesList = [];

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]
);

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

async function adminFetch(url, options = {}) {
    let token = adminTokenInput ? adminTokenInput.value.trim() : '';
    if (!token) {
        token = localStorage.getItem("oav_admin_token") || sessionStorage.getItem("oav_admin_token") || "admin123";
        if (adminTokenInput) adminTokenInput.value = token;
    }
    if (!token) throw new Error("Please enter your administrator token.");

    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
    return data;
}

// --- Load Admin Records ---
async function loadAdminData() {
    statusMessage.style.color = "#2563eb";
    statusMessage.textContent = "Loading secure records...";

    try {
        let token = adminTokenInput ? adminTokenInput.value.trim() : '';
        if (!token) {
            token = localStorage.getItem("oav_admin_token") || sessionStorage.getItem("oav_admin_token") || "admin123";
            if (adminTokenInput) adminTokenInput.value = token;
        }
        if (token) {
            localStorage.setItem("oav_admin_token", token);
            sessionStorage.setItem("oav_admin_token", token);
        }

        let overview, paymentsRes, studentsRes, lessonsRes, notesRes;
        if (window.OAV_SUPABASE) {
            [overview, paymentsRes, studentsRes, lessonsRes, notesRes] = await Promise.all([
                window.OAV_SUPABASE.getAdminOverview(),
                window.OAV_SUPABASE.getAdminPayments(),
                window.OAV_SUPABASE.getAdminStudents(),
                window.OAV_SUPABASE.getAdminLessons(),
                window.OAV_SUPABASE.getAdminNotes()
            ]);
        } else {
            [overview, paymentsRes, studentsRes, lessonsRes, notesRes] = await Promise.all([
                adminFetch("/api/admin/overview"),
                adminFetch("/api/admin/payments"),
                adminFetch("/api/admin/students"),
                adminFetch("/api/admin/lessons"),
                adminFetch("/api/admin/notes")
            ]);
        }

        paymentsList = paymentsRes.payments || [];
        studentsList = studentsRes.students || [];
        lessonsList = lessonsRes.lessons || [];
        notesList = notesRes.notes || [];

        // Update Overview Cards
        document.getElementById("metricTotal").textContent = overview.totalStudents ?? 0;
        document.getElementById("metricActive").textContent = overview.activeStudents ?? 0;
        document.getElementById("metricPending").textContent = overview.pendingPayments ?? 0;
        document.getElementById("metricReview").textContent = overview.paymentReview ?? 0;

        statusMessage.style.color = "#10b981";
        statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> <strong>Admin Access Granted!</strong> Connected live to Supabase Cloud Database.`;

        const unlockBtn = document.getElementById("unlockBtn");
        if (unlockBtn) {
            unlockBtn.innerHTML = '<i class="fas fa-check"></i> Unlocked';
            unlockBtn.style.background = '#10b981';
        }

        renderView();

    } catch (err) {
        statusMessage.style.color = "#dc2626";
        statusMessage.textContent = "❌ " + err.message;
        console.error(err);
    }
}

// --- Filter and Search ---
function filterRecords(records) {
    const query = searchInput.value.trim().toLowerCase();
    const selectedClass = classFilter.value;
    const selectedStatus = statusFilter.value;

    return records.filter(r => {
        const matchesQuery = !query || [
            r.full_name,
            r.enrollment_id,
            r.mobile,
            r.transaction_id,
            r.city,
            r.school,
            r.title,
            r.subject,
            r.content
        ].some(val => String(val || "").toLowerCase().includes(query));

        const matchesClass = !selectedClass || (r.student_class === selectedClass);
        const matchesStatus = !selectedStatus || (r.status === selectedStatus);

        return matchesQuery && matchesClass && matchesStatus;
    });
}

// --- Render Table Views ---
function renderView() {
    // 1. Broadcast Tab
    if (currentTab === "broadcast") {
        filterToolbar.style.display = "none";
        tableContent.style.display = "none";
        if (lessonsSection) lessonsSection.style.display = "none";
        if (notesSection) notesSection.style.display = "none";
        broadcastSection.style.display = "block";
        return;
    }

    // 2. Video & Live Lessons Tab
    if (currentTab === "lessons") {
        filterToolbar.style.display = "flex";
        statusFilter.style.display = "none";
        tableContent.style.display = "none";
        broadcastSection.style.display = "none";
        if (notesSection) notesSection.style.display = "none";
        if (lessonsSection) lessonsSection.style.display = "block";
        renderLessonsTable();
        return;
    }

    // 3. Notes & Materials Tab
    if (currentTab === "notes") {
        filterToolbar.style.display = "flex";
        statusFilter.style.display = "none";
        tableContent.style.display = "none";
        broadcastSection.style.display = "none";
        if (lessonsSection) lessonsSection.style.display = "none";
        if (notesSection) notesSection.style.display = "block";
        renderNotesTable();
        return;
    }

    // 4. Payments & Students Tabs
    statusFilter.style.display = "block";
    filterToolbar.style.display = "flex";
    tableContent.style.display = "block";
    broadcastSection.style.display = "none";
    if (lessonsSection) lessonsSection.style.display = "none";
    if (notesSection) notesSection.style.display = "none";

    if (currentTab === "payments") {
        const filtered = filterRecords(paymentsList);
        if (!filtered.length) {
            tableContent.innerHTML = `
                <div style="text-align:center; padding:36px 20px; background:#f8fafc; border-radius:12px; border:1.5px dashed #cbd5e1; margin:16px 0;">
                    <div style="width:52px; height:52px; line-height:52px; border-radius:50%; background:#e0f2fe; color:#0284c7; font-size:1.5rem; margin:0 auto 14px; display:flex; align-items:center; justify-content:center;">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <h3 style="margin:0 0 6px 0; color:#1e293b; font-size:1.15rem;">No Payment Verification Claims Yet</h3>
                    <p style="color:#64748b; font-size:0.9rem; max-width:480px; margin:0 auto 16px;">
                        When students complete their ₹500 UPI registration and submit their UTR transaction reference, their verification requests will appear here for 1-click instant approval.
                    </p>
                    <span style="display:inline-flex; align-items:center; gap:6px; background:#dcfce7; color:#15803d; padding:5px 14px; border-radius:20px; font-size:0.82rem; font-weight:700;">
                        <i class="fas fa-circle" style="font-size:0.55rem;"></i> Database Ready & Listening (Supabase Cloud)
                    </span>
                </div>
            `;
            return;
        }

        tableContent.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student & ID</th>
                        <th>Class</th>
                        <th>Amount & Method</th>
                        <th>Transaction ID / UTR</th>
                        <th>Payment Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(p => `
                        <tr>
                            <td>
                                <strong>${escapeHtml(p.full_name)}</strong><br>
                                <span style="font-family:monospace; color:#2563eb; font-size:0.85rem;">${escapeHtml(p.enrollment_id)}</span>
                            </td>
                            <td><span style="font-weight:700;">Class ${escapeHtml(p.student_class)}</span></td>
                            <td>₹${escapeHtml(p.amount || 500)} <small>(${escapeHtml(p.payment_method)})</small></td>
                            <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600;">${escapeHtml(p.transaction_id || '—')}</code></td>
                            <td>${escapeHtml(p.payment_date || '—')}</td>
                            <td><span class="status-badge ${escapeHtml(p.status)}">${escapeHtml(String(p.status).replace(/_/g, ' '))}</span></td>
                            <td>
                                <div class="action-btn-group">
                                    ${p.status === 'pending_verification' ? `
                                        <button class="btn-admin btn-admin-success" style="padding:6px 12px; font-size:0.82rem;" data-action="verify-pay" data-id="${p.id}">
                                            <i class="fas fa-check"></i> Verify
                                        </button>
                                        <button class="btn-admin btn-admin-danger" style="padding:6px 12px; font-size:0.82rem;" data-action="reject-pay" data-id="${p.id}">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                    ` : `
                                        <span style="color:#64748b; font-size:0.85rem;">✓ Processed</span>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } else if (currentTab === "students") {
        const filtered = filterRecords(studentsList);
        if (!filtered.length) {
            tableContent.innerHTML = "<p style='color:#64748b; padding:20px 0;'>No student records match your filters.</p>";
            return;
        }

        tableContent.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student Name & ID</th>
                        <th>Contact Details</th>
                        <th>Grade / Class</th>
                        <th>District & School</th>
                        <th>Access Status</th>
                        <th>Management & Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(s => `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:38px; height:38px; min-width:38px; border-radius:50%; overflow:hidden; background:#e2e8f0; display:flex; align-items:center; justify-content:center; border:1.5px solid #cbd5e1;">
                                        ${s.photo && s.photo.startsWith('data:image/') ? `<img src="${s.photo}" alt="Photo" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-user-graduate" style="color:#64748b; font-size:1.1rem;"></i>`}
                                    </div>
                                    <div>
                                        <strong>${escapeHtml(s.full_name)}</strong><br>
                                        <span style="font-family:monospace; color:#2563eb; font-size:0.85rem;">${escapeHtml(s.enrollment_id)}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <i class="fas fa-phone" style="color:#10b981; font-size:0.8rem;"></i> ${escapeHtml(s.mobile)}<br>
                                <small style="color:#64748b;">${escapeHtml(s.email)}</small>
                            </td>
                            <td><strong style="color:#1e3a8a;">Class ${escapeHtml(s.student_class)}</strong></td>
                            <td>
                                <strong>${escapeHtml(s.city)}</strong><br>
                                <small style="color:#64748b;">${escapeHtml(s.school || 'State / Private')}</small>
                            </td>
                            <td><span class="status-badge ${escapeHtml(s.status)}">${escapeHtml(String(s.status).replace(/_/g, ' '))}</span></td>
                            <td>
                                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                    <button class="btn-admin btn-admin-secondary" style="padding:6px 10px; font-size:0.82rem;" data-action="toggle-status" data-id="${s.enrollment_id}" data-status="${s.status}">
                                        ${s.status === 'verified' || s.status === 'active' ? '<i class="fas fa-ban"></i> Suspend' : '<i class="fas fa-check-circle"></i> Activate'}
                                    </button>
                                    <button class="btn-admin btn-admin-danger" style="padding:6px 10px; font-size:0.82rem;" data-action="delete-student" data-id="${s.enrollment_id}" data-name="${escapeHtml(s.full_name)}" title="Permanently remove student">
                                        <i class="fas fa-trash-alt"></i> Remove
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }
}

// --- Render Lessons Table in Video & Live Manager ---
function renderLessonsTable() {
    if (!lessonsTableContent) return;
    const query = searchInput.value.trim().toLowerCase();
    const selectedClass = classFilter.value;

    const filtered = lessonsList.filter(l => {
        const matchesQuery = !query || [l.title, l.subject, l.description, l.student_class, l.lesson_type].some(v => String(v || '').toLowerCase().includes(query));
        const matchesClass = !selectedClass || l.student_class === selectedClass;
        return matchesQuery && matchesClass;
    });

    if (!filtered.length) {
        lessonsTableContent.innerHTML = "<p style='color:#64748b; padding:20px 0;'>No video lessons or live classes match your filters.</p>";
        return;
    }

    lessonsTableContent.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Title & Summary</th>
                    <th>Video Link / Preview</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(l => {
                    const isLive = l.lesson_type === 'live';
                    const ytId = extractYouTubeId(l.video_url);
                    const directWatchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : (l.video_url || '#');
                    return `
                        <tr>
                            <td>
                                <span style="background:${isLive ? '#fee2e2' : '#dbeafe'}; color:${isLive ? '#dc2626' : '#1d4ed8'}; padding:4px 8px; border-radius:6px; font-size:0.8rem; font-weight:800; display:inline-flex; align-items:center; gap:4px;">
                                    ${isLive ? '<i class="fas fa-circle" style="font-size:0.5rem; color:#dc2626;"></i> LIVE CLASS' : '<i class="fas fa-play-circle"></i> VIDEO'}
                                </span>
                            </td>
                            <td><strong style="color:#1e3a8a;">Class ${escapeHtml(l.student_class)}</strong></td>
                            <td><span style="font-weight:700; color:#2563eb;">${escapeHtml(l.subject)}</span></td>
                            <td>
                                <strong>${escapeHtml(l.title)}</strong>
                                ${l.description ? `<p style="margin:4px 0 0; color:#64748b; font-size:0.84rem;">${escapeHtml(l.description)}</p>` : ''}
                            </td>
                            <td>
                                <button class="btn-admin btn-admin-primary" style="padding:6px 12px; font-size:0.84rem; display:inline-flex; align-items:center; gap:6px;" data-action="preview-video" data-url="${escapeHtml(l.video_url || '')}" data-title="${escapeHtml(l.title)}" data-type="${isLive ? 'LIVE' : 'VIDEO'}">
                                    <i class="fas fa-play"></i> In-App Player Preview
                                </button>
                            </td>
                            <td>
                                <button class="btn-admin btn-admin-danger" style="padding:5px 10px; font-size:0.82rem;" data-action="delete-lesson" data-id="${l.id}" data-title="${escapeHtml(l.title)}">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;
}

// --- Render Notes Table in Notes Manager ---
function renderNotesTable() {
    if (!notesTableContent) return;
    const query = searchInput.value.trim().toLowerCase();
    const selectedClass = classFilter.value;

    const filtered = notesList.filter(n => {
        const matchesQuery = !query || [n.title, n.subject, n.content, n.student_class].some(v => String(v || '').toLowerCase().includes(query));
        const matchesClass = !selectedClass || n.student_class === selectedClass;
        return matchesQuery && matchesClass;
    });

    if (!filtered.length) {
        notesTableContent.innerHTML = "<p style='color:#64748b; padding:20px 0;'>No study notes or materials found matching the filters.</p>";
        return;
    }

    notesTableContent.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Document / Note Title</th>
                    <th>PDF / File Link</th>
                    <th>Key Summary</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(n => `
                    <tr>
                        <td><strong style="color:#1e3a8a;">Class ${escapeHtml(n.student_class)}</strong></td>
                        <td><span style="font-weight:700; color:#2563eb;">${escapeHtml(n.subject)}</span></td>
                        <td><strong>${escapeHtml(n.title)}</strong></td>
                        <td>
                            ${n.file_url ? `
                                <a href="${escapeHtml(n.file_url)}" target="_blank" rel="noopener" style="color:#2563eb; font-size:0.85rem; font-weight:700; text-decoration:underline;">
                                    <i class="fas fa-file-pdf" style="color:#ef4444;"></i> Open / Download File
                                </a>
                            ` : '<span style="color:#94a3b8; font-size:0.82rem;">Online Summary</span>'}
                        </td>
                        <td>
                            <span style="color:#64748b; font-size:0.85rem;">
                                ${escapeHtml((n.content || '').slice(0, 70))}${n.content && n.content.length > 70 ? '...' : ''}
                            </span>
                        </td>
                        <td>
                            <button class="btn-admin btn-admin-danger" style="padding:5px 10px; font-size:0.82rem;" data-action="delete-note" data-id="${n.id}" data-title="${escapeHtml(n.title)}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

// --- Tab Switching ---
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTab = btn.getAttribute("data-tab");
        renderView();
    });
});

// --- Action Listeners ---
document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    // 1. Verify Payment
    if (action === "verify-pay") {
        if (!confirm("Are you sure you want to verify this payment claim and activate student access?")) return;
        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.verifyPaymentById(id); } else { await adminFetch(`/api/admin/payments/${id}/verify`, { method: "POST" }); }
            alert("✅ Student payment verified successfully! Student can now log in.");
            await loadAdminData();
        } catch (err) {
            alert("Verification failed: " + err.message);
        }
    }

    // 2. Reject Payment
    else if (action === "reject-pay") {
        const reason = prompt("Enter the reason for rejection (e.g. Invalid UTR / Payment not received):", "Payment transaction could not be verified in UPI account.");
        if (!reason) return;
        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.rejectPaymentById(id, reason); } else { await adminFetch(`/api/admin/payments/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            alert("❌ Payment claim rejected. Student login will be blocked with reason.");
            await loadAdminData();
        } catch (err) {
            alert("Rejection failed: " + err.message);
        }
    }

    // 3. Toggle Status (Suspend / Activate)
    else if (action === "toggle-status") {
        const curr = btn.getAttribute("data-status");
        const newStatus = curr === 'verified' || curr === 'active' ? 'suspended' : 'active';
        try {
            await adminFetch(`/api/admin/students/${id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            await loadAdminData();
        } catch (err) {
            alert("Status update failed: " + err.message);
        }
    }

    // 4. Remove / Delete Student Permanently
    else if (action === "delete-student") {
        const studentName = btn.getAttribute("data-name") || id;
        if (!confirm(`⚠️ Are you sure you want to PERMANENTLY REMOVE student "${studentName}" (ID: ${id})?\n\nThis will completely delete their enrollment, fee records, and study progress from the database.`)) return;

        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.deleteStudent(id); } else { await adminFetch(`/api/admin/students/${encodeURIComponent(id)}`, { method: "DELETE" }); }
            alert(`✅ Student ${studentName} (${id}) has been permanently removed.`);
            await loadAdminData();
        } catch (err) {
            alert("Failed to remove student: " + err.message);
        }
    }

    // 5. Preview Video / Live Stream
    else if (action === "preview-video") {
        const videoUrl = (btn.getAttribute("data-url") || "").trim();
        const videoTitle = btn.getAttribute("data-title") || "Class Preview";
        const type = btn.getAttribute("data-type") || "VIDEO";

        if (!videoUrl) {
            alert("No link available for this class.");
            return;
        }

        if (adminModalTitle) adminModalTitle.textContent = videoTitle;
        if (adminModalBadge) {
            adminModalBadge.textContent = type;
            adminModalBadge.style.background = type === 'LIVE' ? '#dc2626' : '#2563eb';
        }

        let embedUrl = videoUrl;
        let watchUrl = videoUrl;

        // Clean raw iframe pasted code
        const srcMatch = videoUrl.match(/src=["']([^"']+)["']/i);
        let cleanUrl = srcMatch && srcMatch[1] ? srcMatch[1].trim() : videoUrl;

        const ytId = extractYouTubeId(cleanUrl);
        if (ytId) {
            embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`;
            watchUrl = `https://www.youtube.com/watch?v=${ytId}`;
        } else if (cleanUrl.includes("drive.google.com/file/d/")) {
            embedUrl = cleanUrl.replace(/\/view.*$/, "/preview");
            watchUrl = cleanUrl;
        } else if (cleanUrl.includes("vimeo.com/")) {
            const vMatch = cleanUrl.match(/vimeo\.com\/(\d+)/i);
            if (vMatch && vMatch[1]) {
                embedUrl = `https://player.vimeo.com/video/${vMatch[1]}`;
            }
        }

        const isDirectVideo = /\.(mp4|webm|ogg|mov)($|\?)/i.test(cleanUrl);
        const isMeeting = /meet\.google\.com|zoom\.us|teams\.microsoft\.com/i.test(cleanUrl);
        const container = document.getElementById("videoContainerBox");

        if (container) {
            if (isMeeting) {
                container.innerHTML = `
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; color:#fff;">
                        <i class="fas fa-video" style="font-size:3.5rem; color:#dc2626; margin-bottom:16px;"></i>
                        <h3 style="margin:0 0 10px; color:#fff; font-size:1.3rem;">Live Meeting Room Ready</h3>
                        <p style="color:#94a3b8; max-width:480px; margin-bottom:20px; font-size:0.95rem;">Interactive meetings (Google Meet / Zoom) stream directly in your browser tab.</p>
                        <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener" style="background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; font-weight:700; text-decoration:none; font-size:1rem; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                            <i class="fas fa-external-link-alt"></i> Launch Live Meeting Now
                        </a>
                    </div>
                `;
            } else if (isDirectVideo) {
                container.innerHTML = `<video src="${escapeHtml(cleanUrl)}" controls autoplay playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000;"></video>`;
            } else if (ytId) {
                container.innerHTML = `
                    <iframe id="adminVideoFrame" src="${escapeHtml(embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; z-index:1;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <!-- Top Brand Header Bar -->
                    <div style="position:absolute; top:0; left:0; width:100%; height:44px; background:linear-gradient(to bottom, rgba(15,23,42,0.92), transparent); z-index:10; pointer-events:none; display:flex; align-items:center; justify-content:space-between; padding:0 16px;">
                        <span style="color:#ffffff; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px;"><i class="fas fa-graduation-cap" style="color:#3b82f6;"></i> OAV Mantra Classes</span>
                        <span style="background:rgba(37,99,235,0.85); color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px;">ADMIN PREVIEW</span>
                    </div>
                    <!-- Bottom-Right Watermark Shield: Completely masks YouTube watermark -->
                    <div style="position:absolute; bottom:0; right:0; width:120px; height:48px; background:#000000; z-index:10; pointer-events:none; display:flex; align-items:center; justify-content:center; border-top-left-radius:8px;">
                        <span style="color:#60a5fa; font-size:11px; font-weight:800; letter-spacing:0.5px;"><i class="fas fa-play" style="font-size:9px; margin-right:4px;"></i> OAV CLASS</span>
                    </div>
                `;
            } else {
                container.innerHTML = `<iframe id="adminVideoFrame" src="${escapeHtml(embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
            }
        }

        const fullscreenBtn = document.getElementById("adminFullscreenBtn");
        if (fullscreenBtn) {
            fullscreenBtn.onclick = () => {
                const target = document.getElementById("videoContainerBox") || document.getElementById("adminVideoFrame");
                if (!target) return;
                if (!document.fullscreenElement) {
                    if (target.requestFullscreen) target.requestFullscreen();
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
            };
        }

        if (adminVideoModal) {
            adminVideoModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        }
    }

    // 6. Delete Video / Live Lesson
    else if (action === "delete-lesson") {
        const lessonTitle = btn.getAttribute("data-title") || id;
        if (!confirm(`Are you sure you want to delete the lesson "${lessonTitle}"?`)) return;

        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.deleteLesson(id); } else { await adminFetch(`/api/admin/lessons/${id}`, { method: "DELETE" }); }
            alert(`✅ Class / Lesson deleted successfully.`);
            await loadAdminData();
        } catch (err) {
            alert("Failed to delete lesson: " + err.message);
        }
    }

    // 7. Delete Study Note
    else if (action === "delete-note") {
        const noteTitle = btn.getAttribute("data-title") || id;
        if (!confirm(`Are you sure you want to delete the note "${noteTitle}"?`)) return;

        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.deleteStudyNote(id); } else { await adminFetch(`/api/admin/notes/${id}`, { method: "DELETE" }); }
            alert(`✅ Study Note deleted successfully.`);
            await loadAdminData();
        } catch (err) {
            alert("Failed to delete note: " + err.message);
        }
    }
});

// --- Close Video Modal ---
if (closeAdminVideoModalBtn) {
    closeAdminVideoModalBtn.addEventListener("click", () => {
        if (adminVideoModal) adminVideoModal.style.display = "none";
        if (adminVideoFrame) adminVideoFrame.src = "";
        document.body.style.overflow = "auto";
    });
}

if (adminVideoModal) {
    adminVideoModal.addEventListener("click", (e) => {
        if (e.target === adminVideoModal) {
            adminVideoModal.style.display = "none";
            if (adminVideoFrame) adminVideoFrame.src = "";
            document.body.style.overflow = "auto";
        }
    });
}

// Close on ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && adminVideoModal && adminVideoModal.style.display === "flex") {
        adminVideoModal.style.display = "none";
        if (adminVideoFrame) adminVideoFrame.src = "";
        document.body.style.overflow = "auto";
    }
});

// --- Add Video / Live Lesson Form Submit ---
const addLessonForm = document.getElementById("addLessonForm");
if (addLessonForm) {
    addLessonForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const studentClass = document.getElementById("lessonClass").value;
        const subject = document.getElementById("lessonSubject").value;
        const lessonType = document.getElementById("lessonType").value;
        const title = document.getElementById("lessonTitle").value.trim();
        const videoUrl = document.getElementById("lessonVideoUrl").value.trim();
        const description = document.getElementById("lessonDescription").value.trim();

        const saveBtn = document.getElementById("saveLessonBtn");
        const origText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        saveBtn.disabled = true;

        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.addLesson(payload); } else { await adminFetch("/api/admin/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentClass,
                    subject,
                    lessonType,
                    title,
                    videoUrl,
                    description
                })
            });

            alert(`✅ ${lessonType === 'live' ? 'Live Stream' : 'Video Lesson'} "${title}" published live for Class ${studentClass} (${subject})!`);
            addLessonForm.reset();
            await loadAdminData();
        } catch (err) {
            alert("Failed to add class: " + err.message);
        } finally {
            saveBtn.innerHTML = origText;
            saveBtn.disabled = false;
        }
    });
}

// --- Add Study Note Form Submit ---
const addNoteForm = document.getElementById("addNoteForm");
if (addNoteForm) {
    addNoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const studentClass = document.getElementById("noteClass").value;
        const subject = document.getElementById("noteSubject").value;
        const title = document.getElementById("noteTitle").value.trim();
        const fileUrl = document.getElementById("noteFileUrl").value.trim();
        const content = document.getElementById("noteContent").value.trim();

        const saveBtn = document.getElementById("saveNoteBtn");
        const origText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        saveBtn.disabled = true;

        try {
            if (window.OAV_SUPABASE) { await window.OAV_SUPABASE.addStudyNote(payload); } else { await adminFetch("/api/admin/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentClass,
                    subject,
                    title,
                    fileUrl,
                    content
                })
            });

            alert(`✅ Study Note "${title}" published for Class ${studentClass} (${subject})!`);
            addNoteForm.reset();
            await loadAdminData();
        } catch (err) {
            alert("Failed to publish study note: " + err.message);
        } finally {
            saveBtn.innerHTML = origText;
            saveBtn.disabled = false;
        }
    });
}

// --- Broadcast Notice Form ---
const broadcastForm = document.getElementById("broadcastForm");
if (broadcastForm) {
    broadcastForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("noticeTitle").value.trim();
        const message = document.getElementById("noticeMessage").value.trim();

        try {
            await adminFetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message, targetClass: "ALL" })
            });

            alert("✅ Announcement published live across all student dashboards and homepage!");
            broadcastForm.reset();
        } catch (err) {
            alert("Failed to post notice: " + err.message);
        }
    });
}

// --- CSV Export ---
document.getElementById("exportBtn").addEventListener("click", () => {
    const token = adminTokenInput.value.trim();
    if (!token) {
        alert("Please enter the administrator token first.");
        return;
    }
    const type = currentTab === "students" ? "students" : "payments";
    window.open(`${API_BASE}/api/admin/export?type=${type}&token=${encodeURIComponent(token)}`, "_blank");
});

// --- Search and Filter Listeners ---
document.getElementById("unlockBtn").addEventListener("click", loadAdminData);
document.getElementById("refreshBtn").addEventListener("click", loadAdminData);
searchInput.addEventListener("input", renderView);
classFilter.addEventListener("change", renderView);
statusFilter.addEventListener("change", renderView);

if (adminTokenInput) {
    adminTokenInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            loadAdminData();
        }
    });
}

// Auto-load and boot admin console
function bootAdmin() {
    const savedToken = localStorage.getItem("oav_admin_token") || sessionStorage.getItem("oav_admin_token") || "admin123";
    if (adminTokenInput) {
        if (!adminTokenInput.value.trim()) {
            adminTokenInput.value = savedToken;
        }
        loadAdminData();
    }

    // Real-time Video Link Detector & Validator
    const videoInput = document.getElementById("lessonVideoUrl");
    const previewBox = document.getElementById("videoUrlPreviewBox");
    if (videoInput && previewBox) {
        videoInput.addEventListener("input", function() {
            const val = this.value.trim();
            if (!val) {
                previewBox.style.display = "none";
                previewBox.innerHTML = "";
                return;
            }
            const ytId = extractYouTubeId(val);
            if (ytId) {
                previewBox.style.display = "flex";
                previewBox.style.alignItems = "center";
                previewBox.style.gap = "12px";
                previewBox.innerHTML = `
                    <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="YouTube Thumbnail" style="width:90px; height:54px; object-fit:cover; border-radius:6px; border:1px solid #93c5fd;">
                    <div>
                        <strong style="color:#1d4ed8; font-size:0.88rem;"><i class="fab fa-youtube" style="color:#dc2626;"></i> Valid YouTube Video Detected</strong><br>
                        <span style="font-size:0.8rem; color:#475569;">Video ID: <code>${ytId}</code></span>
                    </div>
                `;
            } else if (/meet\.google\.com|zoom\.us/i.test(val)) {
                previewBox.style.display = "block";
                previewBox.innerHTML = `<strong style="color:#dc2626; font-size:0.88rem;"><i class="fas fa-video"></i> Live Meeting Link Detected</strong>`;
            } else if (/\.(mp4|webm|ogg)/i.test(val)) {
                previewBox.style.display = "block";
                previewBox.innerHTML = `<strong style="color:#059669; font-size:0.88rem;"><i class="fas fa-file-video"></i> Direct Video File Detected</strong>`;
            } else {
                previewBox.style.display = "block";
                previewBox.innerHTML = `<span style="color:#64748b; font-size:0.82rem;"><i class="fas fa-link"></i> Web Link ready for publishing</span>`;
            }
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAdmin);
} else {
    bootAdmin();
}
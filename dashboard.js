"use strict";

const API_BASE = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
    if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
    return '';
})();

const escapeHtml = text => String(text || '').replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
})[char]);

const classPageMap = {
    VI: "study-VI.html",
    VII: "study-VII.html",
    VIII: "study-VIII.html",
    IX: "study-IX.html",
    X: "study-X.html"
};

let currentStudent = null;
let currentPayments = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadDashboardData();
        await loadProgressData();
        await loadAnnouncements();
    } catch (err) {
        console.error("Dashboard initialization error:", err);
    }

    setupEventListeners();
});

async function loadDashboardData() {
    let data = null;
    try {
        const res = await fetch(`${API_BASE}/api/dashboard`, { credentials: "include" });
        if (res.ok) {
            data = await res.json();
            if (data.student && data.student.status !== 'active' && data.student.status !== 'verified') {
                window.location.replace("login.html?status=review");
                return;
            }
        } else if (res.status === 401 || res.status === 403) {
            const localStudent = JSON.parse(localStorage.getItem('oav_current_student') || 'null');
            if (!localStudent || (localStudent.status !== 'active' && localStudent.status !== 'verified')) {
                window.location.replace("login.html");
                return;
            }
        }
    } catch (netErr) {
        console.info("Checking local student session...", netErr.message);
    }

    if (!data || !data.student) {
        const localStudent = JSON.parse(localStorage.getItem('oav_current_student') || 'null');
        if (!localStudent || (localStudent.status !== 'active' && localStudent.status !== 'verified')) {
            window.location.replace("login.html");
            return;
        }
        data = {
            student: localStudent,
            payments: JSON.parse(localStorage.getItem('oav_payments') || '[]'),
            courses: [
                { id: 1, title: 'Mathematics (NCERT / Odisha State Board)', description: 'Conceptual video classes, exercises, and chapter tests.' },
                { id: 2, title: 'General Science & Life Processes', description: 'Core principles, interactive experiments, and diagrams.' },
                { id: 3, title: 'English & Literature Skills', description: 'Grammar mastery, comprehension, and vocabulary.' },
                { id: 4, title: 'Social Science & History', description: 'Timelines, maps, and geographical concepts.' }
            ]
        };
    }


    currentStudent = data.student;
    currentPayments = data.payments || [];

    // Render Student Photo (Avatar & ID Card)
    renderStudentPhoto(currentStudent.photo);

    // Title & Header
    document.title = `${currentStudent.full_name} | OAV Mantra Dashboard`;
    document.getElementById("studentNameDisplay").textContent = currentStudent.full_name;
    document.getElementById("studentIdDisplay").textContent = currentStudent.enrollment_id;
    document.getElementById("studentClassDisplay").textContent = `Class ${currentStudent.student_class} (${currentStudent.school_type || 'OAV'})`;
    document.getElementById("studentDistrictDisplay").textContent = `${currentStudent.city}`;


    // Study Room CTA
    const studyUrl = classPageMap[currentStudent.student_class] || "study-VI.html";
    const studyBtn = document.getElementById("openStudyRoomBtn");
    if (studyBtn) {
        studyBtn.href = studyUrl;
        studyBtn.innerHTML = `<i class="fas fa-play-circle"></i> Open Class ${currentStudent.student_class} Study Room`;
    }

    // Courses List
    const courseListEl = document.getElementById("courseModulesList");
    if (data.courses && data.courses.length > 0) {
        courseListEl.innerHTML = data.courses.map(c => `
            <div class="course-item">
                <div class="course-info">
                    <h3><i class="fas fa-book-open" style="color:#2563eb; margin-right:8px;"></i>${escapeHtml(c.title)}</h3>
                    <p>${escapeHtml(c.description)}</p>
                </div>
                <a href="${studyUrl}" class="btn-sm" style="text-decoration:none; padding:8px 16px;">
                    Enter <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `).join("");
    } else {
        courseListEl.innerHTML = `
            <div style="background:#fffbeb; padding:16px; border-radius:10px; border-left:4px solid #f59e0b; color:#92400e;">
                <strong>Payment Verification in Progress:</strong> Your Class ${currentStudent.student_class} subjects will appear here as soon as your payment is verified.
            </div>
        `;
    }

    // Payment Box
    const payBox = document.getElementById("paymentStatusBox");
    const isVerified = currentStudent.status === 'verified';
    const statusClass = isVerified ? 'status-verified' : (currentStudent.status === 'rejected' ? 'status-rejected' : 'status-pending');
    const statusLabel = isVerified ? 'Verified & Active' : (currentStudent.status === 'rejected' ? 'Payment Rejected' : 'Pending Verification');

    const paymentInfo = currentPayments[0] || {};

    payBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:700; font-size:0.95rem;">Fee Status</span>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
        <div style="font-size:0.9rem; color:#64748b; line-height:1.6;">
            <strong>Amount:</strong> ₹${paymentInfo.amount || 500} (${paymentInfo.payment_method || 'UPI'})<br>
            <strong>Txn ID:</strong> <span style="font-family:monospace;">${escapeHtml(paymentInfo.transaction_id || 'Submitted')}</span><br>
            <strong>Date:</strong> ${escapeHtml(paymentInfo.payment_date || 'Today')}
        </div>
    `;
}

async function loadProgressData() {
    try {
        const res = await fetch(`${API_BASE}/api/progress`, { credentials: "include" });
        if (res.ok) {
            const data = await res.json();
            const totalLessons = 18; // Standard curriculum module count per grade
            const completed = data.completed_lesson_ids ? data.completed_lesson_ids.length : 0;
            const quizzes = data.quiz_results ? data.quiz_results.length : 0;

            const percent = Math.min(100, Math.round((completed / totalLessons) * 100));

            document.getElementById("progressPercentDisplay").textContent = `${percent}%`;
            document.getElementById("progressBarFill").style.width = `${percent}%`;
            document.getElementById("lessonsCompletedCount").textContent = completed;
            document.getElementById("quizzesTakenCount").textContent = quizzes;
        }
    } catch (e) {
        console.warn("Could not load progress stats:", e);
    }
}

async function loadAnnouncements() {
    const listEl = document.getElementById("dashAnnouncementsList");
    try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        if (res.ok) {
            const data = await res.json();
            if (data.announcements && data.announcements.length > 0) {
                listEl.innerHTML = data.announcements.map(a => `
                    <div class="notice-item">
                        <strong style="color:#1e3a8a; display:block; margin-bottom:4px;">${escapeHtml(a.title)}</strong>
                        <p style="margin:0; color:#334155;">${escapeHtml(a.message)}</p>
                        <small style="color:#94a3b8; display:block; margin-top:4px;">${escapeHtml(a.created_at || 'Recent')}</small>
                    </div>
                `).join("");
                return;
            }
        }
        listEl.innerHTML = "<p style='color:#64748b; font-size:0.9rem;'>No new notices today.</p>";
    } catch (e) {
        listEl.innerHTML = "<p style='color:#64748b; font-size:0.9rem;'>Unable to load notices.</p>";
    }
}

function renderStudentPhoto(photoData) {
    const avatarEl = document.getElementById("profileAvatar");
    const photoImg = document.getElementById("idCardPhotoImg");
    const photoIcon = document.getElementById("idCardPhotoIcon");

    if (photoData && photoData.startsWith("data:image/")) {
        if (avatarEl) {
            avatarEl.innerHTML = `<img src="${photoData}" alt="Profile" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
        if (photoImg) {
            photoImg.src = photoData;
            photoImg.style.display = "block";
        }
        if (photoIcon) {
            photoIcon.style.display = "none";
        }
    } else {
        if (avatarEl) {
            avatarEl.innerHTML = `<i class="fas fa-user-graduate"></i>`;
        }
        if (photoImg) {
            photoImg.src = "";
            photoImg.style.display = "none";
        }
        if (photoIcon) {
            photoIcon.style.display = "inline-block";
        }
    }
}

// Client-side image compressor (Center-crops to 160x160 square, 60% JPEG quality, ~10KB)
function compressImage(file, maxSize = 160, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext("2d");

                const minSide = Math.min(img.width, img.height);
                const startX = (img.width - minSide) / 2;
                const startY = (img.height - minSide) / 2;

                ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxSize, maxSize);
                const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error("Failed to load image file."));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

function setupEventListeners() {
    // Student Photo Upload
    const photoInput = document.getElementById("studentPhotoInput");
    if (photoInput) {
        photoInput.addEventListener("change", async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file (JPG, PNG, or WebP).");
                return;
            }

            try {
                // Ultra-lightweight compression (~10KB-15KB)
                const compressedPhoto = await compressImage(file, 160, 0.6);

                // Update UI preview immediately
                renderStudentPhoto(compressedPhoto);

                // Save to server
                const res = await fetch(`${API_BASE}/api/student/photo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ photo: compressedPhoto })
                });

                if (res.ok) {
                    if (currentStudent) {
                        currentStudent.photo = compressedPhoto;
                        localStorage.setItem("oav_current_student", JSON.stringify(currentStudent));
                    }
                    alert("✅ Photo uploaded and saved to ID Card successfully!");
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(`Upload note: ${data.error || "Saved locally for this session."}`);
                }
            } catch (err) {
                console.error("Photo upload error:", err);
                alert("Failed to process photo. Please try another image.");
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch(`${API_BASE}/api/student/logout`, { method: "POST", credentials: "include" });
            } catch (e) {}
            localStorage.removeItem('oav_current_student');
            window.location.replace("login.html");
        });
    }

    // Digital ID Modal
    const idModal = document.getElementById("idCardModal");
    const viewIdBtn = document.getElementById("viewIdCardBtn");
    const closeIdBtn = document.getElementById("closeIdModalBtn");

    if (viewIdBtn && idModal) {
        viewIdBtn.addEventListener("click", () => {
            if (!currentStudent) return;
            document.getElementById("idCardName").textContent = currentStudent.full_name;
            document.getElementById("idCardClass").textContent = `Class ${currentStudent.student_class}`;
            document.getElementById("idCardId").textContent = currentStudent.enrollment_id;
            document.getElementById("idCardMobile").textContent = currentStudent.mobile;
            document.getElementById("idCardDistrict").textContent = currentStudent.city;
            document.getElementById("idCardSchool").textContent = currentStudent.school || "State / Private School";
            renderStudentPhoto(currentStudent.photo);
            idModal.classList.add("active");
        });
    }

    if (closeIdBtn && idModal) {
        closeIdBtn.addEventListener("click", () => idModal.classList.remove("active"));
        idModal.addEventListener("click", (e) => {
            if (e.target === idModal) idModal.classList.remove("active");
        });
    }

    // Download / Print Receipt
    const receiptBtn = document.getElementById("downloadReceiptBtn");
    if (receiptBtn) {
        receiptBtn.addEventListener("click", printFeeReceipt);
    }
}

function printFeeReceipt() {
    if (!currentStudent) return;
    const payment = currentPayments[0] || {};
    const win = window.open("", "_blank");
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Official Fee Receipt - ${escapeHtml(currentStudent.enrollment_id)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 650px; margin: 0 auto; }
                .receipt-box { border: 2px solid #cbd5e1; border-radius: 12px; padding: 30px; }
                .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
                .header h1 { margin: 0 0 6px; color: #1e3a8a; font-size: 24px; }
                .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
                .stamp { text-align: center; margin-top: 30px; font-weight: bold; color: #166534; background: #dcfce7; padding: 10px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">
                    <h1>OAV MANTRA CLASSES</h1>
                    <p style="margin:0; color:#64748b;">Quality Education for Academic Excellence · Odisha</p>
                    <h3 style="margin:12px 0 0; color:#2563eb;">OFFICIAL REGISTRATION FEE RECEIPT</h3>
                </div>
                <div class="row"><strong>Enrollment ID:</strong> <span>${escapeHtml(currentStudent.enrollment_id)}</span></div>
                <div class="row"><strong>Student Name:</strong> <span>${escapeHtml(currentStudent.full_name)}</span></div>
                <div class="row"><strong>Academic Grade:</strong> <span>Class ${escapeHtml(currentStudent.student_class)}</span></div>
                <div class="row"><strong>District & School:</strong> <span>${escapeHtml(currentStudent.city)} · ${escapeHtml(currentStudent.school || 'N/A')}</span></div>
                <div class="row"><strong>Mobile Number:</strong> <span>${escapeHtml(currentStudent.mobile)}</span></div>
                <div class="row"><strong>Transaction / UTR:</strong> <span>${escapeHtml(payment.transaction_id || 'VERIFIED')}</span></div>
                <div class="row"><strong>Payment Date:</strong> <span>${escapeHtml(payment.payment_date || new Date().toISOString().slice(0, 10))}</span></div>
                <div class="row" style="font-size: 18px; font-weight: bold; color: #1e3a8a;"><strong>Amount Paid:</strong> <span>₹${escapeHtml(payment.amount || 500)}</span></div>
                <div class="stamp">✓ OFFICIAL PAYMENT CONFIRMED · ADMISSION VALID FOR 2026-2027 SESSION</div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    win.document.close();
}

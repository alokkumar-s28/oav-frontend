/**
 * OAV Mantra - Universal Supabase Cloud Engine & Transparent API Bridge
 * Supabase Project: bnlymzocydhmpuzmiwlz (https://bnlymzocydhmpuzmiwlz.supabase.co)
 * Production Vercel: https://oavmantra.vercel.app
 */

(function () {
    "use strict";

    const SUPABASE_URL = "https://bnlymzocydhmpuzmiwlz.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_K9N6nBr03U4ZgtX1cFdERQ_1uppv6uO";

    // Direct REST helper with standard Supabase Headers
    async function sbFetch(endpoint, options = {}) {
        const cleanEndpoint = endpoint.startsWith("http") ? endpoint : `${SUPABASE_URL}/rest/v1/${endpoint.replace(/^\//, "")}`;
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": options.prefer || "return=representation",
            ...(options.headers || {})
        };
        return window.fetch(cleanEndpoint, { ...options, headers, __supabase_direct: true });
    }

    function generateEnrollmentId() {
        const num = Math.floor(100000 + Math.random() * 900000);
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let suffix = "";
        for (let i = 0; i < 4; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `OAV-${num}-${suffix}`;
    }

    function jsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" }
        });
    }

    const SupabaseAPI = {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,

        // 1. Enroll New Student
        async enrollStudent(data) {
            const enrollment_id = data.enrollmentId || data.enrollment_id || generateEnrollmentId();
            const payload = {
                enrollment_id,
                full_name: String(data.name || data.fullName || data.full_name || "").trim(),
                mobile: String(data.mobile || "").trim(),
                email: String(data.email || "").trim(),
                student_class: String(data.class || data.studentClass || data.student_class || "VI").trim(),
                school_type: String(data.schoolType || data.school_type || "OAV").trim(),
                city: String(data.city || "").trim(),
                school: String(data.school || "").trim(),
                status: "pending_payment"
            };

            const res = await sbFetch("students", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Enrollment failed" }));
                throw new Error(err.message || "Failed to create student in Supabase.");
            }

            const result = await res.json();
            const student = Array.isArray(result) ? result[0] : payload;
            localStorage.setItem("oav_current_enrollment", enrollment_id);
            localStorage.setItem("oav_current_student", JSON.stringify(student));
            return { success: true, enrollmentId: enrollment_id, student };
        },

        // 2. Submit Payment Claim (Supports UTR, Screenshot proof, or both)
        async submitPayment(data) {
            const rawTx = String(data.transactionId || data.transaction_id || "").trim();
            const rawScreenshot = typeof data.paymentScreenshot === "string" ? data.paymentScreenshot : (typeof data.payment_screenshot === "string" ? data.payment_screenshot : "");
            const hasTx = rawTx.length >= 5;
            const hasScreenshot = rawScreenshot.startsWith("data:image/") || rawScreenshot.length > 50;

            if (!hasTx && !hasScreenshot) {
                throw new Error("Payment proof required: Please enter a valid Transaction / UTR ID OR upload a payment screenshot.");
            }

            const enrollment_id = String(data.enrollmentId || data.enrollment_id || "").trim();
            const payment_date = String(data.paymentDate || data.payment_date || new Date().toISOString().slice(0, 10));
            const payment_method = String(data.paymentMethod || data.payment_method || "quickupi").trim();

            // Safe fallback unique reference for database integrity if student provided screenshot without UTR
            const txnToSave = hasTx ? rawTx : `PROOF-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const payload = {
                enrollment_id,
                amount: Number(data.amount) || 500,
                transaction_id: txnToSave,
                payment_date,
                payment_method,
                status: "pending_verification"
            };

            if (hasScreenshot) {
                payload.payment_screenshot = rawScreenshot;
            }

            // If Google Drive webhook URL is configured, auto-upload payment screenshot with Secret Key
            let driveFileUrl = null;
            const webhookUrl = localStorage.getItem("oav_drive_webhook_url") || window.OAV_DRIVE_WEBHOOK_URL || "";
            if (webhookUrl && webhookUrl.startsWith("https://script.google.com/") && hasScreenshot) {
                try {
                    const secretKey = localStorage.getItem("oav_drive_secret_key") || window.OAV_DRIVE_SECRET_KEY || "oav_mantra_vault_secure_2026_9971";
                    const dRes = await fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            secretKey,
                            action: "upload_payment",
                            folderType: "payments",
                            base64Data: rawScreenshot,
                            studentName: data.studentName || data.name || enrollment_id,
                            enrollmentId: enrollment_id,
                            transactionId: txnToSave,
                            amount: 500,
                            paymentDate: payment_date
                        })
                    });
                    const dData = await dRes.json().catch(() => ({}));
                    if (dData && (dData.fileUrl || dData.webViewLink)) {
                        driveFileUrl = dData.fileUrl || dData.webViewLink;
                        payload.drive_file_url = driveFileUrl;
                        // Supabase Free Tier Protection: Save only ~60-byte Drive URL instead of 2 MB raw base64!
                        payload.payment_screenshot = driveFileUrl;
                    }
                } catch (dErr) {
                    console.warn("[Supabase Bridge] Payment proof Drive upload warning:", dErr);
                }
            }

            let res = await sbFetch("payments", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // If Supabase table does not yet have drive_file_url or payment_screenshot column, retry without that field
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (errData && errData.message && (errData.message.includes("drive_file_url") || errData.message.includes("payment_screenshot"))) {
                    if (errData.message.includes("drive_file_url")) delete payload.drive_file_url;
                    if (errData.message.includes("payment_screenshot")) delete payload.payment_screenshot;
                    res = await sbFetch("payments", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                }
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Payment recording failed" }));
                throw new Error(err.message || "Failed to record payment in Supabase.");
            }

            // Also cache screenshot locally under payment ID / enrollment key so Admin Panel can view it
            if (hasScreenshot) {
                try {
                    localStorage.setItem(`oav_payment_proof_${enrollment_id}`, rawScreenshot);
                    const localPayments = JSON.parse(localStorage.getItem("oav_payments") || "[]");
                    localPayments.push({
                        enrollment_id,
                        transaction_id: txnToSave,
                        payment_screenshot: rawScreenshot,
                        amount: 500,
                        payment_date,
                        payment_method,
                        status: "pending_verification"
                    });
                    localStorage.setItem("oav_payments", JSON.stringify(localPayments));
                } catch (e) { }
            }

            await sbFetch(`students?enrollment_id=eq.${encodeURIComponent(payload.enrollment_id)}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "payment_review" })
            }).catch(console.warn);

            return { success: true, message: "Payment submitted for administrator verification." };
        },

        // 3. Student Login with Ultra-High-Level Security Gate
        async loginStudent(enrollmentId, mobile) {
            const cleanId = String(enrollmentId || "").trim().toUpperCase();
            const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);

            if (!cleanId) {
                throw new Error("Please enter your Enrollment ID.");
            }
            if (!cleanMobile || cleanMobile.length !== 10) {
                throw new Error("Please enter your registered 10-digit mobile number.");
            }

            const res = await sbFetch(`students?or=(enrollment_id.eq.${cleanId},enrollment_id.eq.OAV-${cleanId})&mobile=eq.${cleanMobile}&select=*`);
            if (!res.ok) throw new Error("Failed to connect to authentication server.");

            const students = await res.json();
            if (!students || students.length === 0) {
                throw new Error("No student account found with this Enrollment ID or Mobile Number. Please check your credentials or enroll on the homepage.");
            }

            const student = students[0];

            // SECURITY GATE: Prevent unauthorized access if payment is pending, under review, rejected, or suspended
            if (student.status === "payment_review" || student.status === "pending_verification") {
                const err = new Error("⏳ Verification Pending: Your payment has been received and is currently under review by our admin team. Once approved in the admin control panel, you will be able to log in. Please try again in some time (usually 15-30 minutes).");
                err.status = 403;
                err.code = "PAYMENT_UNDER_REVIEW";
                throw err;
            }

            if (student.status === "pending_payment") {
                const err = new Error("💳 Payment Required: Please complete your ₹500 enrollment fee payment and submit your transaction ID on the homepage.");
                err.status = 403;
                err.code = "PAYMENT_REQUIRED";
                throw err;
            }

            if (student.status === "rejected") {
                const err = new Error("❌ Payment Rejected: Your payment claim could not be verified by the admin team. Please contact helpline at +91 89175 31123.");
                err.status = 403;
                err.code = "PAYMENT_REJECTED";
                throw err;
            }

            if (student.status === "suspended") {
                const err = new Error("⛔ Account Suspended: Your access has been paused by the administrator. Please contact helpline at +91 89175 31123.");
                err.status = 403;
                err.code = "ACCOUNT_SUSPENDED";
                throw err;
            }

            localStorage.setItem("oav_student_session", JSON.stringify(student));
            localStorage.setItem("oav_current_student", JSON.stringify(student));
            localStorage.setItem("oav_current_enrollment", student.enrollment_id);
            return { success: true, student, redirect: "dashboard.html" };
        },

        // 4. Get Current Active Student Session
        async getCurrentStudent() {
            const cached = localStorage.getItem("oav_student_session") || localStorage.getItem("oav_current_student");
            if (!cached) return null;
            try {
                const local = JSON.parse(cached);
                if (!local || !local.enrollment_id) return null;
                const res = await sbFetch(`students?enrollment_id=eq.${local.enrollment_id}&select=*`);
                if (res.ok) {
                    const list = await res.json();
                    if (list && list.length > 0) {
                        const fresh = list[0];
                        localStorage.setItem("oav_student_session", JSON.stringify(fresh));
                        localStorage.setItem("oav_current_student", JSON.stringify(fresh));
                        return fresh;
                    }
                }
                return local;
            } catch (e) {
                return null;
            }
        },

        // 5. Get Lessons for a Grade
        async getLessons(studentClass) {
            const cleanClass = String(studentClass || "VI").toUpperCase();
            const res = await sbFetch(`lessons?student_class=eq.${cleanClass}&order=position.asc,id.asc&select=*`);
            if (!res.ok) return [];
            const lessons = await res.json();
            return lessons || [];
        },

        // 6. Get Study Notes for a Grade
        async getStudyNotes(studentClass) {
            const cleanClass = String(studentClass || "VI").toUpperCase();
            const res = await sbFetch(`study_notes?student_class=eq.${cleanClass}&order=id.desc&select=*`);
            if (!res.ok) return [];
            const notes = await res.json();
            return notes || [];
        },

        // Alias for getNotes to ensure 100% compatibility across all study/watch scripts
        async getNotes(studentClass) {
            return this.getStudyNotes(studentClass);
        },

        // 7. Get Active Announcements
        async getAnnouncements() {
            const res = await sbFetch(`announcements?is_active=eq.true&order=created_at.desc&select=*`);
            if (!res.ok) return [];
            const announcements = await res.json();
            return announcements || [];
        },

        // 8. Record Lesson Progress
        async saveProgress(enrollmentId, lessonId) {
            if (!enrollmentId || !lessonId) return { success: true };
            const payload = {
                enrollment_id: enrollmentId,
                lesson_id: Number(lessonId),
                completed_at: new Date().toISOString()
            };
            await sbFetch("lesson_progress", {
                method: "POST",
                prefer: "resolution=merge-duplicates",
                body: JSON.stringify(payload)
            }).catch(console.warn);
            return { success: true };
        },

        // 8b. Retrieve Lesson Progress for Student Dashboard & Video Watch Page
        async getProgress(enrollmentId, studentClass) {
            const studentStr = localStorage.getItem("oav_current_student");
            const studentObj = studentStr ? JSON.parse(studentStr) : {};
            const cleanId = enrollmentId || studentObj.enrollment_id;
            const targetGrade = String(studentClass || studentObj.student_class || "VI").toUpperCase();

            let completed_lesson_ids = [];
            if (cleanId) {
                const res = await sbFetch(`lesson_progress?enrollment_id=eq.${encodeURIComponent(cleanId)}&select=lesson_id`);
                if (res.ok) {
                    const rows = await res.json().catch(() => []);
                    completed_lesson_ids = rows.map(r => r.lesson_id);
                }
            }

            // Fallback to local storage completed lessons
            const localDone = JSON.parse(localStorage.getItem(`oav_done_${targetGrade}`) || '[]');
            if (completed_lesson_ids.length === 0 && localDone.length > 0) {
                completed_lesson_ids = localDone;
            }

            // Get total lessons count
            let totalLessons = 18;
            const lRes = await sbFetch(`lessons?student_class=eq.${targetGrade}&select=id`);
            if (lRes.ok) {
                const lessons = await lRes.json().catch(() => []);
                if (lessons && lessons.length > 0) totalLessons = lessons.length;
            }

            const completedLessons = completed_lesson_ids.length;
            const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

            return {
                completed_lesson_ids,
                totalLessons,
                completedLessons,
                percentage,
                quiz_results: []
            };
        },

        // Update Student Photo in Supabase Cloud (Lean Storage: Store Drive URL to protect Supabase 500MB free quota)
        async updateStudentPhoto(enrollmentId, photo, drivePhotoUrl) {
            if (!enrollmentId) return { success: false, error: "No enrollment ID" };
            const cleanId = String(enrollmentId).trim().toUpperCase();

            const photoToStore = drivePhotoUrl || photo;
            const patchPayload = { photo: photoToStore };
            if (drivePhotoUrl) {
                patchPayload.drive_photo_url = drivePhotoUrl;
            }

            let pRes = await sbFetch(`students?enrollment_id=eq.${encodeURIComponent(cleanId)}`, {
                method: "PATCH",
                body: JSON.stringify(patchPayload)
            });

            // If table doesn't have drive_photo_url column yet, retry with photo only
            if (!pRes.ok && drivePhotoUrl) {
                await sbFetch(`students?enrollment_id=eq.${encodeURIComponent(cleanId)}`, {
                    method: "PATCH",
                    body: JSON.stringify({ photo: photoToStore })
                }).catch(console.warn);
            }

            try {
                const localStudents = JSON.parse(localStorage.getItem("oav_students") || "[]");
                const idx = localStudents.findIndex(s => String(s.enrollment_id || s.enrollmentId || "").trim().toUpperCase() === cleanId);
                if (idx !== -1) {
                    localStudents[idx].photo = photo;
                    if (drivePhotoUrl) localStudents[idx].drive_photo_url = drivePhotoUrl;
                    localStorage.setItem("oav_students", JSON.stringify(localStudents));
                }
                localStorage.setItem(`oav_student_photo_${cleanId}`, photo);
                if (drivePhotoUrl) localStorage.setItem(`oav_student_drive_photo_${cleanId}`, drivePhotoUrl);
            } catch (e) { }

            return { success: true, photo, drivePhotoUrl };
        },

        // 9. Complete Admin Operations
        async getAdminOverview() {
            const [sRes, pRes, lRes, nRes] = await Promise.all([
                sbFetch("students?select=status"),
                sbFetch("payments?select=amount,status"),
                sbFetch("lessons?select=id"),
                sbFetch("study_notes?select=id")
            ]);
            const students = (await sRes.json().catch(() => [])) || [];
            const payments = (await pRes.json().catch(() => [])) || [];
            const lessons = (await lRes.json().catch(() => [])) || [];
            const notes = (await nRes.json().catch(() => [])) || [];

            const totalStudents = students.length;
            const activeStudents = students.filter(s => s.status === "active").length;
            const pendingPayments = payments.filter(p => p.status === "pending_verification").length;
            const paymentReview = students.filter(s => s.status === "payment_review" || s.status === "pending_payment").length;
            const verifiedRevenue = payments.filter(p => p.status === "verified").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

            return {
                totalStudents,
                activeStudents,
                pendingPayments,
                paymentReview,
                verifiedRevenue,
                totalLessons: lessons.length,
                totalNotes: notes.length
            };
        },

        async getAdminPayments() {
            const [pRes, sRes] = await Promise.all([
                sbFetch("payments?order=id.desc&select=*"),
                sbFetch("students?select=enrollment_id,full_name,mobile,student_class,school,city,photo")
            ]);
            const payments = (await pRes.json().catch(() => [])) || [];
            const students = (await sRes.json().catch(() => [])) || [];
            const studentMap = {};
            students.forEach(s => { studentMap[s.enrollment_id] = s; });

            const formatted = payments.map(p => {
                const s = studentMap[p.enrollment_id] || {};
                const localPhoto = localStorage.getItem(`oav_student_photo_${String(p.enrollment_id || '').trim().toUpperCase()}`);
                return {
                    ...p,
                    photo: s.photo || localPhoto || null,
                    full_name: s.full_name || "Enrolled Student",
                    mobile: s.mobile || "-",
                    student_class: s.student_class || "-",
                    school: s.school || "-",
                    city: s.city || "-"
                };
            });
            return { payments: formatted };
        },

        async getAdminStudents() {
            const [sRes, pRes] = await Promise.all([
                sbFetch("students?order=id.desc&select=*"),
                sbFetch("payments?order=id.desc&select=*")
            ]);
            const students = (await sRes.json().catch(() => [])) || [];
            const payments = (await pRes.json().catch(() => [])) || [];
            const formatted = students.map(s => {
                const p = payments.find(pay => pay.enrollment_id === s.enrollment_id);
                const localPhoto = localStorage.getItem(`oav_student_photo_${String(s.enrollment_id || '').trim().toUpperCase()}`);
                return {
                    ...s,
                    photo: s.photo || localPhoto || null,
                    payment_status: p ? p.status : (s.status === "active" ? "verified" : "unpaid"),
                    transaction_id: p ? p.transaction_id : null,
                    amount: p ? p.amount : null,
                    payment_id: p ? p.id : null
                };
            });
            return { students: formatted };
        },

        async getAdminLessons() {
            const res = await sbFetch("lessons?order=student_class.asc,position.asc,id.asc&select=*");
            const lessons = (await res.json().catch(() => [])) || [];
            return { lessons };
        },

        async getAdminNotes() {
            const res = await sbFetch("study_notes?order=student_class.asc,id.desc&select=*");
            const notes = (await res.json().catch(() => [])) || [];
            return { notes };
        },

        async verifyPaymentById(paymentId) {
            const pRes = await sbFetch(`payments?id=eq.${paymentId}&select=*`);
            const payments = await pRes.json().catch(() => []);
            if (payments && payments.length > 0) {
                const p = payments[0];
                await Promise.all([
                    sbFetch(`payments?id=eq.${paymentId}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "verified", verified_at: new Date().toISOString() })
                    }),
                    sbFetch(`students?enrollment_id=eq.${encodeURIComponent(p.enrollment_id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "active" })
                    })
                ]);
            }
            return { success: true };
        },

        async rejectPaymentById(paymentId, reason) {
            const pRes = await sbFetch(`payments?id=eq.${paymentId}&select=*`);
            const payments = await pRes.json().catch(() => []);
            if (payments && payments.length > 0) {
                const p = payments[0];
                await Promise.all([
                    sbFetch(`payments?id=eq.${paymentId}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "rejected" })
                    }),
                    sbFetch(`students?enrollment_id=eq.${encodeURIComponent(p.enrollment_id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "rejected" })
                    })
                ]);
            }
            return { success: true };
        },

        async setStudentStatus(idOrEnrollment, status) {
            const query = isNaN(idOrEnrollment) ? `enrollment_id=eq.${encodeURIComponent(idOrEnrollment)}` : `id=eq.${idOrEnrollment}`;
            await sbFetch(`students?${query}`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });
            return { success: true };
        },

        async deleteStudent(idOrEnrollment) {
            let enrollmentId = idOrEnrollment;
            if (!isNaN(idOrEnrollment)) {
                const sRes = await sbFetch(`students?id=eq.${idOrEnrollment}&select=enrollment_id`);
                const s = await sRes.json().catch(() => []);
                if (s && s[0]) enrollmentId = s[0].enrollment_id;
            }
            await Promise.all([
                sbFetch(`payments?enrollment_id=eq.${encodeURIComponent(enrollmentId)}`, { method: "DELETE" }),
                sbFetch(`lesson_progress?enrollment_id=eq.${encodeURIComponent(enrollmentId)}`, { method: "DELETE" }),
                sbFetch(`quiz_results?enrollment_id=eq.${encodeURIComponent(enrollmentId)}`, { method: "DELETE" }),
                sbFetch(`students?enrollment_id=eq.${encodeURIComponent(enrollmentId)}`, { method: "DELETE" })
            ]);
            return { success: true };
        },

        async addLesson(lessonData) {
            const payload = {
                student_class: lessonData.student_class || lessonData.studentClass || "VI",
                subject: lessonData.subject || "General",
                title: lessonData.title,
                video_url: lessonData.video_url || lessonData.videoUrl,
                lesson_type: lessonData.lesson_type || lessonData.lessonType || "video",
                description: lessonData.description || ""
            };
            const res = await sbFetch("lessons", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to publish lesson to Supabase.");
            }
            return { success: true };
        },

        async deleteLesson(lessonId) {
            const res = await sbFetch(`lessons?id=eq.${lessonId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete lesson from Supabase.");
            return { success: true };
        },

        async addStudyNote(noteData) {
            const payload = {
                student_class: noteData.student_class || noteData.studentClass || "VI",
                subject: noteData.subject || "General",
                title: noteData.title,
                file_url: noteData.file_url || noteData.fileUrl || "",
                content: noteData.content || ""
            };
            const res = await sbFetch("study_notes", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to save study note to Supabase.");
            }
            return { success: true };
        },

        async deleteStudyNote(noteId) {
            const res = await sbFetch(`study_notes?id=eq.${noteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete note from Supabase.");
            return { success: true };
        },

        async addAnnouncement(data) {
            const payload = {
                title: data.title,
                message: data.message,
                type: data.type || "general",
                is_active: true
            };
            const res = await sbFetch("announcements", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to broadcast announcement to Supabase.");
            }
            return { success: true };
        }
    };

    // --- Transparent Fetch Proxy for Vercel Serverless Execution ---
    const nativeFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
        if (init.__supabase_direct) {
            return nativeFetch(input, init);
        }

        let rawUrl = typeof input === "string" ? input : (input.url || "");
        const url = rawUrl.replace(/^http:\/\/[^\/]+/, "").replace(/^https:\/\/[^\/]+/, "");

        // Only intercept /api/ calls
        if (!url.startsWith("/api/")) {
            return nativeFetch(input, init);
        }

        // Try local server first ONLY if running on localhost:3000
        if (window.location.hostname === "localhost" && window.location.port === "3000") {
            try {
                const localRes = await nativeFetch(input, init);
                if (localRes.status !== 404 && localRes.status !== 502) {
                    return localRes;
                }
            } catch (e) {
                // Local server down, fallback to Supabase
            }
        }

        const reqMethod = String(init.method || "GET").toUpperCase();

        // Parse body if present
        let body = {};
        if (init.body) {
            try { body = typeof init.body === "string" ? JSON.parse(init.body) : init.body; } catch (e) { }
        }

        try {
            // --- ULTRA-HIGH LEVEL SECURITY: Admin Authentication Gate ---
            if (url.startsWith("/api/admin")) {
                let token = "";
                if (init.headers) {
                    if (init.headers instanceof Headers) {
                        token = init.headers.get("authorization") || init.headers.get("Authorization") || "";
                    } else if (typeof init.headers === "object") {
                        token = init.headers.authorization || init.headers.Authorization || "";
                    }
                }
                token = token.replace(/^Bearer\s+/i, "").trim();
                if (!token) {
                    const sessionToken = (sessionStorage.getItem("oav_admin_token") || "").trim();
                    if (sessionToken) token = sessionToken;
                }
                if (!token || token.length < 8) {
                    return jsonResponse({ error: "Administrator authentication required. Access denied." }, 401);
                }
            }

            // --- ADMIN ROUTES ---
            if (url.startsWith("/api/admin/overview")) {
                const overview = await SupabaseAPI.getAdminOverview();
                return jsonResponse(overview, 200);
            }
            if (url.startsWith("/api/admin/payments") && reqMethod === "GET") {
                const payments = await SupabaseAPI.getAdminPayments();
                return jsonResponse(payments, 200);
            }
            if (url.startsWith("/api/admin/students") && reqMethod === "GET") {
                const students = await SupabaseAPI.getAdminStudents();
                return jsonResponse(students, 200);
            }
            if (url.startsWith("/api/admin/lessons") && reqMethod === "GET") {
                const lessons = await SupabaseAPI.getAdminLessons();
                return jsonResponse(lessons, 200);
            }
            if (url.startsWith("/api/admin/notes") && reqMethod === "GET") {
                const notes = await SupabaseAPI.getAdminNotes();
                return jsonResponse(notes, 200);
            }
            if (url.includes("/verify") && reqMethod === "POST") {
                const match = url.match(/\/payments\/([^\/]+)\/verify/);
                const id = match ? match[1] : (body.paymentId || body.enrollmentId);
                await SupabaseAPI.verifyPaymentById(id);
                return jsonResponse({ success: true }, 200);
            }
            if (url.includes("/reject") && reqMethod === "POST") {
                const match = url.match(/\/payments\/([^\/]+)\/reject/);
                const id = match ? match[1] : body.paymentId;
                await SupabaseAPI.rejectPaymentById(id, body.reason);
                return jsonResponse({ success: true }, 200);
            }
            if (url.includes("/status") && reqMethod === "POST") {
                const match = url.match(/\/students\/([^\/]+)\/status/);
                const id = match ? match[1] : body.studentId;
                await SupabaseAPI.setStudentStatus(id, body.status);
                return jsonResponse({ success: true }, 200);
            }
            if (url.startsWith("/api/admin/students/") && reqMethod === "DELETE") {
                const parts = url.split("/");
                const id = decodeURIComponent(parts[parts.length - 1]);
                await SupabaseAPI.deleteStudent(id);
                return jsonResponse({ success: true }, 200);
            }
            if (url.startsWith("/api/admin/lessons") && reqMethod === "POST") {
                await SupabaseAPI.addLesson(body);
                return jsonResponse({ success: true }, 201);
            }
            if (url.startsWith("/api/admin/lessons/") && reqMethod === "DELETE") {
                const parts = url.split("/");
                const id = parts[parts.length - 1];
                await SupabaseAPI.deleteLesson(id);
                return jsonResponse({ success: true }, 200);
            }
            if (url.startsWith("/api/admin/notes") && reqMethod === "POST") {
                await SupabaseAPI.addStudyNote(body);
                return jsonResponse({ success: true }, 201);
            }
            if (url.startsWith("/api/admin/notes/") && reqMethod === "DELETE") {
                const parts = url.split("/");
                const id = parts[parts.length - 1];
                await SupabaseAPI.deleteStudyNote(id);
                return jsonResponse({ success: true }, 200);
            }
            if (url.startsWith("/api/admin/announcements") && reqMethod === "POST") {
                await SupabaseAPI.addAnnouncement(body);
                return jsonResponse({ success: true }, 201);
            }

            // --- STUDENT & PUBLIC ROUTES ---
            if (url.startsWith("/api/enroll")) {
                const res = await SupabaseAPI.enrollStudent(body);
                return jsonResponse(res, 201);
            }
            if (url.startsWith("/api/payments") || url.startsWith("/api/payment")) {
                const res = await SupabaseAPI.submitPayment(body);
                return jsonResponse(res, 200);
            }
            if (url.startsWith("/api/student/login") || url.startsWith("/api/login")) {
                const res = await SupabaseAPI.loginStudent(body.enrollmentId || body.enrollment_id, body.mobile);
                return jsonResponse(res, 200);
            }
            if (url.startsWith("/api/dashboard") || url.startsWith("/api/student/me")) {
                const student = await SupabaseAPI.getCurrentStudent();
                if (!student) return jsonResponse({ error: "Unauthorized" }, 401);
                return jsonResponse({ student, payments: [] }, 200);
            }
            if (url.startsWith("/api/student/photo") && reqMethod === "POST") {
                const saved = JSON.parse(localStorage.getItem("oav_current_student") || "{}");
                const targetId = body.enrollmentId || body.enrollment_id || saved.enrollment_id;
                const photo = body.photo || body.highResPhoto;
                let driveUploaded = false;
                let driveFileUrl = null;

                const webhookUrl = localStorage.getItem("oav_drive_webhook_url") || window.OAV_DRIVE_WEBHOOK_URL || "";
                if (webhookUrl && webhookUrl.startsWith("https://script.google.com/") && photo) {
                    try {
                        const secretKey = localStorage.getItem("oav_drive_secret_key") || window.OAV_DRIVE_SECRET_KEY || "oav_mantra_vault_secure_2026_9971";
                        const dRes = await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                secretKey,
                                action: "upload_photo",
                                folderType: "photos",
                                base64Data: photo,
                                studentName: body.studentName || saved.full_name || targetId,
                                enrollmentId: targetId,
                                studentClass: body.studentClass || saved.student_class || "VI"
                            })
                        });
                        const dData = await dRes.json().catch(() => ({}));
                        if (dData && (dData.fileUrl || dData.webViewLink)) {
                            driveUploaded = true;
                            driveFileUrl = dData.fileUrl || dData.webViewLink;
                        }
                    } catch (dErr) {
                        console.warn("[Supabase Bridge] Drive webhook error:", dErr);
                    }
                }

                if (targetId && photo) {
                    await SupabaseAPI.updateStudentPhoto(targetId, photo, driveFileUrl);
                }
                return jsonResponse({ success: true, photo, driveUploaded, driveFileUrl }, 200);
            }
            if (url.startsWith("/api/lessons")) {
                const params = new URLSearchParams(url.includes("?") ? url.slice(url.indexOf("?")) : "");
                const studentClass = params.get("class") || "VI";
                const lessons = await SupabaseAPI.getLessons(studentClass);
                return jsonResponse(lessons, 200);
            }
            if (url.startsWith("/api/notes")) {
                const params = new URLSearchParams(url.includes("?") ? url.slice(url.indexOf("?")) : "");
                const studentClass = params.get("class") || "VI";
                const notes = await SupabaseAPI.getStudyNotes(studentClass);
                return jsonResponse(notes, 200);
            }
            if (url.startsWith("/api/announcements")) {
                const announcements = await SupabaseAPI.getAnnouncements();
                return jsonResponse(announcements, 200);
            }
            if (url.startsWith("/api/progress")) {
                if (reqMethod === "GET") {
                    const studentObj = JSON.parse(localStorage.getItem("oav_current_student") || "{}");
                    const progressData = await SupabaseAPI.getProgress(studentObj.enrollment_id, studentObj.student_class);
                    return jsonResponse(progressData, 200);
                } else {
                    const studentObj = JSON.parse(localStorage.getItem("oav_current_student") || "{}");
                    const eId = body.enrollmentId || body.enrollment_id || studentObj.enrollment_id;
                    const lId = body.lessonId || body.lesson_id;
                    await SupabaseAPI.saveProgress(eId, lId);
                    return jsonResponse({ success: true }, 200);
                }
            }

        } catch (apiErr) {
            console.warn("Supabase API Bridge fallback error:", apiErr);
            const status = apiErr.status || (apiErr.code === "PAYMENT_UNDER_REVIEW" || apiErr.code === "PAYMENT_REQUIRED" || apiErr.code === "PAYMENT_REJECTED" || apiErr.code === "ACCOUNT_SUSPENDED" ? 403 : 400);
            return jsonResponse({ error: apiErr.message || "Operation failed", code: apiErr.code }, status);
        }

        return nativeFetch(input, init);
    };

    window.OAV_SUPABASE = SupabaseAPI;
    console.log("⚡ OAV Mantra Universal Supabase API Bridge Ready (Target: bnlymzocydhmpuzmiwlz).");
})();
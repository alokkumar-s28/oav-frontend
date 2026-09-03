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

        // 2. Submit Payment Claim
        async submitPayment(data) {
            const payload = {
                enrollment_id: String(data.enrollmentId || data.enrollment_id || "").trim(),
                amount: Number(data.amount) || 500,
                transaction_id: String(data.transactionId || data.transaction_id || "").trim(),
                payment_date: String(data.paymentDate || data.payment_date || new Date().toISOString().slice(0, 10)),
                payment_method: String(data.paymentMethod || data.payment_method || "quickupi").trim(),
                status: "pending_verification"
            };

            const res = await sbFetch("payments", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Payment recording failed" }));
                throw new Error(err.message || "Failed to record payment in Supabase.");
            }

            await sbFetch(`students?enrollment_id=eq.${encodeURIComponent(payload.enrollment_id)}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "payment_review" })
            }).catch(console.warn);

            return { success: true, message: "Payment submitted for administrator verification." };
        },

        // 3. Student Login
        async loginStudent(enrollmentId, mobile) {
            const cleanId = String(enrollmentId || "").trim().toUpperCase();
            const cleanMobile = String(mobile || "").trim();

            const res = await sbFetch(`students?or=(enrollment_id.eq.${cleanId},enrollment_id.eq.OAV-${cleanId})&mobile=eq.${cleanMobile}&select=*`);
            if (!res.ok) throw new Error("Failed to connect to Supabase.");

            const students = await res.json();
            if (!students || students.length === 0) {
                throw new Error("Invalid Enrollment ID or Registered Mobile number.");
            }

            const student = students[0];
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
                sbFetch("students?select=enrollment_id,full_name,mobile,student_class,school,city")
            ]);
            const payments = (await pRes.json().catch(() => [])) || [];
            const students = (await sRes.json().catch(() => [])) || [];
            const studentMap = {};
            students.forEach(s => { studentMap[s.enrollment_id] = s; });

            const formatted = payments.map(p => {
                const s = studentMap[p.enrollment_id] || {};
                return {
                    ...p,
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
                return {
                    ...s,
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
            const res = await sbFetch("lessons", {
                method: "POST",
                body: JSON.stringify(lessonData)
            });
            if (!res.ok) throw new Error("Failed to publish lesson to Supabase.");
            return { success: true };
        },

        async deleteLesson(lessonId) {
            const res = await sbFetch(`lessons?id=eq.${lessonId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete lesson from Supabase.");
            return { success: true };
        },

        async addStudyNote(noteData) {
            const res = await sbFetch("study_notes", {
                method: "POST",
                body: JSON.stringify(noteData)
            });
            if (!res.ok) throw new Error("Failed to save study note to Supabase.");
            return { success: true };
        },

        async deleteStudyNote(noteId) {
            const res = await sbFetch(`study_notes?id=eq.${noteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete note from Supabase.");
            return { success: true };
        },

        async addAnnouncement(data) {
            const res = await sbFetch("announcements", {
                method: "POST",
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to broadcast announcement to Supabase.");
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
            try { body = typeof init.body === "string" ? JSON.parse(init.body) : init.body; } catch (e) {}
        }

        try {
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
                await SupabaseAPI.saveProgress(body.enrollmentId || body.enrollment_id, body.lessonId || body.lesson_id);
                return jsonResponse({ success: true }, 200);
            }

        } catch (apiErr) {
            console.warn("Supabase API Bridge fallback error:", apiErr);
            return jsonResponse({ error: apiErr.message || "Operation failed" }, 400);
        }

        return nativeFetch(input, init);
    };

    window.OAV_SUPABASE = SupabaseAPI;
    console.log("⚡ OAV Mantra Universal Supabase API Bridge Ready (Target: bnlymzocydhmpuzmiwlz).");
})();
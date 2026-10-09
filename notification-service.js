/**
 * OAV Mantra - Admin Notification Service
 * Sends automated real-time alerts when students enroll or log in.
 * Target Admin Email: alokkumar413q@gmail.com
 *
 * Supported Dispatch Methods:
 * 1. Node.js Backend API: POST /api/notify-admin (SMTP via server.js)
 * 2. Client-side EmailJS (runs directly on Vercel without a backend server)
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NotificationService = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // --- Configuration ---
    const CONFIG = {
        adminEmail: "alokkumar413q@gmail.com, oavmantra@gmail.com",
        adminEmails: ["alokkumar413q@gmail.com", "oavmantra@gmail.com"],
        appName: "OAV Mantra",
        
        // Instant Direct Email Delivery (Free via Web3Forms - no server needed!)
        // Create a free key at https://web3forms.com by entering your email:
        web3formsAccessKey: "",

        // EmailJS Configuration (Alternative client-side email provider)
        emailjs: {
            serviceId: "",      // e.g., 'service_oavmantra'
            templateId: "",     // e.g., 'template_student_alert'
            publicKey: "",      // e.g., 'YOUR_EMAILJS_PUBLIC_KEY'
        }
    };

    // Determine Backend API Base URL
    function getApiBase() {
        if (typeof window === 'undefined') return '';
        if (window.location.protocol === 'file:') return 'http://localhost:3000';
        if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
        if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
        return '';
    }

    // Ensure EmailJS SDK is loaded if keys are provided
    let emailjsLoadingPromise = null;
    function loadEmailJsSdk() {
        if (typeof window === 'undefined') return Promise.resolve(null);
        if (window.emailjs) return Promise.resolve(window.emailjs);
        if (emailjsLoadingPromise) return emailjsLoadingPromise;

        emailjsLoadingPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.async = true;
            script.onload = () => {
                if (window.emailjs && CONFIG.emailjs.publicKey) {
                    try {
                        window.emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
                    } catch (e) {
                        console.warn('[NotificationService] EmailJS init note:', e);
                    }
                }
                resolve(window.emailjs);
            };
            script.onerror = () => {
                console.warn('[NotificationService] Failed to load EmailJS SDK from CDN.');
                resolve(null);
            };
            document.head.appendChild(script);
        });

        return emailjsLoadingPromise;
    }

    // Format current IST time
    function getFormattedTimestamp() {
        try {
            return new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'full',
                timeStyle: 'medium',
                timeZone: 'Asia/Kolkata'
            }).format(new Date()) + ' (IST)';
        } catch (e) {
            return new Date().toLocaleString();
        }
    }

    // Send dispatch to Backend API (/api/notify-admin)
    async function sendViaBackend(payload) {
        try {
            const apiBase = getApiBase();
            const res = await fetch(`${apiBase}/api/notify-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                return { success: true, backend: true, data };
            }
        } catch (err) {
            // Backend offline or running in pure static/Vercel mode
        }
        return { success: false };
    }

    // Send dispatch via EmailJS (client-side)
    async function sendViaEmailJS(templateParams) {
        if (!CONFIG.emailjs.serviceId || !CONFIG.emailjs.templateId || !CONFIG.emailjs.publicKey) {
            return { success: false, reason: "EmailJS keys not configured yet" };
        }

        try {
            const emailjs = await loadEmailJsSdk();
            if (!emailjs) return { success: false, reason: "EmailJS SDK unavailable" };

            emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
            const res = await emailjs.send(
                CONFIG.emailjs.serviceId,
                CONFIG.emailjs.templateId,
                templateParams
            );
            return { success: true, res };
        } catch (err) {
            console.warn('[NotificationService] EmailJS delivery warning:', err);
            return { success: false, error: err };
        }
    }

    // Send dispatch via Web3Forms (Instant zero-server email delivery)
    async function sendViaWeb3Forms(formData) {
        if (!CONFIG.web3formsAccessKey) return { success: false, reason: "Web3Forms access key not set" };

        try {
            const body = {
                access_key: CONFIG.web3formsAccessKey,
                from_name: "OAV Mantra Portal",
                ...formData
            };
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(body)
            });
            const result = await res.json().catch(() => ({}));
            if (result.success) {
                console.log('%c[NotificationService] ✅ Real-time email delivered via Web3Forms to ' + CONFIG.adminEmail, 'color: #10b981;');
            }
            return { success: !!result.success, result };
        } catch (err) {
            console.warn('[NotificationService] Web3Forms delivery warning:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Send Student Enrollment Alert
     * Triggered when a new student fills the registration form.
     */
    async function sendEnrollmentNotification(student) {
        if (!student) return;

        const timestamp = getFormattedTimestamp();
        const enrollmentId = student.enrollmentId || student.enrollment_id || "N/A";
        const name = student.name || student.full_name || "New Student";
        const mobile = student.mobile || student.mobileNumber || "N/A";
        const email = student.email || "N/A";
        const studentClass = student.class || student.student_class || "N/A";
        const schoolType = student.schoolType || student.school_type || "N/A";
        const city = student.city || student.district || "N/A";
        const school = student.school || "N/A";

        console.log(`%c[OAV Notification Service] 📝 Sending Student Enrollment Alert to ${CONFIG.adminEmail}...`, 'color: #2563eb; font-weight: bold;');
        console.table({
            Event: 'STUDENT_ENROLLMENT',
            Student: name,
            EnrollmentID: enrollmentId,
            Mobile: mobile,
            Class: studentClass,
            School: school,
            City: city,
            Time: timestamp
        });

        const payload = {
            event: 'enrollment',
            adminEmail: CONFIG.adminEmail,
            timestamp,
            student: {
                enrollmentId,
                name,
                mobile,
                email,
                class: studentClass,
                schoolType,
                city,
                school
            }
        };

        // 1. Try backend email dispatch
        sendViaBackend(payload).catch(() => {});

        // 2. Try EmailJS client-side dispatch
        const templateParams = {
            to_email: CONFIG.adminEmail,
            event_type: "New Student Enrollment",
            student_name: name,
            enrollment_id: enrollmentId,
            student_mobile: mobile,
            student_email: email,
            student_class: studentClass,
            school_type: schoolType,
            school_name: school,
            city_district: city,
            event_time: timestamp
        };
        sendViaEmailJS(templateParams).catch(() => {});

        // 3. Try Web3Forms instant direct dispatch
        sendViaWeb3Forms({
            subject: `🎓 New Enrollment: ${name} (${enrollmentId}) - Class ${studentClass}`,
            "Student Name": name,
            "Enrollment ID": enrollmentId,
            "Mobile Number": mobile,
            "Student Email": email,
            "Class": `Class ${studentClass}`,
            "School Board": schoolType,
            "City / District": city,
            "School": school,
            "Registration Time": timestamp
        }).catch(() => {});
    }

    /**
     * Send Student Login Alert
     * Triggered when a student logs into their study room dashboard.
     */
    async function sendLoginNotification(student) {
        if (!student) return;

        const timestamp = getFormattedTimestamp();
        const enrollmentId = student.enrollment_id || student.enrollmentId || "N/A";
        const name = student.full_name || student.name || "Student";
        const mobile = student.mobile || "N/A";
        const studentClass = student.student_class || student.class || "N/A";
        const city = student.city || "N/A";
        const school = student.school || "N/A";
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

        console.log(`%c[OAV Notification Service] 🔑 Sending Student Login Alert to ${CONFIG.adminEmail}...`, 'color: #16a34a; font-weight: bold;');
        console.table({
            Event: 'STUDENT_LOGIN',
            Student: name,
            EnrollmentID: enrollmentId,
            Mobile: mobile,
            Class: studentClass,
            City: city,
            Time: timestamp
        });

        const payload = {
            event: 'login',
            adminEmail: CONFIG.adminEmail,
            timestamp,
            userAgent,
            student: {
                enrollmentId,
                name,
                mobile,
                class: studentClass,
                city,
                school
            }
        };

        // 1. Try backend email dispatch
        sendViaBackend(payload).catch(() => {});

        // 2. Try EmailJS client-side dispatch
        const templateParams = {
            to_email: CONFIG.adminEmail,
            event_type: "Student Dashboard Login",
            student_name: name,
            enrollment_id: enrollmentId,
            student_mobile: mobile,
            student_class: studentClass,
            school_name: school,
            city_district: city,
            event_time: timestamp,
            user_device: userAgent
        };
        sendViaEmailJS(templateParams).catch(() => {});

        // 3. Try Web3Forms instant direct dispatch
        sendViaWeb3Forms({
            subject: `🔑 Student Login: ${name} (${enrollmentId}) - Class ${studentClass}`,
            "Student Name": name,
            "Enrollment ID": enrollmentId,
            "Mobile Number": mobile,
            "Class": `Class ${studentClass}`,
            "Location": `${city} ${school ? `(${school})` : ""}`,
            "Login Time": timestamp,
            "Device": userAgent
        }).catch(() => {});
    }

    return {
        CONFIG,
        sendEnrollmentNotification,
        sendLoginNotification
    };
}));

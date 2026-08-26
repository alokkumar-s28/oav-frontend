"use strict";

const API_BASE = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
    if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
    return '';
})();

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const enrollmentField = document.getElementById("enrollmentId");
    const mobileField = document.getElementById("mobile");
    const errorBanner = document.getElementById("errorBanner");
    const noticeBox = document.getElementById("noticeBox");
    const noticeText = document.getElementById("noticeText");
    const loginForm = document.getElementById("loginForm");
    const loginSubmitBtn = document.getElementById("loginSubmitBtn");

    // Auto-populate from URL if redirected
    if (params.get("enrollment") && enrollmentField) {
        enrollmentField.value = params.get("enrollment").trim().toUpperCase();
    }
    if (params.get("mobile") && mobileField) {
        mobileField.value = params.get("mobile").trim().replace(/\D/g, "").slice(-10);
    }

    if (params.get("status") === "review" && noticeBox) {
        noticeBox.classList.add("show");
        noticeBox.style.background = "#eff6ff";
        noticeBox.style.borderLeftColor = "#2563eb";
        noticeBox.style.color = "#1e40af";
        noticeText.innerHTML = "<strong>⏳ Payment Under Review:</strong> Your payment claim has been submitted. Our admin team will verify and approve your account shortly. Once approved, you can log in below.";
    } else if (params.get("error") === "payment_required" && noticeBox) {
        noticeBox.classList.add("show");
        noticeText.textContent = "Payment verification is required before your study portal can be unlocked. If you already submitted a payment claim, please allow our admin a short time to verify it.";
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        errorBanner.style.display = "none";
        errorBanner.textContent = "";

        const rawEnrollment = enrollmentField.value.trim().toUpperCase();
        const rawMobile = mobileField.value.trim();
        const cleanMobile = rawMobile.replace(/\D/g, "").slice(-10);

        if (!rawEnrollment) {
            showError("Please enter your Enrollment ID.");
            return;
        }

        if (!cleanMobile || cleanMobile.length !== 10) {
            showError("Please enter your 10-digit registered mobile number.");
            return;
        }

        const origText = loginSubmitBtn.innerHTML;
        loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginSubmitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/student/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ enrollmentId: rawEnrollment, mobile: cleanMobile })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.student) {
                    localStorage.setItem('oav_current_student', JSON.stringify(data.student));
                }
                loginSubmitBtn.innerHTML = '<i class="fas fa-check"></i> Success! Opening Dashboard...';
                setTimeout(() => {
                    const target = (data.redirect || "dashboard.html").replace(/^\/+/, "");
                    window.location.href = target;
                }, 300);
                return;
            } else {
                showError(data.error || "Authentication failed. Please verify your credentials.");
                loginSubmitBtn.innerHTML = origText;
                loginSubmitBtn.disabled = false;
                return;
            }
        } catch (serverError) {
            console.warn("Backend request error, checking offline cache:", serverError);
            
            // Fallback for offline testing mode
            try {
                const localStudents = JSON.parse(localStorage.getItem('oav_students') || '[]');
                const currentSaved = JSON.parse(localStorage.getItem('oav_current_student') || 'null');
                const match = localStudents.find(s => (s.enrollmentId === rawEnrollment || s.enrollment_id === rawEnrollment) && String(s.mobile).replace(/\D/g, "").slice(-10) === cleanMobile) ||
                              (currentSaved && (currentSaved.enrollment_id === rawEnrollment || currentSaved.enrollmentId === rawEnrollment) ? currentSaved : null);

                if (match) {
                    const status = match.status || 'active';
                    if (status === 'payment_review' || status === 'pending_verification') {
                        showError("⏳ Verification Pending: Your payment is currently under review by our admin team. Once approved in the admin panel, your account will unlock. Please try again in some time.");
                        loginSubmitBtn.innerHTML = origText;
                        loginSubmitBtn.disabled = false;
                        return;
                    }
                    if (status === 'rejected') {
                        showError("❌ Payment Rejected: Your payment claim was rejected. Please contact support at +91 89175 31123.");
                        loginSubmitBtn.innerHTML = origText;
                        loginSubmitBtn.disabled = false;
                        return;
                    }

                    localStorage.setItem('oav_current_student', JSON.stringify(match));
                    loginSubmitBtn.innerHTML = '<i class="fas fa-check"></i> Success! Opening Dashboard...';
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 300);
                    return;
                }
            } catch (e) {}

            showError("Could not connect to server or verify account. Please make sure backend is running.");
            loginSubmitBtn.innerHTML = origText;
            loginSubmitBtn.disabled = false;
        }
    });

    function showError(msg) {
        errorBanner.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right:6px;"></i> ${msg}`;
        errorBanner.style.display = "block";
    }
});




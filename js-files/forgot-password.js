// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Password Reset Function
const forgotPasswordForm = document.getElementById("forgot-password-form");

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const resetEmail = document.getElementById("reset-email").value;

    try {
        await sendPasswordResetEmail(auth, resetEmail);
        window.alert("Password reset email sent. Check your inbox to reset your password.");
    } catch (error) {
        console.error("Forgot password error:", error.message);
    }
});
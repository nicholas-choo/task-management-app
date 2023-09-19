import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const resetPasswordBtn = document.getElementById('reset-password');
const deleteAccountBtn = document.getElementById('delete-account');
const deleteAccountDialogue = document.getElementById('delete-account-confirmation');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const continueDeleteBtn = document.getElementById('continue-delete');

function getCurrentUserEmail() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const currentUserEmail = user.email.replace(/\./g, '%');
                resolve(currentUserEmail);
            } else {
                reject("User not authenticated");
            }
        });
    });
}

resetPasswordBtn.addEventListener('click', async () => {
    try {
        const email = await getCurrentUserEmail();
        const actualEmail = email.replace('%', '.');

        try {
            await sendPasswordResetEmail(auth, actualEmail);
            window.alert("Password reset email sent. Check your inbox to reset your password.");
        } catch (error) {
            console.error("Forgot password error:", error.message);
        }
    } catch (error) {
        console.error(error);
    }
});

deleteAccountBtn.addEventListener('click', function() {
    deleteAccountDialogue.style.display = 'grid';
});

cancelDeleteBtn.addEventListener('click', function(event) {
    event.preventDefault();
    const typedEmail = document.getElementById('email-address');
    typedEmail.value = '';
    deleteAccountDialogue.style.display = 'none';
});

continueDeleteBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        const email = await getCurrentUserEmail();
        const actualEmail = email.replace('%', '.');
        const typedEmail = document.getElementById('email-address');
        const password = prompt("Please enter your password for verification:");
        
        if (typedEmail.value == actualEmail) {
            try {
                // Sign the user in with email and password for confirmation
                const credential = await EmailAuthProvider.credential(typedEmail.value, password);
                const user = auth.currentUser;

                reauthenticateWithCredential(user, credential).then(async () => {
                    const userRef = ref(database, 'users/' + email);
                    const userSnapshot = await get(userRef);

                    if (userSnapshot.exists()) {
                        set(userRef, null, function(error) {
                            if (error) {
                                console.error('Error deleting user information:', error);
                            } else {
                                console.log('User information deleted successfully.');
                            }
                        });
                    }

                    // Now you can delete the user account
                    auth.currentUser.delete().then(() => {
                        console.log("Account deleted.");
                        window.location.href = "login.html";
                    }).catch((error) => {
                        console.error("Error deleting account:", error);
                    });
                }) .catch((error) => {
                    console.error("Reauthentication error:", error.message);
                });
            } catch (error) {
                console.error("Sign-in error:", error.message);
            }
        } else {
            console.error("Email confirmation failed.");
        }
    } catch (error) {
        console.error(error);
    }
});

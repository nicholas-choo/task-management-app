import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, get, push, update } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Sign Out Function
const signOutButton = document.getElementById("sign-out-button");

signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Sign-out error:", error.message);
    }
});

redirectToDashboardIfNotLoggedIn();

// Logged In Checker
function redirectToDashboardIfNotLoggedIn() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            if (!user.emailVerified) {
                auth.signOut().then(() => {
                    console.log("Email not verified. User logged out.");
                }).catch((error) => {
                    console.error("Error signing out:", error.message);
                });
            }
        }
    });
}

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

getNotifications();

async function getNotifications() {
    try {
        const email = await getCurrentUserEmail();
        const listsRef = ref(database, 'users/' + email + '/lists');

        const listsSnapshot = await get(listsRef);

        if (listsSnapshot.exists()) {
            const promises = []; // Create an array to hold promises
            const listDataArray = []; // Store list data for later access
            const listKeyArray = []; // Store list keys for later access

            listsSnapshot.forEach((listSnapshot) => {
                const listKey = listSnapshot.key;
                const listData = listSnapshot.val();

                const tasksRef = ref(database, 'users/' + email + '/lists/' + listKey + '/tasks');

                // Push the promise into the array
                promises.push(get(tasksRef));
                listDataArray.push(listData);
                listKeyArray.push(listKey);
            });

            // Wait for all promises to resolve
            const tasksSnapshots = await Promise.all(promises);

            tasksSnapshots.forEach((tasksSnapshot, index) => {
                const listData = listDataArray[index]; // Get list data for the current task list
                const listKey = listKeyArray[index]; // Get list key for the current task list

                if (tasksSnapshot.exists()) {
                    tasksSnapshot.forEach((taskSnapshot) => {
                        const taskData = taskSnapshot.val();
                        const dueDate = new Date(taskData.taskDueDate);
                        const currentDate = new Date();
                        const progress = taskData.taskProgress;

                        const notificationRef = ref(database, 'users/' + email + '/notifications');

                        if (!taskData.hasOwnProperty('notified') && progress == false && dueDate < currentDate) {
                            // Add notification
                            push(notificationRef, {
                                taskName: taskData.taskName,
                                taskKey: taskSnapshot.key,
                                from: listData.listName,
                                listKey: listKey,
                                taskDueDate: taskData.taskDueDate
                            });

                            // If it doesn't exist, set "notified" to true
                            update(ref(database, 'users/' + email + '/lists/' + listKey + '/tasks/' + taskSnapshot.key), {
                                notified: true
                            });
                            
                            notificationChecker();
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}

notificationChecker();

async function notificationChecker() {
    try {
        const email = await getCurrentUserEmail();
        const notificationsRef = ref(database, 'users/' + email + '/notifications');

        const notificationsSnapshot = await get(notificationsRef);

        if (notificationsSnapshot.exists()) {
            const notificationActive = document.getElementById('notifications');

            notificationsSnapshot.forEach((notificationSnapshot) => {
                const dataArray = notificationSnapshot.val();

                if (!dataArray.hasOwnProperty('seen')) {
                    notificationActive.classList.add('active');
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}
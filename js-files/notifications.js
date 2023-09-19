import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

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

notificationFiller();

async function notificationFiller() {
    try {
        const email = await getCurrentUserEmail();
        const notificationsRef = ref(database, 'users/' + email + '/notifications');

        const notificationsSnapshot = await get(notificationsRef);

        const notificationCont = document.getElementById('notifications-cont');
        const notificationEmpty = document.getElementById('notifications-empty');

        const currentDate = new Date().toISOString().split('T')[0];

        notificationsSnapshot.forEach((notificationSnapshot) => {
            const notificationKey = notificationSnapshot.key;

            notificationEmpty.style.display = 'none';

            const notificationData = notificationSnapshot.val();

            const div = document.createElement('div');

            if (!notificationData.hasOwnProperty('seen')) {
                div.classList.add('active');
            }

            const span1 = document.createElement('span');

            const h4 = document.createElement('h4');
            h4.textContent = 'Overdue Task';

            const pTaskDesc = document.createElement('p');
            pTaskDesc.textContent = 'One of your tasks named "' + notificationData.taskName + '" has passed its due date. The due date for this task was ' + notificationData.taskDueDate + '. This task is from the list "' + notificationData.from + '".';
            
            const span2 = document.createElement('span');

            const button = document.createElement('button');

            if (notificationSnapshot.val().seen) {
                button.textContent = 'Marked as read';
            } else {
                button.textContent = 'Mark as read';

                button.addEventListener('click', markAsRead);
            }

            function markAsRead() {
                div.classList.remove('active');
                button.textContent = 'Marked as read';

                // Add seen to the database
                update(ref(database, 'users/' + email + '/notifications/' + notificationKey), {
                    seen: true
                });

                notificationChecker();

                button.removeEventListener('click', markAsRead);
            }

            const pDate = document.createElement('p');

            if (!notificationData.hasOwnProperty('date')) {
                pDate.textContent = currentDate;

                // Add current date to the database
                update(ref(database, 'users/' + email + '/notifications/' + notificationKey), {
                    date: currentDate
                });
            } else {
                pDate.textContent = notificationData.date;
            }

            span1.appendChild(h4);
            span1.appendChild(pTaskDesc);
            span2.appendChild(button);
            span2.appendChild(pDate);
            div.appendChild(span1);
            div.appendChild(span2);
            notificationCont.appendChild(div);
        });
    } catch (error) {
        console.error(error);
    }
}

async function notificationChecker() {
    try {
        const email = await getCurrentUserEmail();
        const notificationsRef = ref(database, 'users/' + email + '/notifications');

        const notificationsSnapshot = await get(notificationsRef);

        if (notificationsSnapshot.exists()) {
            const notificationActive = document.getElementById('notifications');

            let counter = 0;

            notificationsSnapshot.forEach((notificationSnapshot) => {
                const dataArray = notificationSnapshot.val();

                if (!dataArray.hasOwnProperty('seen')) {
                    counter++;
                }
            });

            if (counter == 0) {
                notificationActive.classList.remove('active');
            }
        }
    } catch (error) {
        console.error(error);
    }
}
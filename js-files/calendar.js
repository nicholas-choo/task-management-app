import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const monthDisplay = document.getElementById('month-display');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const calendarDays = document.getElementById('calendar-days');

// Initialize the current date
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Function to generate the calendar for a given month and year
async function generateCalendar(month, year) {
    // Set the month display
    monthDisplay.textContent = `${new Date(year, month).toLocaleDateString('default', { month: 'long' })} ${year}`;

    // Clear the previous calendar days
    calendarDays.innerHTML = '';

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);

    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create day headers (Sun, Mon, Tue, etc.)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const dayOfWeek of daysOfWeek) {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = dayOfWeek;
        calendarDays.appendChild(dayHeader);
    }

    // Add blank cells for the days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const blankCell = document.createElement('div');
        blankCell.classList.add('calendar-day');
        calendarDays.appendChild(blankCell);
    }

    const tasksFromFirebase = await getTasks();

    // Create day cells for the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.textContent = day;

        // Example: Add tasks from Firebase to the calendar
        // You'll need to replace this with actual Firebase integration
        /*const tasksFromFirebase = [
            { date: `2023-9-1`, taskName: 'Task 1' },
            { date: `2023-9-15`, taskName: 'Task 2' },
        ];*/

        tasksFromFirebase.forEach(task => {
            const plusMonth = month + 1;
            const strMonth = plusMonth.toString();
            let newMonth;

            if (strMonth.length === 1) {
                newMonth = 0 + strMonth;
            } else {
                newMonth = strMonth;
            }

            const strDay = day.toString();
            let newDay;

            if (strDay.length === 1) {
                newDay = 0 + strDay;
            } else {
                newDay = strDay;
            }

            if (task.taskDueDate === `${year}-${newMonth}-${newDay}`) {
                const spacer = document.createElement('div');
                spacer.classList.add('calendar-task-spacer');

                const taskElement = document.createElement('a');
                taskElement.classList.add('calendar-task');
                taskElement.href = `task.html?key=${task.listKey}`;

                const pTaskName = document.createElement('p');
                pTaskName.textContent = task.taskName;

                const pTaskFrom = document.createElement('p');
                pTaskFrom.textContent = 'From: ' + task.listName;

                taskElement.appendChild(pTaskName);
                taskElement.appendChild(pTaskFrom);
                dayCell.appendChild(spacer);
                dayCell.appendChild(taskElement);
            }
        });

        calendarDays.appendChild(dayCell);
    }
}

// Function to update the calendar when navigating to the previous month
function showPreviousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

// Function to update the calendar when navigating to the next month
function showNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
}

// Initial calendar generation
generateCalendar(currentMonth, currentYear);

// Event listeners for navigation buttons
prevMonthButton.addEventListener('click', showPreviousMonth);
nextMonthButton.addEventListener('click', showNextMonth);

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

async function getTasks() {
    try {
        const email = await getCurrentUserEmail();
        const listsRef = ref(database, 'users/' + email + '/lists');

        const promises = [];
        const listDataArray = [];
        const allTasks = [];

        const listsSnapshot = await get(listsRef);

        listsSnapshot.forEach((listSnapshot) => {
            const listKey = listSnapshot.key;
            const listData = listSnapshot.val();

            const tasksRef = ref(database, 'users/' + email + '/lists/' + listKey + '/tasks');

            promises.push(get(tasksRef));
            listDataArray.push({listName: listData.listName, listKey: listKey});
        });

        const tasksSnapshots = await Promise.all(promises);

        tasksSnapshots.forEach((tasksSnapshot, index) => {
            tasksSnapshot.forEach((taskSnapshot) => {
                const taskData = taskSnapshot.val();
                allTasks.push({ ...taskData, listKey: listDataArray[index].listKey, listName: listDataArray[index].listName });
            });
        });

        return allTasks;
    } catch (error) {
        console.error(error);
    }
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const expandListBtn0 = document.getElementById('expand-0');
const collapseListBtn0 = document.getElementById('collapse-0');
const expandListBtn1 = document.getElementById('expand-1');
const collapseListBtn1 = document.getElementById('collapse-1');
const expandListBtn2 = document.getElementById('expand-2');
const collapseListBtn2 = document.getElementById('collapse-2');
const expandListBtn3 = document.getElementById('expand-3');
const collapseListBtn3 = document.getElementById('collapse-3');

expandListBtn0.addEventListener('click', function() {
    expandList('list-0')
});

expandListBtn1.addEventListener('click', function() {
    expandList('list-1')
});

expandListBtn2.addEventListener('click', function() {
    expandList('list-2')
});

expandListBtn3.addEventListener('click', function() {
    expandList('list-3')
});

function expandList(list) {
    const listCont = document.getElementById(list);
    listCont.classList.add('active');
}

collapseListBtn0.addEventListener('click', function() {
    collapseList('list-0')
});

collapseListBtn1.addEventListener('click', function() {
    collapseList('list-1')
});

collapseListBtn2.addEventListener('click', function() {
    collapseList('list-2')
});

collapseListBtn3.addEventListener('click', function() {
    collapseList('list-3')
});

function collapseList(list) {
    const listCont = document.getElementById(list);
    listCont.classList.remove('active');
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

getTasks();

async function getTasks() {
    try {
        const email = await getCurrentUserEmail();
        const listsRef = ref(database, 'users/' + email + '/lists');

        const listsSnapshot = await get(listsRef);

        if (listsSnapshot.exists()) {
            const promises = []; // Create an array to hold promises
            const listDataArray = []; // Store list data for later access
            const allTasks = []; // Store all tasks from all lists

            listsSnapshot.forEach((listSnapshot) => {
                const listKey = listSnapshot.key;
                const listData = listSnapshot.val();

                const tasksRef = ref(database, 'users/' + email + '/lists/' + listKey + '/tasks');

                // Push the promise into the array
                promises.push(get(tasksRef));
                listDataArray.push({ listName: listData.listName, listKey: listKey }); // Store list data with listKey
            });

            // Wait for all promises to resolve
            const tasksSnapshots = await Promise.all(promises);

            tasksSnapshots.forEach((tasksSnapshot, index) => {
                if (tasksSnapshot.exists()) {
                    tasksSnapshot.forEach((taskSnapshot) => {
                        const taskData = taskSnapshot.val();
                        allTasks.push({ ...taskData, listKey: listDataArray[index].listKey }); // Push task data with listKey
                    });
                }
            });

            // Sort all tasks by due date
            allTasks.sort((a, b) => {
                const dueDateA = new Date(a.taskDueDate);
                const dueDateB = new Date(b.taskDueDate);
                return dueDateA - dueDateB;
            });

            const currentDate = new Date();

            allTasks.forEach((taskData) => {
                const dueDate = new Date(taskData.taskDueDate);
                const progress = taskData.taskProgress;
                const priority = taskData.taskPriority;
                const timeDifference = dueDate - currentDate;
                const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

                if (daysDifference >= 0 && daysDifference <= 7 && progress === false) {
                    const listData = listDataArray.find(list => list.listKey === taskData.listKey);
                    if (listData) {
                        createTaskElements(taskData.taskName, listData.listName, taskData.taskDueDate, listData.listKey, 'tasksDueWithin7Days');
                    }
                }

                if (dueDate >= currentDate && dueDate.getMonth() === currentDate.getMonth() && dueDate.getFullYear() === currentDate.getFullYear() && progress == false) {
                    const listData = listDataArray.find(list => list.listKey === taskData.listKey);
                    if (listData) {
                        createTaskElements(taskData.taskName, listData.listName, taskData.taskDueDate, listData.listKey, 'tasksDueThisMonth');
                    }
                }

                if (progress == false && priority == true) {
                    const listData = listDataArray.find(list => list.listKey === taskData.listKey);
                    if (listData) {
                        createTaskElements(taskData.taskName, listData.listName, taskData.taskDueDate, listData.listKey, 'priorityTasks');
                    }
                }

                if (progress == false && dueDate < currentDate) {
                    const listData = listDataArray.find(list => list.listKey === taskData.listKey);
                    if (listData) {
                        createTaskElements(taskData.taskName, listData.listName, taskData.taskDueDate, listData.listKey, 'overdueTasks');
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}

function createTaskElements(taskName, listName, taskDueDate, uniqueKey, context) {
    const div = document.createElement('div');

    const span1 = document.createElement('span');

    const pTaskName = document.createElement('p');
    pTaskName.textContent = taskName;

    const span2 = document.createElement('span');

    const aListName = document.createElement('a');
    aListName.textContent = listName;
    aListName.href = `task.html?key=${uniqueKey}`;

    const pTaskDueDate = document.createElement('p');
    pTaskDueDate.textContent = taskDueDate;

    span1.appendChild(pTaskName);
    span2.appendChild(aListName);
    span2.appendChild(pTaskDueDate);
    div.appendChild(span1);
    div.appendChild(span2);

    if (context == 'tasksDueWithin7Days') {
        const listCont = document.getElementById('list-cont-0');
        listCont.appendChild(div);
    
        const listEmpty = document.getElementById('list-empty-0');
        listEmpty.style.display = 'none';
    }

    if (context == 'tasksDueThisMonth') {
        const listCont = document.getElementById('list-cont-1');
        listCont.appendChild(div);
    
        const listEmpty = document.getElementById('list-empty-1');
        listEmpty.style.display = 'none';
    }

    if (context == 'priorityTasks') {
        const listCont = document.getElementById('list-cont-2');
        listCont.appendChild(div);
    
        const listEmpty = document.getElementById('list-empty-2');
        listEmpty.style.display = 'none';
    }

    if (context == 'overdueTasks') {
        const listCont = document.getElementById('list-cont-3');
        listCont.appendChild(div);
    
        const listEmpty = document.getElementById('list-empty-3');
        listEmpty.style.display = 'none';
    }
}
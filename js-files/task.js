import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const queryParams = new URLSearchParams(window.location.search);
const uniqueKey = queryParams.get('key');

const taskForm = document.getElementById('task-form');
const taskFormContext = document.getElementById('task-form-context');
const taskFormName = document.getElementById('task-name');
const taskFormDueDate = document.getElementById('task-due-date');
const taskFormPriority = document.getElementById('task-priority');
const taskFormProgress = document.getElementById('task-progress');
const showNewTaskForm = document.getElementById('add-task');
const closeTaskBtn = document.getElementById('close-task-form');
const createTaskBtn = document.getElementById('create-task-form');

const deleteTask = document.getElementById('delete-task');
const deleteTaskName = document.getElementById('delete-task-name');
const closeDeleteTaskBtn = document.getElementById('close-delete-task');
const continueDeleteTaskBtn = document.getElementById('continue-delete-task');

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

checkListExistence(uniqueKey);

function checkListExistence(uniqueKey) {
    getCurrentUserEmail()
        .then((email) => {
            const itemRef = ref(database, 'users/' + email + '/lists/' + uniqueKey);

            get(itemRef)
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        window.location.href = "home.html";
                    }
                })
                .catch((error) => {
                    console.error("Error checking if item exists:", error);
                });
        })
        .catch((error) => {
            console.error(error);
        });
}

// Call the function to retrieve data based on the unique key
retrieveListData(uniqueKey);

// Function to retrieve list name and color from the database
function retrieveListData(uniqueKey) {
    getCurrentUserEmail()
        .then((email) => {
            // Replace 'your-database-path' with the actual path to your data
            const listRef = ref(database, 'users/' + email + '/lists/' + uniqueKey);
        
            // Retrieve data from the database
            get(listRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const listData = snapshot.val();
                        const listName = listData.listName;
                        const listColor = listData.listColor;
        
                        // Create elements with retrieved data
                        createListTitleElements(listName, listColor);
                    } else {
                        window.location.href = "home.html";
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving data:", error);
                });

            onValue(listRef, (snapshot) => {
                if (snapshot.exists()) {
                    const taskContainer1 = document.getElementById('list-completed-tasks');
                    const taskContainer2 = document.getElementById('list-in-progress-tasks');
                    const taskContainer3 = document.getElementById('list-overdue-tasks');

                    let existingElements1 = taskContainer1.querySelectorAll('div');
                    let existingElements2 = taskContainer2.querySelectorAll('div');
                    let existingElements3 = taskContainer3.querySelectorAll('div');

                    existingElements1.forEach((div) => {
                        taskContainer1.removeChild(div);
                    })

                    existingElements2.forEach((div) => {
                        taskContainer2.removeChild(div);
                    })

                    existingElements3.forEach((div) => {
                        taskContainer3.removeChild(div);
                    })

                    const listData = snapshot.val();

                    // Assuming listData contains your data object
                    if (listData.tasks) {
                        for (const taskId in listData.tasks) {
                            if (listData.tasks.hasOwnProperty(taskId)) {
                                const taskData = listData.tasks[taskId];
                                
                                // Perform your action for each task here
                                // For example, you can create elements for each task
                                createTaskElements(taskId, taskData);
                            }
                        }
                    }

                    existingElements1 = taskContainer1.querySelectorAll('div');
                    existingElements2 = taskContainer2.querySelectorAll('div');
                    existingElements3 = taskContainer3.querySelectorAll('div');

                    if (existingElements1.length == 0) {
                        const emptyTaskText1 = document.getElementById('empty-task-1');
                        emptyTaskText1.style.display = 'block';
                    }

                    if (existingElements2.length == 0) {
                        const emptyTaskText2 = document.getElementById('empty-task-2');
                        emptyTaskText2.style.display = 'block';
                    }

                    if (existingElements3.length == 0) {
                        const emptyTaskText3 = document.getElementById('empty-task-3');
                        emptyTaskText3.style.display = 'block';
                    }
                } else {
                    window.location.href = "home.html";
                }
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to create the elements
function createListTitleElements(listName, listColor) {
    const listTitleContainer = document.getElementById('list-title');
    
    // Create the <span> element
    const span = document.createElement('span');
    span.style.backgroundColor = listColor; // Set the background color

    // Create the <p> element inside <span>
    const p = document.createElement('p');
    p.textContent = listName.charAt(0); // Get the first character of the list name
    span.appendChild(p);

    // Create the <h1> element
    const h1 = document.createElement('h1');
    h1.textContent = listName;

    // Append elements to the container
    listTitleContainer.appendChild(span);
    listTitleContainer.appendChild(h1);
}

function createTaskElements(taskId, taskData) {
    const div = document.createElement('div');

    const span1 = document.createElement('span');

    const pTaskName = document.createElement('p');
    pTaskName.textContent = taskData.taskName;

    const editButton = document.createElement('button');
    editButton.id = 'edit-task';

    editButton.addEventListener('click', function() {
        taskFormContext.textContent = 'Edit';
        createTaskBtn.textContent = 'Save';
        taskForm.style.display = 'grid';

        taskFormName.value = taskData.taskName;
        taskFormDueDate.value = taskData.taskDueDate;
        
        if (taskData.taskPriority == true) {
            taskFormPriority.checked = true;
        }
        
        if (taskData.taskProgress == true) {
            taskFormProgress.checked = true;
        }

        closeTaskBtn.addEventListener('click', closeEditTask)
        
        function closeEditTask() {
            event.preventDefault();
            taskForm.style.display = 'none';
            taskFormName.value = '';
            taskFormDueDate.value = '';
            taskFormPriority.checked = false;
            taskFormProgress.checked = false;
            createTaskBtn.removeEventListener('click', saveTask);
            closeTaskBtn.removeEventListener('click', closeEditTask)
        }

        createTaskBtn.addEventListener('click', saveTask);

        function saveTask() {
            getCurrentUserEmail()
                .then((email) => {
                    const taskName = taskFormName.value;
                    const taskDueDate = taskFormDueDate.value;
                    const taskPriority = taskFormPriority.checked;
                    const taskProgress = taskFormProgress.checked;
    
                    const taskRef = ref(database, 'users/' + email + '/lists/' + uniqueKey + '/tasks/' + taskId);
    
                    if (taskName != "" && taskDueDate != "") {
                        set(taskRef, {
                            taskName: taskName,
                            taskDueDate: taskDueDate,
                            taskPriority: taskPriority,
                            taskProgress: taskProgress
                        });
    
                        closeNewTask();
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            createTaskBtn.removeEventListener('click', saveTask);
        }
    });

    const editSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const editPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    editSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    editSvg.setAttribute('viewBox', '0 0 48 48');
    editSvg.setAttribute('fill', 'currentColor');
    editPath.setAttribute('d', 'M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 A 1.50015 1.50015 0 0 0 6.9121094 42.941406 L 17.302734 39.974609 A 1.50015 1.50015 0 0 0 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 A 1.50015 1.50015 0 0 0 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 A 1.50015 1.50015 0 0 0 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z');

    editSvg.appendChild(editPath);
    editButton.appendChild(editSvg);

    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-task';

    deleteButton.addEventListener('click', function() {
        deleteTaskName.textContent = taskData.taskName;
        deleteTask.style.display = 'grid';
        continueDeleteTaskBtn.addEventListener('click', deleteTaskFunc)
    });

    function deleteTaskFunc() {
        getCurrentUserEmail()
            .then((email) => {
                const taskRef = ref(database, 'users/' + email + '/lists/' + uniqueKey + '/tasks/' + taskId);
    
                set(taskRef, null, function(error) {
                    if (error) {
                        console.error('Error deleting list:', error);
                    } else {
                        console.log('List deleted successfully.');
                    }
                });
            })
            .catch((error) => {
                console.error(error);
            });

        deleteTask.style.display = 'none';
        continueDeleteTaskBtn.removeEventListener('click', deleteTaskFunc);
    }

    closeDeleteTaskBtn.addEventListener('click', closeDeleteTask);
    
    function closeDeleteTask() {
        deleteTask.style.display = 'none';
        continueDeleteTaskBtn.removeEventListener('click', deleteTaskFunc);
    }

    const deleteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const deletePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    deleteSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    deleteSvg.setAttribute('viewBox', '0 0 48 48');
    deleteSvg.setAttribute('fill', 'currentColor');
    deletePath.setAttribute('d', 'M 24 4 C 20.704135 4 18 6.7041348 18 10 L 11.746094 10 A 1.50015 1.50015 0 0 0 11.476562 9.9785156 A 1.50015 1.50015 0 0 0 11.259766 10 L 7.5 10 A 1.50015 1.50015 0 1 0 7.5 13 L 10 13 L 10 38.5 C 10 41.519774 12.480226 44 15.5 44 L 32.5 44 C 35.519774 44 38 41.519774 38 38.5 L 38 13 L 40.5 13 A 1.50015 1.50015 0 1 0 40.5 10 L 36.746094 10 A 1.50015 1.50015 0 0 0 36.259766 10 L 30 10 C 30 6.7041348 27.295865 4 24 4 z M 24 7 C 25.674135 7 27 8.3258652 27 10 L 21 10 C 21 8.3258652 22.325865 7 24 7 z M 13 13 L 35 13 L 35 38.5 C 35 39.898226 33.898226 41 32.5 41 L 15.5 41 C 14.101774 41 13 39.898226 13 38.5 L 13 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z');

    deleteSvg.appendChild(deletePath);
    deleteButton.appendChild(deleteSvg);

    span1.appendChild(pTaskName);
    span1.appendChild(editButton);
    span1.appendChild(deleteButton);

    const span2 = document.createElement('span');

    const pTaskDueDate = document.createElement('p');
    pTaskDueDate.textContent = taskData.taskDueDate;

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.disabled = true;

    if (taskData.taskPriority == true) {
        checkboxInput.checked = true;
    } else {
        checkboxInput.checked = false;
    }

    const pTaskProgress = document.createElement('p');
    const today = new Date();
    const targetDate = new Date(taskData.taskDueDate);
    let taskContainer;
    let emptyTaskText;

    if (taskData.taskProgress == true) {
        pTaskProgress.textContent = 'Completed';
        taskContainer = document.getElementById('list-completed-tasks');
        emptyTaskText = document.getElementById('empty-task-1');
    } else if (targetDate > today) {
        pTaskProgress.textContent = 'In Progress';
        taskContainer = document.getElementById('list-in-progress-tasks');
        emptyTaskText = document.getElementById('empty-task-2');
    } else {
        pTaskProgress.textContent = 'Overdue';
        taskContainer = document.getElementById('list-overdue-tasks');
        emptyTaskText = document.getElementById('empty-task-3');
    }

    span2.appendChild(pTaskDueDate);
    span2.appendChild(checkboxInput);
    span2.appendChild(pTaskProgress);

    div.appendChild(span1);
    div.appendChild(span2);

    emptyTaskText.style.display = 'none';
    
    taskContainer.appendChild(div);
}

showNewTaskForm.addEventListener('click', function() {
    taskFormContext.textContent = 'New';
    createTaskBtn.textContent = 'Create';
    taskForm.style.display = 'grid';
    
    createTaskBtn.addEventListener('click', createTask);
    closeTaskBtn.addEventListener('click', closeNewTask)
});

function closeNewTask() {
    event.preventDefault();
    taskForm.style.display = 'none';
    taskFormName.value = '';
    taskFormDueDate.value = '';
    taskFormPriority.checked = false;
    taskFormProgress.checked = false;
    createTaskBtn.removeEventListener('click', createTask);
    closeTaskBtn.removeEventListener('click', closeNewTask)
}

function createTask() {
    getCurrentUserEmail()
        .then((email) => {
            const taskName = taskFormName.value;
            const taskDueDate = taskFormDueDate.value;
            const taskPriority = taskFormPriority.checked;
            const taskProgress = taskFormProgress.checked;

            const taskRef = ref(database, 'users/' + email + '/lists/' + uniqueKey + '/tasks');

            if (taskName != "" && taskDueDate != "") {
                push(taskRef, {
                    taskName: taskName,
                    taskDueDate: taskDueDate,
                    taskPriority: taskPriority,
                    taskProgress: taskProgress
                });

                closeNewTask();
            }
        })
        .catch((error) => {
            console.error(error);
        });
    createTaskBtn.removeEventListener('click', createTask);
}
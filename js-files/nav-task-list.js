import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const newListPopUp = document.getElementById('new-list');
const closeNewListBtn = document.getElementById('close-new-list');
const createListBtn = document.getElementById('create-new-list');
const newListForm = document.getElementById('new-list-form');
const newListName = document.getElementById('list-name');
const newListColor = document.getElementById('list-color');
const showNewListForm = document.getElementById('show-new-list');

const deleteListPopUp = document.getElementById('delete-list');
const deleteListName = document.getElementById('delete-list-name');
const closeDeleteListBtn = document.getElementById('close-delete-list');
const continueDeleteList = document.getElementById('continue-delete-list');

showNewListForm.addEventListener('click', function() {
    newListPopUp.style.display = 'grid';
});

closeNewListBtn.addEventListener('click', closeNewList)

function closeNewList() {
    event.preventDefault();
    newListPopUp.style.display = 'none';
    newListName.value = '';
    newListColor.value = '#000000';
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

createListBtn.addEventListener('click', function() {
    getCurrentUserEmail()
        .then((email) => {
            const listName = newListName.value;
            const listColor = newListColor.value;
            const listRef = ref(database, 'users/' + email + '/lists');

            if (listName != "") {
                push(listRef, {
                    listName: listName,
                    listColor: listColor
                });

                closeNewList();
            }
        })
        .catch((error) => {
            console.error(error);
        });
});

newListForm.addEventListener('submit', function(event) {
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', displayLists);

function displayLists() {
    getCurrentUserEmail()
        .then((email) => {
            const listsRef = ref(database, 'users/' + email + '/lists');
            const listsContainer = document.getElementById('listsContainer');

            onValue(listsRef, (snapshot) => {
                if (!listsContainer.hasChildNodes()) {
                    listsContainer.innerHTML = '';
                }

                const existingLiElements = listsContainer.querySelectorAll('li');
    
                existingLiElements.forEach((li) => {
                    listsContainer.removeChild(li);
                });

                snapshot.forEach((childSnapshot) => {
                    const listData = childSnapshot.val();
                    const listName = listData.listName;
                    const listColor = listData.listColor;
                    const uniqueKey = childSnapshot.key;

                    const listElement = createListElement(listName, listColor, uniqueKey);

                    listsContainer.appendChild(listElement);
                });
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

function createListElement(listName, listColor, uniqueKey) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const div = document.createElement('div');
    const span = document.createElement('span');
    const p = document.createElement('p');
    const h3 = document.createElement('h3');
    const button = document.createElement('button');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    a.href = `task.html?key=${uniqueKey}`;
    a.classList.add('nav-task-list');

    span.style.backgroundColor = listColor;

    const bgColor = span.style.backgroundColor;
    const brightness = getBrightness(bgColor);

    if (brightness < 80) {
        p.style.color = "white";
    }

    p.textContent = listName.charAt(0);
    h3.textContent = listName;

    button.classList.add('nav-delete-list');
    button.id = 'nav-delete-list';
    button.setAttribute('data-key', uniqueKey);

    button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const uniqueKey = this.getAttribute('data-key');
        
        deleteListPopUp.style.display = 'grid';

        retrieveListName(uniqueKey);

        function retrieveListName(uniqueKey) {
            getCurrentUserEmail()
                .then((email) => {
                    const listRef = ref(database, 'users/' + email + '/lists/' + uniqueKey);
        
                    get(listRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const listData = snapshot.val();
                            const listName = listData.listName;
        
                            deleteListName.textContent = listName;
                        } else {
                            console.log('List not found.');
                        }
                    }).catch((error) => {
                        console.error('Error retrieving list:', error);
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        
        closeDeleteListBtn.removeEventListener('click', closeDeleteForm);
        closeDeleteListBtn.addEventListener('click', closeDeleteForm);

        function closeDeleteForm() {
            deleteListPopUp.style.display = 'none';
            closeDeleteListBtn.removeEventListener('click', closeDeleteForm);
            continueDeleteList.removeEventListener('click', deleteList);
        }
        
        continueDeleteList.removeEventListener('click', deleteList);
        continueDeleteList.addEventListener('click', deleteList);

        function deleteList() {
            getCurrentUserEmail()
                .then((email) => {
                    const listsRef = ref(database, 'users/' + email + '/lists/' + uniqueKey);
        
                    set(listsRef, null, function(error) {
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

            deleteListPopUp.style.display = 'none';
            closeDeleteListBtn.removeEventListener('click', closeDeleteForm);
            continueDeleteList.removeEventListener('click', deleteList);
        }
    });

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 48 48');
    svg.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M 24 4 C 20.704135 4 18 6.7041348 18 10 L 11.746094 10 A 1.50015 1.50015 0 0 0 11.476562 9.9785156 A 1.50015 1.50015 0 0 0 11.259766 10 L 7.5 10 A 1.50015 1.50015 0 1 0 7.5 13 L 10 13 L 10 38.5 C 10 41.519774 12.480226 44 15.5 44 L 32.5 44 C 35.519774 44 38 41.519774 38 38.5 L 38 13 L 40.5 13 A 1.50015 1.50015 0 1 0 40.5 10 L 36.746094 10 A 1.50015 1.50015 0 0 0 36.259766 10 L 30 10 C 30 6.7041348 27.295865 4 24 4 z M 24 7 C 25.674135 7 27 8.3258652 27 10 L 21 10 C 21 8.3258652 22.325865 7 24 7 z M 13 13 L 35 13 L 35 38.5 C 35 39.898226 33.898226 41 32.5 41 L 15.5 41 C 14.101774 41 13 39.898226 13 38.5 L 13 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z');

    span.appendChild(p);
    div.appendChild(span);
    div.appendChild(h3);
    a.appendChild(div);
    a.appendChild(button);
    button.appendChild(svg);
    svg.appendChild(path);
    li.appendChild(a);

    return li;
}

function getBrightness(color) {
    const match = color.match(/rgba?\((\d+), (\d+), (\d+)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);

        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return 0;
}
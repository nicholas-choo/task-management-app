# TaskTracker

Effortlessly manage tasks and boost productivity with TaskTracker - your all-in-one task management app. Streamline your workflow, organize projects, set priorities, and never miss a deadline again. From intuitive task creation to smart reminders, TaskTracker empowers you to stay on top of your tasks and achieve your goals with ease.

## Features

TaskTracker comes with the following key features:

1. **Task Creation:** Easily add new tasks with titles, descriptions, due dates, and priority levels.
2. **Task Listing:** View all your tasks in an organized list, sorted by priority and due date.
3. **Task Details:** Click on a task to see its details, including description, due date, and priority.
4. **Task Editing:** Modify task details or update task status (e.g., mark as completed).
5. **Task Deletion:** Remove tasks you no longer need.
6. **Task Search:** Quickly find specific tasks using a search feature.
7. **Task Filtering:** Filter tasks by status (e.g., all tasks, completed tasks, or active tasks).
8. **Task Sorting:** Sort tasks by due date or priority.
9. **User Accounts:** Create a user account to store your tasks securely.
10. **User Authentication:** Log in and out of your account for data privacy.

## Installation and Firebase Setup

To set up TaskTracker on your local machine, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/tasktracker.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd tasktracker
   ```

3. **Create a Firebase Project:**

   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project for TaskTracker. Follow the on-screen instructions to set up your project.

4. **Retrieve Your Firebase Configuration:**

   - In the Firebase Console, select your project.
   - Click on the "Add app" button (the web icon) to add a web app to your project.
   - Follow the setup instructions and register the app.

5. **Create `firebaseConfig.js` File:**

   - Navigate to "js-files" in the root directory of your TaskTracker project.
   - Create a new file named `firebaseConfig.js`.

6. **Add Firebase Configuration:**

   Open `firebaseConfig.js` and add the Firebase configuration object you retrieved in step 4:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };

   export { firebaseConfig }
   ```

7. **Start Using TaskTracker:**

   Open the `index.html` file in your web browser to start using TaskTracker.

Now, TaskTracker is set up locally.

## Note: TaskTracker is not optimized for tablet or mobile view

Please be aware that TaskTracker is primarily designed for desktop use and may not provide an optimal experience on tablet or mobile devices. While you can access TaskTracker on smaller screens, certain features and functionalities may not be fully optimized for these platforms. We recommend using TaskTracker on a desktop or laptop for the best user experience.

We are continually working on improving TaskTracker's responsiveness and adaptability to different screen sizes, and future updates may address these limitations.

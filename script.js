// ==========================================
// FLASK BACKEND URL
// ==========================================

const API_URL = "http://127.0.0.1:5000/api/tasks";


// ==========================================
// GET TASKS FROM BACKEND
// ==========================================

async function getTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to get tasks");
        }

        const tasks = await response.json();

        return tasks;

    } catch (error) {

        console.error("Error getting tasks:", error);

        alert("Cannot connect to StudySync backend.");

        return [];
    }
}


// ==========================================
// DISPLAY TASKS
// ==========================================

async function renderTasks() {

    const timetable =
        document.getElementById("timetable");

    const tasks = await getTasks();

    timetable.innerHTML = "";


    // No tasks
    if (tasks.length === 0) {

        timetable.innerHTML = `
            <div class="empty-message">
                📚 No study tasks available.
                <br><br>
                Add a new task above!
            </div>
        `;

        updateProgress(tasks);

        return;
    }


    // Create task cards
    tasks.forEach(function(task) {

        const card =
            document.createElement("div");


        // Select card style
        let cardType = "other-card";


        if (
            task.subject
                .toLowerCase()
                .includes("java")
        ) {

            cardType = "java-card";

        }

        else if (
            task.subject
                .toLowerCase()
                .includes("python")
        ) {

            cardType = "python-card";
        }


        card.className =
            "task-card " + cardType;


        // Completed style
        if (task.completed) {

            card.classList.add("completed");
        }


        // Store database ID
        card.setAttribute(
            "data-id",
            task.id
        );


        card.innerHTML = `

            <div class="icon">
                📚
            </div>

            <div class="time">
                ${escapeHTML(task.time)}
            </div>

            <div class="subject">
                ${escapeHTML(task.subject)}
            </div>

            <div class="activity">
                ${escapeHTML(task.task)}
            </div>

            <div class="reward">
                🪙 Reward: 10 Coins
            </div>

            <button
                class="complete-btn"
                onclick="toggleComplete(this)"
            >
                ${
                    task.completed
                    ? "Completed ✓ 🪙 +10"
                    : "Start Task"
                }
            </button>

            <div class="action-buttons">

                <button
                    class="edit-btn"
                    onclick="editTask(this)"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(this)"
                >
                    🗑️ Delete
                </button>

            </div>
        `;


        timetable.appendChild(card);

    });


    updateProgress(tasks);
}


// ==========================================
// COMPLETE / UNCOMPLETE TASK
// ==========================================

async function toggleComplete(button) {

    const card =
        button.closest(".task-card");


    const taskId =
        Number(
            card.getAttribute("data-id")
        );


    // Get current tasks
    const tasks = await getTasks();


    const task =
        tasks.find(function(item) {

            return item.id === taskId;

        });


    if (!task) {

        return;
    }


    // Change completed status
    task.completed =
        !task.completed;


    try {

        const response = await fetch(
            `${API_URL}/${taskId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    subject: task.subject,

                    task: task.task,

                    time: task.time,

                    completed: task.completed

                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to update task"
            );
        }


        // Refresh screen
        renderTasks();

    }

    catch (error) {

        console.error(
            "Error updating task:",
            error
        );

        alert(
            "Unable to update task."
        );
    }
}


// ==========================================
// UPDATE PROGRESS
// ==========================================

function updateProgress(tasks) {

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    let percentage = 0;


    if (totalTasks > 0) {

        percentage =
            Math.round(
                (completedTasks /
                    totalTasks) * 100
            );
    }


    // 10 coins for each completed task
    const coins =
        completedTasks * 10;


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage + "%";


    document.getElementById(
        "progressText"
    ).innerText =
        percentage +
        "% Completed";


    document.getElementById(
        "coinCount"
    ).innerText =
        coins;
}


// ==========================================
// ADD NEW TASK
// ==========================================

async function addTask() {

    const subjectInput =
        document.getElementById(
            "subjectInput"
        );


    const taskInput =
        document.getElementById(
            "taskInput"
        );


    const timeInput =
        document.getElementById(
            "timeInput"
        );


    const subject =
        subjectInput.value.trim();


    const task =
        taskInput.value.trim();


    const time =
        timeInput.value.trim();


    // Validation
    if (
        subject === "" ||
        task === "" ||
        time === ""
    ) {

        alert(
            "Please fill all fields!"
        );

        return;
    }


    try {

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    subject: subject,

                    task: task,

                    time: time

                })
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add task"
            );
        }


        // Clear inputs
        subjectInput.value = "";

        taskInput.value = "";

        timeInput.value = "";


        // Refresh tasks
        renderTasks();

    }

    catch (error) {

        console.error(
            "Error adding task:",
            error
        );

        alert(
            "Unable to add task."
        );
    }
}


// ==========================================
// EDIT TASK
// ==========================================

async function editTask(button) {

    const card =
        button.closest(".task-card");


    const taskId =
        Number(
            card.getAttribute("data-id")
        );


    const tasks =
        await getTasks();


    const task =
        tasks.find(function(item) {

            return item.id === taskId;

        });


    if (!task) {

        return;
    }


    // New subject
    const newSubject =
        prompt(
            "Enter new subject:",
            task.subject
        );


    if (newSubject === null) {

        return;
    }


    // New task
    const newTask =
        prompt(
            "Enter new study task:",
            task.task
        );


    if (newTask === null) {

        return;
    }


    // New time
    const newTime =
        prompt(
            "Enter new time:",
            task.time
        );


    if (newTime === null) {

        return;
    }


    // Validation
    if (
        newSubject.trim() === "" ||
        newTask.trim() === "" ||
        newTime.trim() === ""
    ) {

        alert(
            "Fields cannot be empty!"
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${taskId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    subject:
                        newSubject.trim(),

                    task:
                        newTask.trim(),

                    time:
                        newTime.trim(),

                    completed:
                        task.completed

                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to edit task"
            );
        }


        // Refresh screen
        renderTasks();

    }

    catch (error) {

        console.error(
            "Error editing task:",
            error
        );

        alert(
            "Unable to edit task."
        );
    }
}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(button) {

    const card =
        button.closest(".task-card");


    const taskId =
        Number(
            card.getAttribute("data-id")
        );


    const confirmation =
        confirm(
            "Do you want to delete this task?"
        );


    if (!confirmation) {

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${taskId}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete task"
            );
        }


        // Refresh screen
        renderTasks();

    }

    catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

        alert(
            "Unable to delete task."
        );
    }
}


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START APPLICATION
// ==========================================

renderTasks();
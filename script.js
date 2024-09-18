document.addEventListener("DOMContentLoaded", () => {
  const taskifyTitle = document.querySelector("h1");
  const container = document.querySelector(".container");

  // Fade in Taskify immediately, but it will take 1.5 seconds to complete
  setTimeout(() => {
    taskifyTitle.classList.add("fade-in");
  }, 100);

  // Show the main container and start animations after the full stop finishes bouncing
  setTimeout(() => {
    startApp();
  }, 2700); // 100ms + 1500ms + 1100ms = 2700ms

  function startApp() {
    container.style.display = "block";

    // Fade out Taskify title, then move it
    taskifyTitle.classList.add("fade-out");
    setTimeout(() => {
      taskifyTitle.classList.remove("fade-out");
      taskifyTitle.classList.add("move-to-corner");
      // Remove the original title element
      taskifyTitle.remove();
      // Create a new element in the bottom right corner
      setTimeout(() => {
        createBottomRightTitle();
      }, 4000); // Delay to match container expansion
    }, 2000); // 2000ms delay for smooth transition

    container.classList.add("focus-in");

    const clearBtn = document.querySelector(".clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", showConfirmDialog);
    }

    const flagBtn = document.querySelector(".flag-btn");
    if (flagBtn) {
      flagBtn.addEventListener("click", toggleFlagEntry);
    }

    const dateFilter = document.getElementById("dateFilter");
    if (dateFilter) {
      dateFilter.addEventListener("change", filterEntriesByDate);
    }

    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");
    if (confirmYes) {
      confirmYes.addEventListener("click", () => {
        deleteAllEntries();
        hideConfirmDialog();
      });
    }
    if (confirmNo) {
      confirmNo.addEventListener("click", hideConfirmDialog);
    }

    // Add event listener for the Enter key on the input field
    const taskInput = document.getElementById("taskInput");
    if (taskInput) {
      taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          addEntry();
        }
      });
    }

    // Add event listener for the add button
    const addBtn = document.querySelector(".add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", addEntry);
    }

    // Event delegation for diary list
    const taskList = document.getElementById("taskList");
    if (taskList) {
      taskList.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
          const li = event.target.closest("li");
          fadeOutEntry(li); // Fade out the entry before removing it
        } else if (event.target.closest("li")) {
          const li = event.target.closest("li");
          // Remove highlight from any previously highlighted entry
          const previouslyHighlighted = document.querySelector(
            "#taskList li.highlight-border"
          );
          if (previouslyHighlighted && previouslyHighlighted !== li) {
            previouslyHighlighted.classList.remove("highlight-border");
          }
          li.classList.add("highlight-border");
        }
      });
    }

    // Remove highlight from entries when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !event.target.closest("#taskList li") &&
        !event.target.classList.contains("flag-btn")
      ) {
        const highlightedEntries = document.querySelectorAll(
          "#taskList li.highlight-border"
        );
        highlightedEntries.forEach((entry) => {
          entry.classList.remove("highlight-border");
        });
      }
    });

    // Populate date filter dropdown
    populateDateFilter();

    // Load entries from local storage
    loadEntriesFromLocalStorage();
  }

  function createBottomRightTitle() {
    const bottomRightTitle = document.createElement("div");
    bottomRightTitle.classList.add("bottom-right-title");
    bottomRightTitle.textContent = "recall.";
    document.body.appendChild(bottomRightTitle);
  }

  async function addEntry() {
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    if (taskInput && taskList && taskInput.value.trim() !== "") {
      const li = document.createElement("li");
      const now = new Date();
      const dateTimeString = now.toLocaleString();

      li.innerHTML = `
        <button class="delete-btn">×</button>
        <div class="task-content">
          <span>${taskInput.value}</span>
          <span class="date-time">${dateTimeString}</span>
        </div>
      `;

      taskList.insertBefore(li, taskList.firstChild);
      taskInput.value = "";
      populateDateFilter();
      saveEntriesToLocalStorage(); // Save to local storage
    }
  }
});

function removeEntry(button) {
  const li = button.closest("li");
  if (li) {
    fadeOutEntry(li); // Fade out the entry before removing it
  }
}

function deleteAllEntries() {
  const taskList = document.getElementById("taskList");
  if (taskList) {
    const entries = taskList.querySelectorAll("li");
    entries.forEach((entry) => {
      fadeOutEntry(entry); // Fade out each entry before removing it
    });
  }
}

function toggleFlagEntry() {
  const highlightedEntry = document.querySelector(
    "#taskList li.highlight-border"
  );
  if (highlightedEntry) {
    highlightedEntry.classList.toggle("flagged");
    saveEntriesToLocalStorage(); // Save to local storage
  }
}

function fadeOutEntry(entry) {
  entry.classList.add("fade-out");
  entry.addEventListener("animationend", () => {
    entry.remove();
    // Update date filter dropdown
    populateDateFilter();
    saveEntriesToLocalStorage(); // Save to local storage
  });
}

function populateDateFilter() {
  const dateFilter = document.getElementById("dateFilter");
  const taskList = document.getElementById("taskList");
  const dates = new Set();

  if (taskList) {
    const entries = taskList.querySelectorAll("li .date-time");
    entries.forEach((entry) => {
      const date = new Date(entry.textContent).toLocaleDateString();
      dates.add(date);
    });
  }

  // Clear existing options
  dateFilter.innerHTML = '<option value="">Select Date</option>';

  // Add new options
  dates.forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateFilter.appendChild(option);
  });
}

function filterEntriesByDate() {
  const dateFilter = document.getElementById("dateFilter");
  const selectedDate = dateFilter.value;
  const taskList = document.getElementById("taskList");

  if (taskList) {
    const entries = taskList.querySelectorAll("li");
    entries.forEach((entry) => {
      const entryDate = new Date(
        entry.querySelector(".date-time").textContent
      ).toLocaleDateString();
      if (selectedDate === "" || entryDate === selectedDate) {
        entry.style.display = "";
      } else {
        entry.style.display = "none";
      }
    });
  }
}

function showConfirmDialog() {
  const taskList = document.getElementById("taskList");
  if (taskList && taskList.querySelectorAll("li").length > 0) {
    const confirmDialog = document.getElementById("confirmDialog");
    if (confirmDialog) {
      confirmDialog.style.display = "block";
    }
  }
}

function hideConfirmDialog() {
  const confirmDialog = document.getElementById("confirmDialog");
  if (confirmDialog) {
    confirmDialog.style.display = "none";
  }
}

// Speech recognition setup
const micButton = document.getElementById("micButton");
const taskInput = document.getElementById("taskInput");

let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    taskInput.value = transcript;
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
  };

  micButton.addEventListener("click", function () {
    if (recognition.isStarted) {
      recognition.stop();
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
      recognition.start();
      micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
  });

  recognition.onend = function () {
    micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    recognition.isStarted = false;
  };

  recognition.onstart = function () {
    recognition.isStarted = true;
  };
} else {
  console.log("Web Speech API is not supported in this browser.");
  micButton.style.display = "none";
}

// Save entries to local storage
function saveEntriesToLocalStorage() {
  const taskList = document.getElementById("taskList");
  const entries = [];

  if (taskList) {
    taskList.querySelectorAll("li").forEach((li) => {
      const taskContent = li.querySelector(".task-content span").textContent;
      const dateTime = li.querySelector(".date-time").textContent;
      const flagged = li.classList.contains("flagged");
      entries.push({ taskContent, dateTime, flagged });
    });
  }

  localStorage.setItem("diaryEntries", JSON.stringify(entries));
}

// Load entries from local storage
function loadEntriesFromLocalStorage() {
  const taskList = document.getElementById("taskList");
  const entries = JSON.parse(localStorage.getItem("diaryEntries")) || [];

  if (taskList) {
    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="delete-btn">×</button>
        <div class="task-content">
          <span>${entry.taskContent}</span>
          <span class="date-time">${entry.dateTime}</span>
        </div>
      `;
      if (entry.flagged) {
        li.classList.add("flagged");
      }
      taskList.appendChild(li);
    });
    populateDateFilter();
  }
}

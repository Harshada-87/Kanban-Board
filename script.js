const cards = document.querySelectorAll(".card");
const lists = document.querySelectorAll(".list");

for (const card of cards) {
  card.addEventListener("dragstart", dragStart);
  card.addEventListener("dragend", dragEnd);
}

for (const list of lists) {
  list.addEventListener("dragover", dragOver);
  list.addEventListener("dragenter", dragEnter);
  list.addEventListener("dragleave", dragLeave);
  list.addEventListener("drop", dragDrop);
}

function dragStart(e) {
  e.dataTransfer.setData("text/plain", this.id);
}

function dragEnd() {}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("over");
}

function dragLeave(e) {
  this.classList.remove("over");
}

function dragDrop(e) {
  const id = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(id);
  this.appendChild(card);
  this.classList.remove("over");
  saveBoard();
}

const addBtn = document.getElementById("add-btn");
const newTaskInput = document.getElementById("new-task");
const todoList = document.getElementById("l1");

function createCard(id, text) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("draggable", "true");
  card.id = id;

  const textEl = document.createElement("span");
  textEl.textContent = text;

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.classList.add("edit-btn");

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.classList.add("delete-btn");

  // Attach listeners
  card.addEventListener("dragstart", dragStart);
  card.addEventListener("dragend", dragEnd);
  editBtn.addEventListener("click", () => editCard(card, textEl));
  delBtn.addEventListener("click", () => showDeletePopup(card));

  card.appendChild(textEl);
  card.appendChild(editBtn);
  card.appendChild(delBtn);

  return card;
}

// Allow adding task by pressing Enter key
newTaskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addBtn.click(); // trigger the existing Add Task button click
  }
});

// Custom delete confirmation popup
function showDeletePopup(card) {
  const popup = document.createElement("div");
  popup.className = "confirm-popup";
  popup.innerHTML = `
    <div class="confirm-box">
      <p>Delete this task?</p>
      <div class="confirm-buttons">
        <button id="yes-btn">Yes</button>
        <button id="no-btn">No</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#yes-btn").onclick = () => {
    card.remove();
    popup.remove();
    saveBoard();
  };

  popup.querySelector("#no-btn").onclick = () => popup.remove();
}

function editCard(card, textEl) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = textEl.textContent;
  input.classList.add("edit-input");

  const editBtn = card.querySelector(".edit-btn");
  const deleteBtn = card.querySelector(".delete-btn");

  // Hide icons on small screens while editing

  if (window.innerWidth <= 600) {
    editBtn.style.display = "none";
    deleteBtn.style.display = "none";
  }

  card.replaceChild(input, textEl);
  input.focus();

  input.addEventListener("blur", () => {
    textEl.textContent = input.value.trim() || textEl.textContent;
    card.replaceChild(textEl, input);
    saveBoard();

    // Show icons again after editing (on small screens)
    if (window.innerWidth <= 600) {
      editBtn.style.display = "inline";
      deleteBtn.style.display = "inline";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      input.blur();
    }
  });
}

// ADD TASK
addBtn.addEventListener("click", () => {
  const taskText = newTaskInput.value.trim();
  // if (taskText === "") return alert("Please enter a task");

  if (taskText === "") {
    showMessage("⚠️ Please enter a task!");
    return;
  }

  //   "c" + Date.now() generates a unique ID like "c1730055677000"
  //    taskText → passes the cleaned task text.
  //    This creates the draggable card element
  const newCard = createCard("c" + Date.now(), taskText);
  // console.log(newCard);

  todoList.appendChild(newCard); // l1
  newTaskInput.value = ""; // reset the newtask i/p value to empty string
  saveBoard();
});

function showMessage(msg) {
  let messageEl = document.getElementById("message");
  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.id = "message";
    messageEl.style.color = "red";
    messageEl.style.textAlign = "center";
    messageEl.style.marginLeft = "20px";
    document.querySelector(".add-task").appendChild(messageEl);
  }

  messageEl.textContent = msg;

  setTimeout(() => (messageEl.textContent = ""), 2000); // clear after 2 sec
}

// Save board to localStorage
function saveBoard() {
  const data = {};
  lists.forEach((list) => {
    const cards = Array.from(list.querySelectorAll(".card")).map((card) => {
      const span = card.querySelector("span");
      return { id: card.id, text: span ? span.textContent : card.textContent };
    });
    data[list.id] = cards;
  });
  localStorage.setItem("kanbanData", JSON.stringify(data));
}

// Load board from localStorage
function loadBoard() {
  const saved = localStorage.getItem("kanbanData");
  if (!saved) return;
  const data = JSON.parse(saved);
  for (const listId in data) {
    const list = document.getElementById(listId);
    data[listId].forEach((cardData) => {
      const card = createCard(cardData.id, cardData.text);
      list.appendChild(card);
    });
  }
}

loadBoard();

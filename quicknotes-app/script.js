// 1. SELECT HTML ELEMENTS
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const saveButton = document.querySelector("#save-btn");
const clearButton = document.querySelector("#clear-btn");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

// 2. APPLICATION DATA
const NOTES_KEY = "quicknotes-notes";
const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";

const MAX_CHARACTERS = 200;
const WARNING_LIMIT = 180;

// Each note will be an object inside this array.
let notes = [];

// 3. LOAD NOTES FROM LOCAL STORAGE
function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(NOTES_KEY);

    if (savedNotes !== null) {
      const parsedNotes = JSON.parse(savedNotes);

      // Make sure the saved data is an array.
      if (Array.isArray(parsedNotes)) {
        notes = parsedNotes;
      } else {
        notes = [];
      }
    }
  } catch (error) {
    console.error("Could not load saved notes:", error);
    notes = [];
  }
}

// 4. SAVE NOTES TO LOCAL STORAGE
function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// 5. UPDATE CHARACTER AND WORD COUNT
function updateCounts() {
  const text = textarea.value;
  const characters = text.length;

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  charCount.textContent = `${characters} / ${MAX_CHARACTERS} characters`;

  wordCount.textContent = `${words} words`;

  // Reset the counter's warning classes.
  charCount.classList.remove("warning", "over");

  if (characters > MAX_CHARACTERS) {
    charCount.classList.add("over");
  } else if (characters > WARNING_LIMIT) {
    charCount.classList.add("warning");
  }
}

// 6. DISPLAY VALIDATION ERRORS
function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

// 7. RENDER NOTES
function render() {
  // Remove the old list items.
  notesList.replaceChildren();

  // Get the search term and make it case-insensitive.
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Filter notes according to the search term.
  const filteredNotes = notes.filter((note) => {
    return (
      note.text.toLowerCase().includes(searchTerm) ||
      note.category.toLowerCase().includes(searchTerm)
    );
  });

  // Create a list item for every matching note.
  filteredNotes.forEach((note) => {
    const listItem = document.createElement("li");

    const noteText = document.createElement("p");
    noteText.textContent = note.text;

    const category = document.createElement("p");
    category.textContent = `Category: ${note.category}`;

    const date = document.createElement("small");
    date.textContent = `Created: ${new Date(note.createdAt).toLocaleString()}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    // Store the note ID on the button.
    deleteButton.dataset.id = note.id;

    listItem.append(noteText, category, date, deleteButton);

    notesList.appendChild(listItem);
  });

  // Display an appropriate message if no notes match.
  if (filteredNotes.length === 0) {
    const emptyMessage = document.createElement("li");

    emptyMessage.textContent = searchTerm
      ? "No notes match your search."
      : "You haven't saved any notes yet.";

    notesList.appendChild(emptyMessage);
  }

  // Update the total count of saved notes, not filtered results.
  const total = notes.length;

  if (total === 0) {
    noteCount.textContent = "No notes saved.";
  } else if (total === 1) {
    noteCount.textContent = "1 note saved.";
  } else {
    noteCount.textContent = `${total} notes saved.`;
  }
}

// 8. ADD A NEW NOTE
function addNote() {
  const text = textarea.value.trim();
  saveButton.addEventListener("click", addNote);

  // Validate empty notes.
  if (text === "") {
    showError("Please enter a note before saving.");
    return;
  }

  // Validate the 200-character limit.
  if (text.length > MAX_CHARACTERS) {
    showError("Your note cannot exceed 200 characters.");
    return;
  }

  // Create the note object.
  const newNote = {
    id: crypto.randomUUID(),
    text: text,
    category: "General",
    createdAt: new Date().toISOString(),
  };

  // Add the note to the array.
  notes.unshift(newNote);

  // Save notes and update the interface.
  saveNotes();
  render();

  // Clear the input and its draft.
  textarea.value = "";
  localStorage.removeItem(DRAFT_KEY);

  updateCounts();
  clearError();
}

// 9. DELETE A NOTE
function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);

  saveNotes();
  render();
}

// Use event delegation for delete buttons.
notesList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");

  if (!button || !notesList.contains(button)) {
    return;
  }

  deleteNote(button.dataset.id);
});

// 10. SEARCH NOTES
searchInput.addEventListener("input", render);

// 11. CLEAR THE NOTE INPUT
function clearEverything() {
  textarea.value = "";

  localStorage.removeItem(DRAFT_KEY);

  updateCounts();
  clearError();
}

clearButton.addEventListener("click", clearEverything);

textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearEverything();
  }
});

// 12. SAVE AND RESTORE THE DRAFT
textarea.addEventListener("input", () => {
  updateCounts();
  clearError();

  localStorage.setItem(DRAFT_KEY, textarea.value);
});

function restoreDraft() {
  const savedDraft = localStorage.getItem(DRAFT_KEY);

  if (savedDraft !== null) {
    textarea.value = savedDraft;
  }

  updateCounts();
}

// 14. INITIALIZE THE APPLICATION
loadNotes();
restoreDraft();
render();

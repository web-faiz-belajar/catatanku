
// ==================================
// CATATANKU - JAVASCRIPT
// ==================================

const notesContainer = document.getElementById("notesContainer");
const emptyState = document.getElementById("emptyState");
const noteCount = document.getElementById("noteCount");

const addBtn = document.getElementById("addBtn");
const themeBtn = document.getElementById("themeBtn");
const searchInput = document.getElementById("searchInput");

const editorOverlay = document.getElementById("editorOverlay");
const closeEditor = document.getElementById("closeEditor");
const editorTitle = document.getElementById("editorTitle");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");

let notes = JSON.parse(localStorage.getItem("catatanku_notes") || "[]");
let editingId = null;

// ==================================
// PENYIMPANAN
// ==================================

function saveToStorage() {
  localStorage.setItem("catatanku_notes", JSON.stringify(notes));
}

// ==================================
// TEMA
// ==================================

let currentTheme = localStorage.getItem("catatanku_theme") || "system";

function applyTheme() {
  const isDark = currentTheme === "dark" ||
    (currentTheme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.body.classList.toggle("dark", isDark);

  themeBtn.textContent =
    currentTheme === "light" ? "☀" :
    currentTheme === "dark" ? "☾" : "◐";

  themeBtn.title = "Tema: " + currentTheme;
}

themeBtn.addEventListener("click", () => {
  const themes = ["light", "dark", "system"];

  const currentIndex = themes.indexOf(currentTheme);
  currentTheme = themes[(currentIndex + 1) % themes.length];

  localStorage.setItem("catatanku_theme", currentTheme);

  applyTheme();
});

const systemTheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
);

systemTheme.addEventListener("change", () => {
  if (currentTheme === "system") {
    applyTheme();
  }
});

applyTheme();

// ==================================
// MENAMPILKAN CATATAN
// ==================================

function renderNotes() {
  notesContainer.innerHTML = "";

  const keyword = searchInput.value.toLowerCase().trim();

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(keyword) ||
    note.content.toLowerCase().includes(keyword)
  );

  noteCount.textContent = filteredNotes.length + " catatan";

  emptyState.style.display =
    filteredNotes.length === 0 ? "block" : "none";

  if (filteredNotes.length === 0) {
    emptyState.querySelector("h3").textContent =
      keyword ? "Catatan tidak ditemukan" : "Belum ada catatan";

    emptyState.querySelector("p").textContent =
      keyword ? "Coba kata kunci lainnya." :
      "Mulai tulis ide atau sesuatu yang penting.";
  }

  filteredNotes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title || "Tanpa judul";

    const content = document.createElement("p");
    content.textContent = note.content;

    const date = document.createElement("small");
    date.textContent = note.date;

    card.append(title, content, date);

    card.addEventListener("click", () => {
      openEditor(note.id);
    });

    notesContainer.appendChild(card);
  });
}

// ==================================
// MEMBUKA EDITOR
// ==================================

function openEditor(id = null) {
  editingId = id;

  if (id !== null) {
    const note = notes.find(item => item.id === id);

    if (!note) return;

    editorTitle.textContent = "Edit catatan";
    noteTitle.value = note.title;
    noteContent.value = note.content;
    deleteBtn.style.display = "block";

  } else {
    editorTitle.textContent = "Catatan baru";
    noteTitle.value = "";
    noteContent.value = "";
    deleteBtn.style.display = "none";
  }

  editorOverlay.classList.add("active");
  noteTitle.focus();
}

function closeEditorWindow() {
  editorOverlay.classList.remove("active");
  editingId = null;
}

addBtn.addEventListener("click", () => {
  openEditor();
});

closeEditor.addEventListener("click", closeEditorWindow);

editorOverlay.addEventListener("click", event => {
  if (event.target === editorOverlay) {
    closeEditorWindow();
  }
});

// ==================================
// MENYIMPAN CATATAN
// ==================================

saveBtn.addEventListener("click", () => {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title && !content) {
    alert("Isi judul atau konten catatan terlebih dahulu.");
    return;
  }

  const now = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (editingId !== null) {
    const note = notes.find(item => item.id === editingId);

    if (note) {
      note.title = title;
      note.content = content;
      note.date = now;
    }

  } else {
    notes.unshift({
      id: Date.now(),
      title: title,
      content: content,
      date: now
    });
  }

  saveToStorage();
  renderNotes();
  closeEditorWindow();
});

// ==================================
// MENGHAPUS CATATAN
// ==================================

deleteBtn.addEventListener("click", () => {
  if (editingId === null) return;

  const yakin = confirm("Yakin ingin menghapus catatan ini?");

  if (!yakin) return;

  notes = notes.filter(note => note.id !== editingId);

  saveToStorage();
  renderNotes();
  closeEditorWindow();
});

// ==================================
// PENCARIAN
// ==================================

searchInput.addEventListener("input", renderNotes);

// ==================================
// MULAI APLIKASI
// ==================================

renderNotes();

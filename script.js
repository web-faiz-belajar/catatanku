
/* =========================================
   CATATANKU
   MAIN JAVASCRIPT
========================================= */

// =========================================
// 1. MENGAMBIL ELEMEN HTML
// =========================================

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

// =========================================
// 2. DATA CATATAN
// =========================================

let notes = [];

try {
  const savedNotes = localStorage.getItem("catatanku_notes");
  const parsedNotes = savedNotes ? JSON.parse(savedNotes) : [];

  notes = Array.isArray(parsedNotes)
    ? parsedNotes.filter(note =>
        note &&
        typeof note === "object" &&
        typeof note.id === "number" &&
        typeof note.title === "string" &&
        typeof note.content === "string"
      )
    : [];

} catch (error) {
  console.error("Gagal membaca catatan:", error);
  notes = [];
}

let editingId = null;

// =========================================
// 3. MENYIMPAN DATA
// =========================================

function saveToStorage() {
  try {
    localStorage.setItem(
      "catatanku_notes",
      JSON.stringify(notes)
    );

    return true;

  } catch (error) {
    console.error("Gagal menyimpan catatan:", error);

    alert("Catatan gagal disimpan. Periksa penyimpanan browser.");

    return false;
  }
}

// =========================================
// 4. SISTEM TEMA
// =========================================

let currentTheme =
  localStorage.getItem("catatanku_theme") || "system";

const themes = ["light", "dark", "system"];

function applyTheme() {

  const systemDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDark =
    currentTheme === "dark" ||
    (currentTheme === "system" && systemDark);

  document.body.classList.toggle("dark", isDark);

  themeBtn.textContent =
    currentTheme === "light" ? "☀" :
    currentTheme === "dark" ? "☾" : "◐";

  themeBtn.title = "Tema: " + currentTheme;

  const themeColor = isDark ? "#111318" : "#f8f9fc";

  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", themeColor);
}

// Ganti tema ketika tombol ditekan

themeBtn.addEventListener("click", () => {

  const currentIndex = themes.indexOf(currentTheme);

  currentTheme = themes[
    (currentIndex + 1) % themes.length
  ];

  localStorage.setItem("catatanku_theme", currentTheme);

  applyTheme();
});

// Mengikuti perubahan tema HP

const systemTheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
);

systemTheme.addEventListener("change", () => {

  if (currentTheme === "system") {
    applyTheme();
  }

});

applyTheme();

// =========================================
// 5. MENAMPILKAN CATATAN
// =========================================

function renderNotes() {

  notesContainer.innerHTML = "";

  const keyword = searchInput.value
    .toLowerCase()
    .trim();

  const filteredNotes = notes.filter(note => {

    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)
    );

  });

  noteCount.textContent =
    filteredNotes.length + " catatan";

  // Kondisi catatan kosong

  emptyState.style.display =
    filteredNotes.length === 0 ? "block" : "none";

  if (filteredNotes.length === 0) {

    emptyState.querySelector("h3").textContent =
      keyword
        ? "Catatan tidak ditemukan"
        : "Belum ada catatan";

    emptyState.querySelector("p").textContent =
      keyword
        ? "Coba kata kunci lainnya."
        : "Mulai tulis ide atau sesuatu yang penting.";

  }

  // Menampilkan setiap catatan

  filteredNotes.forEach(note => {

    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title || "Tanpa judul";

    const content = document.createElement("p");
    content.textContent = note.content;

    const date = document.createElement("small");
    date.textContent = note.date || "";

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(date);

    // Membuka catatan untuk diedit

    card.addEventListener("click", () => {
      openEditor(note.id);
    });

    notesContainer.appendChild(card);

  });

}

// =========================================
// 6. MEMBUKA HALAMAN EDITOR
// =========================================

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

// Tampilkan halaman editor
editorOverlay.hidden = false;
editorOverlay.classList.add("active");

// Sembunyikan halaman utama
document.body.classList.add("editor-open");
   
  // Scroll editor ke atas

  editorOverlay.scrollTop = 0;

  // Fokus ke judul

  setTimeout(() => {
    noteTitle.focus();
  }, 100);

}

// =========================================
// 7. KEMBALI KE HALAMAN UTAMA
// =========================================

function closeEditorWindow() {

  // Sembunyikan editor
  editorOverlay.classList.remove("active");
  editorOverlay.hidden = true;

  // Tampilkan kembali halaman utama
  document.body.classList.remove("editor-open");

  editingId = null;

  noteTitle.value = "";
  noteContent.value = "";

}

// Tombol kembali

closeEditor.addEventListener("click", () => {
  closeEditorWindow();
});

// =========================================
// 8. TOMBOL TAMBAH CATATAN
// =========================================

addBtn.addEventListener("click", () => {

  openEditor();

});

// =========================================
// 9. MENYIMPAN CATATAN
// =========================================

saveBtn.addEventListener("click", () => {

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  // Validasi

  if (!title && !content) {

    alert("Isi judul atau konten catatan terlebih dahulu.");

    return;
  }

  // Tanggal

  const now = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Mode edit

  if (editingId !== null) {

    const note = notes.find(
      item => item.id === editingId
    );

    if (!note) return;

    note.title = title;
    note.content = content;
    note.date = now;

  }

  // Mode catatan baru

  else {

    notes.unshift({

      id: Date.now(),

      title: title,

      content: content,

      date: now

    });

  }

  // Simpan data

  if (!saveToStorage()) return;

  // Perbarui halaman utama

  renderNotes();

  // Kembali ke halaman utama

  closeEditorWindow();

});

// =========================================
// 10. MENGHAPUS CATATAN
// =========================================

deleteBtn.addEventListener("click", () => {

  if (editingId === null) return;

  const yakin = confirm(
    "Yakin ingin menghapus catatan ini?"
  );

  if (!yakin) return;

  const previousNotes = notes;

  notes = notes.filter(
    note => note.id !== editingId
  );

  if (!saveToStorage()) {

    notes = previousNotes;

    return;
  }

  renderNotes();

  closeEditorWindow();

});

// =========================================
// 11. PENCARIAN CATATAN
// =========================================

searchInput.addEventListener("input", () => {

  renderNotes();

});

// =========================================
// 12. TOMBOL ESCAPE
// =========================================

document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    editorOverlay.classList.contains("active")
  ) {

    closeEditorWindow();

  }

});

// =========================================
// 13. MENJALANKAN APLIKASI
// =========================================

renderNotes();

console.log("CatatanKu berhasil dijalankan!");


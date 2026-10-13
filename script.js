const STORAGE_KEY = "studentAcademicRecords";
const form = document.getElementById("studentForm");
const recordsBody = document.getElementById("records");
const searchInput = document.getElementById("search");
const summary = document.getElementById("summary");
const message = document.getElementById("message");

let students = loadRecords();

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
function gradeFor(marks) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
}
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(query) || s.roll.toLowerCase().includes(query)
  );
  recordsBody.replaceChildren();
  filtered.forEach(student => {
    const tr = document.createElement("tr");
    [student.name, student.roll, student.course, student.semester, student.subject,
      `${student.marks}/100`, gradeFor(student.marks)].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    const action = document.createElement("td");
    const remove = document.createElement("button");
    remove.className = "delete";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete record for ${student.name}`);
    remove.addEventListener("click", () => {
      students = students.filter(s => s.id !== student.id);
      saveRecords(); render();
    });
    action.appendChild(remove);
    tr.appendChild(action);
    recordsBody.appendChild(tr);
  });
  const average = students.length
    ? (students.reduce((sum, s) => sum + s.marks, 0) / students.length).toFixed(1)
    : "—";
  summary.textContent = `${students.length} record(s) · Average marks: ${average}`;
  if (!filtered.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 8;
    td.textContent = students.length ? "No matching records found." : "No records added yet.";
    tr.appendChild(td); recordsBody.appendChild(tr);
  }
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const course = document.getElementById("course").value.trim();
  const semester = document.getElementById("semester").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const marks = Number(document.getElementById("marks").value);
  if (!name || !roll || !course || !semester || !subject || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    message.textContent = "Please enter valid details and marks between 0 and 100.";
    return;
  }
  if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase() && s.subject.toLowerCase() === subject.toLowerCase() && s.semester === semester)) {
    message.textContent = "A record for this roll number, subject, and semester already exists.";
    return;
  }
  students.push({ id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), name, roll, course, semester, subject, marks });
  saveRecords(); render(); form.reset();
  message.textContent = "Student academic record added successfully.";
});
searchInput.addEventListener("input", render);
document.getElementById("clearAll").addEventListener("click", () => {
  if (students.length && confirm("Delete all academic records from this browser?")) {
    students = []; saveRecords(); render(); message.textContent = "All records cleared.";
  }
});
render();

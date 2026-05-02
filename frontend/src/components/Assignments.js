import { useState, useEffect } from "react";

function Assignments({ users, deptList, subjects, assignments, setAssignments }) {

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");

  // FETCH
  const fetchAssignments = async () => {
    const res = await fetch("https://mid-marks-backend.onrender.com/api/assignments");
    const data = await res.json();
    setAssignments(data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // EDIT
  const handleEdit = (a) => {
    setFaculty(a.facultyId);
    setDepartment(a.department);
    setSemester(a.semester);
    setSection(a.section);
    setSubject(a.subjectId);

    setEditingId(a._id);
    setShowForm(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    await fetch(`https://mid-marks-backend.onrender.com/api/assignments/${id}`, {
      method: "DELETE"
    });

    fetchAssignments();
  };

  const selectedDept = deptList.find(d => d.name === department);

  return (
    <div className="users-container">
      <h2>Assign Subjects to Faculty</h2>

      {!showForm && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Assign Subject
        </button>
      )}

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-popup">

          {/* FACULTY */}
          <select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
            <option value="">Select Faculty</option>
            {users
              .filter((u) => u.role === "faculty")
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
          </select>

          {/* DEPARTMENT */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setSemester("");
              setSection("");
              setSubject("");
            }}
          >
            <option value="">Select Department</option>
            {deptList.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* SEMESTER */}
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">Select Semester</option>
            {selectedDept &&
              Array.from({ length: selectedDept.totalSemesters }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
          </select>

          {/* SECTION */}
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">Select Section</option>
            {selectedDept?.sections?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* SUBJECT */}
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects
              .filter(
                (s) =>
                  s.department === department &&
                  s.semester == semester
              )
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>

          {/* SAVE */}
          <div className="form-actions">
            <button
              className="save-btn"
              onClick={async () => {

                if (!faculty || !department || !semester || !section || !subject) {
                  alert("Fill all fields");
                  return;
                }

                const data = {
                  facultyId: faculty,
                  department,
                  semester,
                  section,
                  subjectId: subject
                };

                try {
                  if (editingId) {
                    await fetch(`https://mid-marks-backend.onrender.com/api/assignments/${editingId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data)
                    });
                    console.log("✅ Updated");
                  } else {
                    await fetch("https://mid-marks-backend.onrender.com/api/assignments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data)
                    });
                    console.log("✅ Created");
                  }

                  fetchAssignments();

                  // RESET
                  setFaculty("");
                  setDepartment("");
                  setSemester("");
                  setSection("");
                  setSubject("");
                  setEditingId(null);
                  setShowForm(false);

                } catch (err) {
                  console.log(err);
                }
              }}
            >
              {editingId ? "Update" : "Assign"}
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <table className="dept-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Faculty</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Section</th>
            <th>Subject</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((a, index) => (
            <tr key={a._id}>
  <td>{index + 1}</td>
  <td>{a.facultyId?.name}</td>
  <td>{a.department}</td>
  <td>{a.semester}</td>
  <td>{a.section}</td>
  <td>{a.subjectId?.name}</td>
  <td>
    <button className="edit-btn" onClick={() => handleEdit(a)}>✏️ Edit</button>
    <button className="delete-btn" onClick={() => handleDelete(a._id)}>🗑 Delete</button>
  </td>
</tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Assignments;
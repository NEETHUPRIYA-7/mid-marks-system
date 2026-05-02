import { useState, useEffect } from "react";

function Subjects({ deptList, subjects, setSubjects }) {

  const [showForm, setShowForm] = useState(false);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [credits, setCredits] = useState("");

  const [editingId, setEditingId] = useState(null);

  const selectedDept = deptList.find(d => d.name === department);

  // FETCH SUBJECTS
  const fetchSubjects = async () => {
    const res = await fetch("https://mid-marks-backend.onrender.com/api/subjects");
    const data = await res.json();
    setSubjects(data);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // DELETE
  const handleDeleteSubject = async (id) => {
  try {
    const res = await fetch(`https://mid-marks-backend.onrender.com/api/subjects/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    console.log("Response:", data);

    if (res.ok) {
      console.log("✅ Subject deleted");

      // remove only that row
      setSubjects(prev => prev.filter(s => s._id !== id));

      // 🔥 SHOW MESSAGE
      alert("Subject deleted successfully ✅");
    } else {
      alert("Delete failed ❌");
    }

  } catch (err) {
    console.log("Error:", err);
    alert("Error deleting subject ❌");
  }
};

  // EDIT
  const handleEditSubject = (sub) => {
    setSubjectName(sub.name || "");
    setSubjectCode(sub.code || "");
    setDepartment(sub.department || "");
    setSemester(sub.semester || "");
    setCredits(sub.credits || "");

    setEditingId(sub._id);
    setShowForm(true);
  };

  return (
    <div className="users-container">
      <h2>Subjects Management</h2>

      {!showForm && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Subject
        </button>
      )}

      {showForm && (
        <div className="form-popup">
          <h3>{editingId ? "Edit Subject" : "Add Subject"}</h3>

          {/* NAME */}
          <input
            type="text"
            placeholder="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />

          {/* CODE */}
          <input
            type="text"
            placeholder="Subject Code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
          />

          {/* DEPARTMENT */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setSemester("");
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
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>

            {selectedDept &&
              Array.from({ length: selectedDept.totalSemesters }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
          </select>

          {/* CREDITS */}
          <input
            type="number"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />

          <div className="form-actions">
            <button
              className="save-btn"
              onClick={async () => {

                const newSubject = {
                  name: subjectName,
                  code: subjectCode,
                  department,
                  semester,
                  credits
                };

                console.log("Sending subject:", newSubject);

                try {
                  if (editingId) {
                    await fetch(`https://mid-marks-backend.onrender.com/api/subjects/${editingId}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(newSubject)
                    });

                    console.log("✅ Subject updated");
                  } else {
                    await fetch("https://mid-marks-backend.onrender.com/api/subjects", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(newSubject)
                    });

                    console.log("✅ Subject created");
                  }

                  fetchSubjects();

                  // CLEAR
                  setSubjectName("");
                  setSubjectCode("");
                  setDepartment("");
                  setSemester("");
                  setCredits("");

                  setEditingId(null);
                  setShowForm(false);

                } catch (err) {
                  console.log("❌ Error:", err);
                }
              }}
            >
              Save
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table className="dept-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((s, index) => (
            <tr key={s._id}>
              <td>{index + 1}</td>
              <td>{s.name}</td>
              <td>{s.code}</td>
              <td>{s.department}</td>
              <td>{s.semester}</td>
              <td>{s.credits}</td>
              <td className="action-buttons">
  <button
    className="edit-btn"
    onClick={() => handleEditSubject(s)}
  >
    ✏️ Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => handleDeleteSubject(s._id)}
  >
    🗑 Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
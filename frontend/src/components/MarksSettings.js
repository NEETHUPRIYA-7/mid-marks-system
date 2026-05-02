import { useState, useEffect } from "react";

function MarksSettings({ deptList }) {
  const [department, setDepartment] = useState("");
  const [midMax, setMidMax] = useState("");
  const [assignmentMax, setAssignmentMax] = useState("");
  const [totalInternalMax, setTotalInternalMax] = useState("");

  const [settings, setSettings] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🔹 Fetch settings
  const fetchSettings = async () => {
  try {
    const res = await fetch("https://mid-marks-backend.onrender.com/api/mark-settings");
    const data = await res.json();

    console.log("Fetched settings:", data);

    // 🔥 FIX HERE
    setSettings(Array.isArray(data) ? data : []);

  } catch (err) {
    console.log("Fetch error:", err);
    setSettings([]); // safety
  }
};

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="users-container">
      <h2>Marks Settings</h2>

      <div className="form-popup">

        {/* DEPARTMENT */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={editingId ? true : false}
        >
          <option value="">Select Department</option>
          {deptList.map((d) => (
            <option key={d._id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        {/* MID */}
        <input
          type="number"
          placeholder="Mid Exam Max Marks"
          value={midMax}
          onChange={(e) => setMidMax(e.target.value)}
        />

        {/* ASSIGNMENT */}
        <input
          type="number"
          placeholder="Assignment Max Marks"
          value={assignmentMax}
          onChange={(e) => setAssignmentMax(e.target.value)}
        />

        {/* TOTAL */}
        <input
          type="number"
          placeholder="Total Internal Marks"
          value={totalInternalMax}
          onChange={(e) => setTotalInternalMax(e.target.value)}
        />

        {/* SAVE / UPDATE */}
        <button
          className="save-btn"
          onClick={async () => {
            if (!department || !midMax || !assignmentMax || !totalInternalMax) {
              alert("Fill all fields");
              return;
            }

            const data = {
              department,
              midMax,
              assignmentMax,
              totalInternalMax
            };

            try {
              if (editingId) {
                // ✏️ UPDATE
                await fetch(`https://mid-marks-backend.onrender.com/api/mark-settings/${editingId}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                });

                console.log("✅ Updated");
              } else {
                // ➕ CREATE
                await fetch("https://mid-marks-backend.onrender.com/api/mark-settings", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                });

                console.log("✅ Created");
              }

              // 🔥 VERY IMPORTANT FIX
              await fetchSettings();

              // CLEAR FORM
              setDepartment("");
              setMidMax("");
              setAssignmentMax("");
              setTotalInternalMax("");
              setEditingId(null);

            } catch (err) {
              console.log(err);
            }
          }}
        >
          {editingId ? "Update Settings" : "Save Settings"}
        </button>
      </div>

      {/* TABLE */}
      <table className="dept-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Mid</th>
            <th>Assignment</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {settings.length === 0 ? (
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          ) : (
            settings.map((s) => (
              <tr key={s._id}>
                <td>{s.department}</td>
                <td>{s.midMax}</td>
                <td>{s.assignmentMax}</td>
                <td>{s.totalInternalMax}</td>

                <td>
                  {/* EDIT */}
                  <button
                    style={{
                      background: "orange",
                      color: "white",
                      marginRight: "5px",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setDepartment(s.department);
                      setMidMax(s.midMax);
                      setAssignmentMax(s.assignmentMax);
                      setTotalInternalMax(s.totalInternalMax);
                      setEditingId(s._id);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  {/* DELETE */}
                  <button
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                    onClick={async () => {
                      await fetch(`https://mid-marks-backend.onrender.com/api/mark-settings/${s._id}`, {
                        method: "DELETE"
                      });

                      // 🔥 ALSO FIX HERE
                      await fetchSettings();
                    }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MarksSettings;
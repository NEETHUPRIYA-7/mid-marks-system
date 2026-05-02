import { useState } from "react";

function Marks({
  deptList,
  users,
  subjects,
  marks,
  setMarks,
  markLimits
}) {
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [showStudents, setShowStudents] = useState(false);

  // 🔍 FILTER STUDENTS
  const students =
    users?.filter(
      (u) =>
        u.role === "student" &&
        u.department === department &&
        u.section === section
    ) || [];

  // 🔍 GET CURRENT LIMIT
  const currentLimit = markLimits.find(
    (m) =>
      m.department === department &&
      String(m.semester) === String(semester) &&
      m.subject === subject
  );

  // 🔒 CHECK LOCK
  const isLocked = marks.some(
    (m) =>
      m.department === department &&
      m.section === section &&
      m.subject === subject &&
      m.status === "locked"
  );

  // ✏️ HANDLE MARK CHANGE
  const handleChange = (id, field, value) => {
    let num = Number(value);

    // VALIDATION
    if (field.includes("mid") && num > (currentLimit?.midMax || 25)) {
      alert("Exceeded Mid Marks Limit");
      return;
    }

    if (field === "assignment" && num > (currentLimit?.assignmentMax || 5)) {
      alert("Exceeded Assignment Limit");
      return;
    }

    const updated = [...marks];

    const index = updated.findIndex(
      (m) =>
        m.studentId === id &&
        m.subject === subject &&
        m.section === section
    );

    if (index !== -1) {
      updated[index][field] = num;
    } else {
      updated.push({
        studentId: id,
        department,
        semester,
        section,
        subject,
        mid1: 0,
        mid2: 0,
        assignment: 0,
        status: "draft"
      });
      updated[updated.length - 1][field] = num;
    }

    setMarks(updated);
  };

  // 🧮 CALCULATION
  const calculateTotal = (m) => {
    const mid1 = Number(m.mid1 || 0);
    const mid2 = Number(m.mid2 || 0);

    const best = Math.max(mid1, mid2);
    const second = Math.min(mid1, mid2);

    const weighted = best * 0.8 + second * 0.2;

    return Math.round(weighted + Number(m.assignment || 0));
  };

  // 📤 SUBMIT
  const handleSubmit = () => {
    const updated = marks.map((m) =>
      m.department === department &&
      m.section === section &&
      m.subject === subject
        ? { ...m, status: "submitted" }
        : m
    );

    setMarks(updated);
  };

  // 🟣 VERIFY
  const handleVerify = () => {
    const updated = marks.map((m) =>
      m.department === department &&
      m.section === section &&
      m.subject === subject &&
      m.status === "submitted"
        ? { ...m, status: "verified" }
        : m
    );

    setMarks(updated);
  };

  // 🟢 APPROVE
  const handleApprove = () => {
    const updated = marks.map((m) =>
      m.department === department &&
      m.section === section &&
      m.subject === subject &&
      m.status === "verified"
        ? { ...m, status: "approved" }
        : m
    );

    setMarks(updated);
  };

  // 🔒 LOCK
  const handleLock = () => {
    const updated = marks.map((m) =>
      m.department === department &&
      m.section === section &&
      m.subject === subject &&
      m.status === "approved"
        ? { ...m, status: "locked" }
        : m
    );

    setMarks(updated);
  };

  return (
    <div className="users-container">
      <h2>Marks Entry</h2>

      {/* FILTER */}
      <div className="form-popup">
        <select onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Department</option>
          {deptList?.map((d) => (
            <option key={d.name}>{d.name}</option>
          ))}
        </select>

        <select onChange={(e) => setSemester(e.target.value)}>
          <option value="">Semester</option>
          {[1,2,3,4,5,6,7,8].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select onChange={(e) => setSection(e.target.value)}>
          <option value="">Section</option>
          {deptList
            ?.find((d) => d.name === department)
            ?.sections?.map((s) => (
              <option key={s}>{s}</option>
            ))}
        </select>

        <select onChange={(e) => setSubject(e.target.value)}>
          <option value="">Subject</option>
          {subjects
            ?.filter(
              (s) =>
                s.department === department &&
                String(s.semester) === String(semester)
            )
            .map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
        </select>

        <button onClick={() => setShowStudents(true)}>
          Load Students
        </button>
      </div>

      {/* TABLE */}
      {showStudents && (
        <>
          <table className="dept-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mid1</th>
                <th>Mid2</th>
                <th>Assignment</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => {
                const m =
                  marks.find(
                    (x) =>
                      x.studentId === s.id &&
                      x.subject === subject &&
                      x.section === section
                  ) || {};

                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>

                    <td>
                      <input
                        type="number"
                        value={m.mid1 || ""}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleChange(s.id, "mid1", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={m.mid2 || ""}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleChange(s.id, "mid2", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={m.assignment || ""}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleChange(s.id, "assignment", e.target.value)
                        }
                      />
                    </td>

                    <td>{calculateTotal(m)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ACTION BUTTONS */}
          <div className="form-actions">
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={handleVerify}>Verify</button>
            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleLock}>🔒 Lock Section</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Marks;
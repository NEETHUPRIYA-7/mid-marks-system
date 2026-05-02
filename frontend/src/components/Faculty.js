 import "./Faculty.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function Faculty() {
  const navigate = useNavigate();

  const [active, setActive] = useState("dashboard");
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState("");
const [marks, setMarks] = useState([]);
const [students, setStudents] = useState([]);

const [selectedSubject, setSelectedSubject] = useState("");
const parsed = selected ? JSON.parse(selected) : null;
  const user = JSON.parse(localStorage.getItem("user"));
  const [reportClass, setReportClass] = useState("");
const [reportType, setReportType] = useState("");
const [limits, setLimits] = useState({});

const [reportSubject, setReportSubject] = useState("");

const [reportMarks, setReportMarks] = useState([]);
const reportData = reportMarks;

const classReport = {};

reportData.forEach(m => {
  if (!classReport[m.name]) {
    classReport[m.name] = { name: m.name, subjects: {}, total: 0 };
  }

  classReport[m.name].subjects[m.subject] = m.total;
  classReport[m.name].total += m.total;
});

const finalClassReport = Object.values(classReport);

// get all subjects dynamically
const allSubjects = [...new Set(reportData.map(m => m.subject))];

useEffect(() => {
  if (!reportClass) return;

  const parsed = JSON.parse(reportClass);

  let url = `https://mid-marks-backend.onrender.com/api/marks?department=${parsed.dept}&semester=${parsed.sem}&section=${parsed.sec}&status=approved`;

  if (reportSubject) {
    url += `&subject=${reportSubject}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("REPORT DATA:", data);
      setReportMarks(data);
    });
}, [reportClass, reportSubject]);
const downloadPDF = () => {
  const doc = new jsPDF();

  doc.text("Faculty Report", 14, 10);

  // table data
  const tableData = students.map((s, i) => [
    s.name,
    marks[i]?.mid1 || 0,
    marks[i]?.mid2 || 0,
    marks[i]?.a1 || 0,
    marks[i]?.a2 || 0,
    (
      Math.max(
        (marks[i]?.mid1 || 0) + (marks[i]?.a1 || 0),
        (marks[i]?.mid2 || 0) + (marks[i]?.a2 || 0)
      ) * 0.8 +
      Math.min(
        (marks[i]?.mid1 || 0) + (marks[i]?.a1 || 0),
        (marks[i]?.mid2 || 0) + (marks[i]?.a2 || 0)
      ) * 0.2
    ).toFixed(2)
  ]);

  autoTable(doc, {
    head: [["Name", "Mid1", "Mid2", "A1", "A2", "Total"]],
    body: tableData
  });

  doc.save("faculty_report.pdf");
};

const prepareMarks = (status) => {
  return students
    .map((student, index) => ({ student, index }))
    
    // ✅ Only allow rejected + draft
    .filter(({ index }) => {
  const currentStatus = marks[index]?.status;

  return currentStatus !== "submitted" && currentStatus !== "approved";
})

    .map(({ student, index }) => {
      const mid1 = Number(marks[index]?.mid1 || 0);
      const mid2 = Number(marks[index]?.mid2 || 0);
      const a1 = Number(marks[index]?.a1 || 0);
      const a2 = Number(marks[index]?.a2 || 0);

      const total1 = mid1 + a1;
      const total2 = mid2 + a2;

      const best = Math.max(total1, total2);
      const worst = Math.min(total1, total2);

      const total = (best * 0.8) + (worst * 0.2);

      return {
        studentId: student._id,
        name: student.name,
        department: student.department,
        semester: student.semester,
        section: student.section,
        subject: selectedSubject,
        faculty: user.name,
        facultyId: user._id,
        mid1,
        mid2,
        assignment1: a1,
        assignment2: a2,
        total,
        status
      };
    });
};

const fetchSavedMarks = () => {
  if (!selected) return;

  const parsed = JSON.parse(selected);

  fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${parsed.dept}&semester=${parsed.sem}&section=${parsed.sec}`)
    .then(res => res.json())
    .then(data => {
      console.log("Saved Marks:", data);

      const formatted = students.map((s) => {
        const found = data.find(
          m =>
            String(m.studentId) === String(s._id) &&
            m.subject?.trim() === selectedSubject?.trim()
        );

        return {
          mid1: found?.mid1 || "",
          mid2: found?.mid2 || "",
          a1: found?.assignment1 || "",
          a2: found?.assignment2 || "",
          status: found?.status || "draft",
          reason: found?.reason || ""
        };
      });

      setMarks(formatted);
    });
};
const handleSaveDraft = async () => {
  if (!selectedSubject) {
  alert("Please select subject");
  return;
}
  const data = prepareMarks("draft");

  await fetch("https://mid-marks-backend.onrender.com/api/marks/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  alert("Draft saved ✅");
  
fetchSavedMarks(); // 🔥 ADD THIS
};

const handleSubmit = async () => {
  if (!selectedSubject) {
  alert("Please select subject");
  return;
}
  const data = prepareMarks("submitted");
  if (data.length === 0) {
  alert("No changes to submit");
  return;
}

  await fetch("https://mid-marks-backend.onrender.com/api/marks/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
fetchSavedMarks(); // 🔥 ADD THIS

  alert("Submitted to HOD ✅");
};
  
  const handleChange = (e, index, field) => {
  let value = Number(e.target.value);

  // ✅ MID LIMIT
  if (field === "mid1" || field === "mid2") {
    if (limits?.midMax && value > limits.midMax) {
      value = limits.midMax;
    }
  }

  // ✅ ASSIGNMENT LIMIT
  if (field === "a1" || field === "a2") {
    if (limits?.assignmentMax && value > limits.assignmentMax) {
      value = limits.assignmentMax;
    }
  }

  const updated = [...marks];

  updated[index] = {
    ...(updated[index] || {}),
    [field]: value
  };

  setMarks(updated);
};

  
// 🔥 REPORT CALCULATIONS
// ✅ use backend data (approved marks)


// ✅ average
const classAvg =
  reportData.length > 0
    ? (
        reportData.reduce((sum, s) => sum + s.total, 0) /
        reportData.length
      ).toFixed(2)
    : 0;

// ✅ pass / fail (based on final internal)
const passCount = reportData.filter(m => m.total >= 15).length;
const failCount = reportData.filter(m => m.total < 15).length;

// ✅ topper
const maxMarks = Math.max(...reportData.map(s => s.total), 0);
const toppers = reportData.filter(s => s.total === maxMarks);


useEffect(() => {
  if (!parsed) return;

  const filtered = assignments.filter(
    (a) =>
      a.department === parsed.dept &&
      a.semester === parsed.sem &&
      a.section === parsed.sec
  );

  if (filtered.length === 1) {
    setSelectedSubject(filtered[0].subject);
  }
}, [selected, assignments]);

  
useEffect(() => {
  if (!selected || !selectedSubject) return;
     setMarks([]); // reset marks when class or subject changes
  const parsed = JSON.parse(selected);
  // 🔥 FETCH MARK LIMITS

  const { dept, sem, sec } = parsed;
console.log("FETCHING STUDENTS:", dept, sem, sec);
  // ✅ 1. Fetch students
  fetch(`https://mid-marks-backend.onrender.com/api/students?department=${dept}&semester=${sem}&section=${sec}`)
    .then(res => res.json())
    .then(studentData => {
      setStudents(studentData);

      // ✅ 2. Fetch marks for selected subject
      fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${dept}&semester=${sem}&section=${sec}&subject=${selectedSubject}`)
        .then(res => res.json())
        .then(markData => {

          const formatted = studentData.map((s) => {
            const found = markData.find(
              m => m.studentId === s._id && m.subject === selectedSubject
            );

            return {
              mid1: found?.mid1 || "",
              mid2: found?.mid2 || "",
              a1: found?.assignment1 || "",
              a2: found?.assignment2 || "",
              status: found?.status || "draft",
              reason: found?.reason || ""
            };
          });

          setMarks(formatted);
        });
    });

}, [selected, selectedSubject]);

useEffect(() => {
  if (!selected) return;

  const parsed = JSON.parse(selected);

  fetch("https://mid-marks-backend.onrender.com/api/mark-settings")
    .then(res => res.json())
    .then(data => {
      console.log("ALL LIMITS:", data);

      const deptLimit = data.find(
        d => d.department === parsed.dept
      );

      setLimits(deptLimit || {});
    });
}, [selected]);

  // FETCH ASSIGNMENTS
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  fetch("https://mid-marks-backend.onrender.com/api/assignments")
    .then(res => res.json())
    .then(data => {
      console.log("ALL DATA:", data); // 👈 check this in console

      // 👉 filter only this faculty data
      const myData = data.filter(
        (a) => a.facultyId?._id === user._id
      );

      console.log("MY DATA:", myData); // 👈 check this

      setAssignments(myData);
    })
    .catch(err => console.log(err));
}, []);
const uniqueClasses = [
  ...new Map(
    assignments.map(a => [
      `${a.department}-${a.semester}-${a.section}`,
      a
    ])
  ).values()
];

  // COUNTS
  const subjectCount = [...new Set(assignments.map((a) => a.subject))].length;
  const classCount = [...new Set(assignments.map((a) => a.department))].length;
  const sectionCount = [...new Set(assignments.map((a) => a.section))].length;

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  console.log("Assignments:", assignments);
console.log("Selected:", selected);



  return (
    <div className="faculty-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>👨‍🏫 Faculty</h2>

        <p onClick={() => setActive("dashboard")}>🏠 Dashboard</p>
        <p onClick={() => setActive("marks")}>📝 Enter Marks</p>
        <p onClick={() => setActive("reports")}>📊 Reports</p>
        <p onClick={() => setActive("password")}>🔒 Change Password</p>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <h2>FACULTY PANEL</h2>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <>
            <h2>👋 Welcome, {user?.name || "Faculty"}</h2>

            <div className="cards">
              <div className="card blue">
                📚 Subjects
                <h2>{subjectCount}</h2>
              </div>

              <div className="card green">
                🏫 Classes
                <h2>{classCount}</h2>
              </div>

             
            </div>
          </>
        )}

        {/* ENTER MARKS */}
        {active === "marks" && (
          <>
            <h2>Enter Marks</h2>

            <select onChange={(e) => setSelected(e.target.value)}>
  <option>Select Class</option>

  {uniqueClasses.map((a, i) => (
    <option key={i} value={JSON.stringify({
      dept: a.department,
      sem: a.semester,
      sec: a.section
    })}>
      {a.department} - {a.semester} - {a.section}
    </option>
  ))}
</select>

{/* 🔥 ADD THIS BLOCK BELOW */}
{selected && (
  <select
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)}
  >
    <option value="">Select Subject</option>

    {[...new Set(
  assignments
    .filter(a =>
      parsed &&
      a.department === parsed.dept &&
      a.semester === parsed.sem &&
      a.section === parsed.sec
    )
    .map(a => a.subjectId?.name)
)].map((sub, i) => (
  <option key={i} value={sub}>
    {sub}
  </option>
))}
  </select>
)}

            {selected && (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mid1</th>
                    <th>Mid2</th>
                    <th>A1</th>
                    <th>A2</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
  {Array.isArray(students) &&
    students.map((student, index) => (
    <tr key={index}>
      <td>{student.name}</td>

    <td>
  <input
    type="number"
    value={marks[index]?.mid1 || ""}
    onChange={(e) => handleChange(e, index, "mid1")}
    disabled={
  marks[index]?.status === "submitted" ||
  marks[index]?.status === "approved"
}
  />
</td>

<td>
  <input
    type="number"
    value={marks[index]?.mid2 || ""}
    onChange={(e) => handleChange(e, index, "mid2")}
    disabled={
  marks[index]?.status === "submitted" ||
  marks[index]?.status === "approved"
}
  />
</td>

    <td>
  <input
    type="number"
    value={marks[index]?.a1 || ""}
    onChange={(e) => handleChange(e, index, "a1")}
    disabled={
  marks[index]?.status === "submitted" ||
  marks[index]?.status === "approved"
}
  />
</td>

<td>
  <input
    type="number"
    value={marks[index]?.a2 || ""}
    onChange={(e) => handleChange(e, index, "a2")}
    disabled={
  marks[index]?.status === "submitted" ||
  marks[index]?.status === "approved"
}
  />
</td>
     <td>
  {(() => {
    const mid1 = Number(marks[index]?.mid1 || 0) + Number(marks[index]?.a1 || 0);
    const mid2 = Number(marks[index]?.mid2 || 0) + Number(marks[index]?.a2 || 0);

    const best = Math.max(mid1, mid2);
    const worst = Math.min(mid1, mid2);

    const total = (best * 0.8) + (worst * 0.2);

    return total.toFixed(2);
  })()}
</td>

<td>
  {marks[index]?.status === "submitted" && "🟡 Locked (Sent to HOD)"}

  {marks[index]?.status === "approved" && "🟢 Approved (Final)"}

  {marks[index]?.status === "rejected" && (
    <div style={{ color: "red" }}>
      🔴 Rejected <br />
      <small>{marks[index]?.reason}</small>
    </div>
  )}

  {!marks[index]?.status && "✏️ Draft"}
</td>
      
    </tr>
  ))}
</tbody>
              </table>
            )}

            <div className="btns">
  <button className="save-btn" onClick={handleSaveDraft}>
    Save Draft
  </button>

  <button className="submit-btn" onClick={handleSubmit}>
    Submit
  </button>
</div>
          </>
        )}

          {/* REPORTS */}
     {active === "reports" && (
  <div>
    <h2>📊 Reports</h2>

    <button onClick={downloadPDF} className="download-btn">
      Download PDF
    </button>

    {/* CLASS SELECT */}
    <div style={{ margin: "15px 0" }}>
      <select onChange={(e) => setReportClass(e.target.value)}>
        <option>Select Class</option>
        {uniqueClasses.map((c, i) => (
          <option
            key={i}
            value={JSON.stringify({
              dept: c.department,
              sem: c.semester,
              sec: c.section
            })}
          >
            {c.department}-{c.semester}-{c.section}
          </option>
        ))}
      </select>

      {/* REPORT TYPE */}
      <select
        onChange={(e) => {
          setReportType(e.target.value);
          setReportSubject(""); // reset
        }}
        style={{ marginLeft: "10px" }}
      >
        <option value="">Select Report Type</option>
        <option value="subject">Subject Wise</option>
        <option value="class">Class Wise</option>
      </select>

      {/* SUBJECT ONLY FOR SUBJECT-WISE */}
      {reportClass && reportType === "subject" && (
        <select
          value={reportSubject}
          onChange={(e) => setReportSubject(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">Select Subject</option>

          {[...new Set(
            assignments
              .filter(a => {
                const parsed = JSON.parse(reportClass);
                return (
                  a.department === parsed.dept &&
                  a.semester === parsed.sem &&
                  a.section === parsed.sec
                );
              })
              .map(a => a.subjectId?.name)
          )].map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      )}
    </div>

    {!reportClass && <p>Select class first</p>}
    {reportClass && !reportType && <p>Select report type</p>}

    {/* ================= SUBJECT-WISE ================= */}
    {reportClass && reportType === "subject" && reportSubject && (
      <>
        <h3>Subject-wise Report</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((m, i) => (
              <tr key={i}>
                <td>{m.name}</td>
                <td>{m.total.toFixed(2)}</td>
                <td>{m.total >= 15 ? "✅ Pass" : "❌ Fail"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {/* ================= CLASS-WISE ================= */}
    {reportClass && reportType === "class" && (
      <>
        <h3>Class-wise Report</h3>

       <table>
  <thead>
    <tr>
      <th>Name</th>

      {allSubjects.map((sub, i) => (
        <th key={i}>{sub}</th>
      ))}

      <th>Total</th>
    </tr>
  </thead>

  <tbody>
    {finalClassReport.map((student, i) => (
      <tr key={i}>
        <td>{student.name}</td>

        {allSubjects.map((sub, j) => (
          <td key={j}>
            {student.subjects[sub] || "-"}
          </td>
        ))}

        <td>{student.total.toFixed(2)}</td>
      </tr>
    ))}
  </tbody>
</table> 
      </>
    )}
  </div>
)}
        {/* CHANGE PASSWORD */}
        {active === "password" && (
          <ChangePassword currentUser={user} />
        )}

      </div>
    </div>
  );
}

export default Faculty;
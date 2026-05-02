import "./Hod.css";
import { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ChangePassword from "./ChangePassword";
function Hod() {
  const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user"));
  const dept = localStorage.getItem("dept");
const [marksData, setMarksData] = useState([]);
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState({
  students: 0,
  faculty: 0,
  subjects: 0,
  pending: 0
});
const [classes, setClasses] = useState([]);
const [reportData, setReportData] = useState([]);

const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${dept} Department Report`, 14, 15);

  doc.setFontSize(12);
  doc.text(`Total Students: ${totalStudents}`, 14, 30);
  doc.text(`Average Marks: ${avgMarks}`, 14, 38);
  doc.text(`Pass Count: ${passCount}`, 14, 46);
  doc.text(`Fail Count: ${failCount}`, 14, 54);

  // Table data
  const tableData = toppersByClass.map(c => [
    c.class,
    c.toppers.map(t => t.name).join(", "),
    c.toppers[0].total
  ]);

  autoTable(doc, {
  head: [["Class", "Topper(s)", "Marks"]],
  body: tableData,
  startY: 65,
});

  doc.save(`${dept}_report.pdf`);
};
useEffect(() => {
  fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${dept}&status=approved`)
    .then(res => res.json())
    .then(data => {
      console.log("REPORT DATA:", data);
      setReportData(data);
    });
}, [dept]);

// ✅ GROUP BY STUDENT (VERY IMPORTANT)
const studentTotals = {};

reportData.forEach(m => {
  if (!studentTotals[m.studentId]) {
    studentTotals[m.studentId] = {
      name: m.name,
      total: 0,
      department: m.department,
      semester: m.semester,
      section: m.section
    };
  }

  studentTotals[m.studentId].total += m.total;
});

const finalReport = Object.values(studentTotals);

const totalStudents = finalReport.length;

const avgMarks =
  finalReport.length > 0
    ? (
        finalReport.reduce((sum, s) => sum + s.total, 0) /
        finalReport.length
      ).toFixed(2)
    : 0;

const toppersByClass = Object.entries(
  finalReport.reduce((acc, s) => {
    const key = `${s.department}-${s.semester}-${s.section}`;

    if (!acc[key]) acc[key] = [];

    acc[key].push(s);

    return acc;
  }, {})
).map(([key, students]) => {
  const maxMarks = Math.max(...students.map(s => s.total));

  const toppers = students.filter(s => s.total === maxMarks);

  return {
    class: key,
    toppers
  };
});

const studentStatus = {};

reportData.forEach(m => {
  if (!studentStatus[m.studentId]) {
    studentStatus[m.studentId] = {
      name: m.name,
      isFail: false
    };
  }

  // ❗ SUBJECT FAIL CONDITION
  if (m.total < 15) {
    studentStatus[m.studentId].isFail = true;
  }
});

const passCount = Object.values(studentStatus).filter(s => !s.isFail).length;
const failCount = Object.values(studentStatus).filter(s => s.isFail).length;
useEffect(() => {
  fetch("https://mid-marks-backend.onrender.com/api/users")
    .then(res => res.json())
    .then(data => {
      // ✅ only students
      const studentsOnly = data.filter(u => u.role === "student");

      // ✅ filter by department
      const deptStudents = studentsOnly.filter(
        s => s.department === dept
      );

      // ✅ group + count
      const grouped = {};

      deptStudents.forEach(s => {
        const key = `${s.department}-${s.semester}-${s.section}`;

        if (!grouped[key]) {
          grouped[key] = {
            department: s.department,
            semester: s.semester,
            section: s.section,
            count: 0
          };
        }

        grouped[key].count += 1;
      });

      // ✅ final data
      setClasses(Object.values(grouped));
    })
    .catch(err => console.log(err));
}, [dept]);
useEffect(() => {
  const fetchStats = async () => {
    try {
      // 👇 users
      const usersRes = await fetch("https://mid-marks-backend.onrender.com/api/users");
      const users = await usersRes.json();

      // 👇 marks
      const marksRes = await fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${dept}`);
      const marks = await marksRes.json();

      // 👇 subjects
      const subRes = await fetch("https://mid-marks-backend.onrender.com/api/subjects");
      const subjects = await subRes.json();

      // FILTER LOGIC
      const studentCount = users.filter(
        u => u.role === "student" && u.department === dept
      ).length;

      const facultyCount = users.filter(
        u => u.role === "faculty" && u.department === dept
      ).length;

      const subjectCount = subjects.filter(
        s => s.department === dept
      ).length;

      const pendingCount = marks.filter(
        m => m.status === "submitted" && m.department === dept
      ).length;

      setStats({
        students: studentCount,
        faculty: facultyCount,
        subjects: subjectCount,
        pending: pendingCount
      });

    } catch (err) {
      console.log(err);
    }
  };

  fetchStats();
}, [dept]);

  useEffect(() => {
  fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${dept}&status=submitted`)
    .then(res => res.json())
    .then(data => {
      console.log("HOD DATA:", data);
      setMarksData(data);
    });
}, [dept]);

const [approvedData, setApprovedData] = useState([]);

useEffect(() => {
  fetch(`https://mid-marks-backend.onrender.com/api/marks?department=${dept}&status=approved`)
    .then(res => res.json())
    .then(data => {
      setApprovedData(data);
    });
}, [dept]);

  if (!dept) {
    return <h2 style={{ padding: "20px" }}>Unauthorized Access</h2>;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  const handleApprove = async (mark) => {
  await fetch("https://mid-marks-backend.onrender.com/api/marks/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mark)
  });

  // remove approved item from UI
  setMarksData(prev => prev.filter(
    m => !(m.studentId === mark.studentId && m.subject === mark.subject)
  ));

  alert("Approved ✅");
};

const handleReject = async (mark) => {
  const reason = prompt("Enter reason for rejection:");

  if (!reason) {
    alert("Reason is required");
    return;
  }

  await fetch("https://mid-marks-backend.onrender.com/api/marks/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...mark,
      status: "rejected",
      reason: reason
    })
  });

  // remove from UI
  setMarksData(prev =>
    prev.filter(
      m =>
        !(m.studentId === mark.studentId &&
          m.subject === mark.subject)
    )
  );

  alert("Rejected with reason ❌");
};
  return (
    <div className="hod">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🏫 HOD ({dept})</h2>

        <ul>
          <li onClick={() => setActive("dashboard")}>📊 Dashboard</li>
          <li onClick={() => setActive("classes")}>🏫 Classes</li>
          <li onClick={() => setActive("marks")}>📈 Marks Review</li>
          <li onClick={() => setActive("reports")}>📋 Reports</li>
          <li onClick={() => setActive("approved")}>✅ Approved Marks</li>
          <li onClick={() => setActive("password")}>🔑 Change Password</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="navbar">
          <h2>{active.toUpperCase()}</h2>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* DASHBOARD */}
      {active === "dashboard" && (
  <div className="cards">
    <div className="card">
      👨‍🎓 Students
      <h2>{stats.students}</h2>
    </div>

    <div className="card">
      👨‍🏫 Faculty
      <h2>{stats.faculty}</h2>
    </div>

    <div className="card">
      📚 Subjects
      <h2>{stats.subjects}</h2>
    </div>

    <div className="card">
      ⏳ Pending
      <h2>{stats.pending}</h2>
    </div>
  </div>
)}

        {/* CLASSES */}
        {active === "classes" && (
  <div>
    <h3>{dept} Classes</h3>

    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th>Semester</th>
          <th>Section</th>
          <th>Students Count</th>
        </tr>
      </thead>

      <tbody>
        {classes.map((c, i) => {
          const count = classes.filter(
            s =>
              s.department === c.department &&
              s.semester === c.semester &&
              s.section === c.section
          ).length;

          return (
            <tr key={i}>
              <td>{c.department}</td>
              <td>{c.semester}</td>
              <td>{c.section}</td>
              <td>{c.count}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

        {/* MARKS REVIEW */}
       {active === "marks" && (
  <div>
    <h3>Marks Submitted by Faculty</h3>

    {marksData.length === 0 ? (
      <p>No submitted marks</p>
    ) : (
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th> {/* 👈 ADD THIS */}
          </tr>
        </thead>

        <tbody>
          {marksData.map((m, i) => (
            
            // 👇 THIS IS WHERE YOUR CODE GOES
            <tr key={i}>
              <td>{m.name}</td>
              <td>{m.subject}</td>
              <td>{m.faculty}</td>
              <td>{m.total}</td>
              <td>{m.status}</td>

              <td>
                <button onClick={() => handleApprove(m)}>
                  Approve
                </button>

                <button onClick={() => handleReject(m)}>
                  Reject
                </button>
              </td>
            </tr>

          ))}
        </tbody>
      </table>
    )}
  </div>
)}

        {/* REPORTS */}
      {active === "reports" && (
  <div>
    <h3>{dept} Reports</h3>
    <button onClick={downloadPDF} className="download-btn">
  Download PDF
</button>

    {/* SUMMARY CARDS */}
    <div className="cards">
      <div className="card blue">
        🎓 Students
        <h2>{totalStudents}</h2>
      </div>

      <div className="card green">
        📊 Avg Marks
        <h2>{avgMarks}</h2>
      </div>
      <div className="card green">
  ✅ Pass
  <h2>{passCount}</h2>
</div>

      <div className="card red">
        ❌ Fail
        <h2>{failCount}</h2>
      </div>
    </div>

    {/* CLASS-WISE TOPPERS */}
    <h3 style={{ marginTop: "20px" }}>🏆 Class Toppers</h3>

    <table>
      <thead>
        <tr>
          <th>Class</th>
          <th>Topper</th>
          <th>Marks</th>
        </tr>
      </thead>

      <tbody>
  {toppersByClass.map((c, i) => (
    <tr key={i}>
      <td>{c.class}</td>
      <td>{c.toppers.map(t => t.name).join(", ")}</td>
      <td>{c.toppers[0].total}</td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}

        {/* APPROVED MARKS */}
        {active === "approved" && (
  <div>
    <h3>Approved Marks</h3>

    {approvedData.length === 0 ? (
      <p>No approved marks</p>
    ) : (
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {approvedData.map((m, i) => (
            <tr key={i}>
              <td>{m.name}</td>
              <td>{m.subject}</td>
              <td>{m.faculty}</td>
              <td>{m.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default Hod;
import "./Student.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChangePassword from "./ChangePassword";

function Student() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [marks, setMarks] = useState([]);
  const [active, setActive] = useState("dashboard");

  // FETCH STUDENT MARKS
  useEffect(() => {
    if (!user || user.role !== "student") return;

    fetch(`http://localhost:3000/api/marks?studentId=${user._id}&semester=${user.semester}&status=approved`)
      .then((res) => res.json())
      .then((data) => {
        setMarks(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log(err));
  }, [user]);

  // UNAUTHORIZED
  if (!user || user.role !== "student") {
    return <h2 className="unauthorized">Unauthorized Access</h2>;
  }

  // SUBJECT-WISE GROUPING
  const subjectMap = {};

marks.forEach((m) => {
  // pick only APPROVED marks
  if (m.status !== "approved") return;

  // take latest entry (based on updatedAt)
  if (
    !subjectMap[m.subject] ||
    new Date(m.updatedAt) > new Date(subjectMap[m.subject].updatedAt)
  ) {
    subjectMap[m.subject] = m;
  }
});

const finalMarks = Object.values(subjectMap);

  // TOTAL & AVERAGE
  const total = finalMarks.reduce((sum, m) => sum + m.total, 0);
  

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="student-container">

      {/* NAVBAR */}
      <div className="student-header">
        <h2>🎓 Student Dashboard</h2>

        <div>
          <button onClick={() => setActive("dashboard")}>Dashboard</button>
          <button onClick={() => setActive("password")}>Change Password</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* DASHBOARD */}
      {active === "dashboard" && (
        <>
          {/* INFO */}
          <div className="student-card">
            <h3>Name: {user.name}</h3>
            <p>Department: {user.department}</p>
            <p>Semester: {user.semester ||"-"}</p>
            <p>Section: {user.section||"-"}</p>
          </div>

          {/* MARKS */}
          <div className="student-card">
            <h3>📊 Mid Marks</h3>

            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {finalMarks.length === 0 ? (
                  <tr>
                    <td colSpan="3">No marks available</td>
                  </tr>
                ) : (
                  finalMarks.map((m, i) => (
                    <tr key={i}>
                      <td>{m.subject}</td>
                      <td>{m.total.toFixed(2)}</td>
                      <td>
                        {m.total >= 15 ? "Pass" : "Fail"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* REPORT */}
          <div className="student-card">
            <h3>📄 Report</h3>

            <p><b>Total Marks:</b> {total.toFixed(2)}</p>
            

            <button
              className="download-btn"
              onClick={() => window.print()}
            >
              Download Report
            </button>
          </div>
        </>
      )}

      {/* CHANGE PASSWORD */}
      {active === "password" && (
        <ChangePassword currentUser={user} />
      )}

    </div>
  );
}

export default Student;
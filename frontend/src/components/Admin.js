import "./Admin.css";
import Subjects from "./Subjects";
import Assignments from "./Assignments";
import Marks from "./Marks";
import MarksSettings from "./MarksSettings";
import ChangePassword from "./ChangePassword";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Admin() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [password, setPassword] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
const [showPassword, setShowPassword] = useState(false);
const [showDeptForm, setShowDeptForm] = useState(false);
const [deptName, setDeptName] = useState("");
const [hodName, setHodName] = useState("");
const [role, setRole] = useState("");
const [department, setDepartment] = useState("");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [departments, setDepartments] = useState([]);
const [type, setType] = useState("");
const [sectionData, setSectionData] = useState({});
const [sectionsInput, setSectionsInput] = useState("");
const [departmentData, setDepartmentData] = useState([]);
const [semester, setSemester] = useState("");
const [totalSem, setTotalSem] = useState("");
const [assignments, setAssignments] = useState([]);
const [editingDeptId, setEditingDeptId] = useState(null);
const loggedInUser = JSON.parse(localStorage.getItem("user"));
  // SHOW USER FORM
  const [showForm, setShowForm] = useState(false);
const [deptType, setDeptType] = useState("");
  // MARKS STATES
  const [dept, setDept] = useState("");
  const [section, setSection] = useState("");
  const [showMarks, setShowMarks] = useState(false);
  const [users, setUsers] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [subjects, setSubjects]=useState([]);
  const [marks, setMarks] = useState([]);

  const [reportDept, setReportDept] = useState("");
const [reportSem, setReportSem] = useState("");
const [reportSec, setReportSec] = useState("");
const [reportData, setReportData] = useState([]);
  
const [students, setStudents] = useState([]);
const [faculty, setFaculty] = useState([]);

const [markLimits, setMarkLimits] = useState([]);


const [pDept, setPDept] = useState("");
const [pSem, setPSem] = useState("");
const [pSec, setPSec] = useState("");


  const handlePromote = async () => {
  if (!pDept || !pSem) {
    alert("Please select department and semester");
    return;
  }

  const res = await fetch("http://localhost:3000/api/auth/promote", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      department: pDept,
      semester: Number(pSem)
    })
  });

  const data = await res.json();

  alert(data.updatedCount + " students promoted");
};
const handleDepromote = async () => {
  await fetch("http://localhost:3000/api/auth/depromote", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      department: pDept,
      semester: Number(pSem)
    })
  });

  alert("Students Depromoted");
};

   

const downloadReportPDF = () => {
  if (!reportData.length) {
    alert("No data to export");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Department: ${reportDept}`, 14, 10);
  doc.text(`Semester: ${reportSem}`, 14, 18);
  doc.text(`Section: ${reportSec}`, 14, 26);

  // 🔥 GROUP DATA
  const classReport = {};

  reportData.forEach(m => {
    if (!classReport[m.studentId]) {
      classReport[m.studentId] = {
        name: m.name,
        subjects: {},
        total: 0
      };
    }

    classReport[m.studentId].subjects[m.subject] = m.total;
    classReport[m.studentId].total += m.total;
  });

  const finalReport = Object.values(classReport);
  const allSubjects = [...new Set(reportData.map(m => m.subject))];

  // TABLE HEADERS
  const head = [["Name", ...allSubjects, "Total"]];

  // TABLE BODY
  const body = finalReport.map(s => [
    s.name,
    ...allSubjects.map(sub => s.subjects[sub] || "-"),
    s.total.toFixed(2)
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 35
  });

  doc.save(`Admin_Report_${reportDept}_${reportSem}_${reportSec}.pdf`);
};

useEffect(() => {
  if (!reportDept || !reportSem || !reportSec) return;

  fetch(`http://localhost:3000/api/marks?department=${reportDept}&semester=${reportSem}&section=${reportSec}&status=approved`)
    .then(res => res.json())
    .then(data => {
      setReportData(data);
    });

}, [reportDept, reportSem, reportSec]);

useEffect(() => {
  // USERS
  fetch("http://localhost:3000/api/users")
    .then(res => res.json())
    .then(data => {
      setStudents(data.filter(u => u.role === "student"));
      setFaculty(data.filter(u => u.role === "faculty"));
    });

  // DEPARTMENTS
  fetch("http://localhost:3000/api/departments")
    .then(res => res.json())
    .then(data => setDepartments(data));

  // SUBJECTS
  fetch("http://localhost:3000/api/subjects")
    .then(res => res.json())
    .then(data => setSubjects(data));
}, []);
const handleDeleteUser = async (id) => {
  try {
    console.log("Sending to backend:", id);

    const res = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("Backend response:", data);

    fetchUsers(); // refresh UI
  } catch (err) {
    console.log("Error:", err);
  }
};

const handleEditUser = (user) => {
  console.log("Editing:", user);

  setName(user.name || "");
  setEmail(user.email || "");
  setPassword(user.password || "");
  setRole(user.role || "");
  setDepartment(user.department || "");
  setSection(user.section || "");

  setEditingUserId(user._id);

  setShowForm(true); // ✅ VERY IMPORTANT
};
const clearForm = () => {
  setName("");
  setEmail("");
  setPassword("");
  setRole("");
  setDepartment("");
  setSection("");
};

const handleDeleteDept = async (id) => {
  try {
    console.log("Deleting ID:", id);

    const res = await fetch(`http://localhost:3000/api/departments/${id}`, {
      method: "DELETE",
    });
    fetchDepartments();

    const data = await res.json();

    console.log("Status:", res.status);
    console.log("Response:", data);

    if (res.ok) {
      fetchDepartments(); // refresh table
    } else {
      alert("Delete failed ❌");
    }
  } catch (err) {
    console.log("Error:", err);
  }
};
const handleEdit = (dept) => {
  console.log("Editing dept:", dept);

  setEditingDeptId(dept._id);

  setDeptName(dept.name || "");
  setDeptType(dept.type || "");
  setHodName(dept.hod || "");
  setTotalSem(dept.totalSemesters || "");

  setSectionsInput(
    dept.sections && Array.isArray(dept.sections)
      ? dept.sections.join(",")
      : ""
  );

  // 🔥 THIS LINE YOU MISSED
  setShowDeptForm(true);
};

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  const fetchUsers = async () => {
  const res = await fetch("http://localhost:3000/api/users");
  const data = await res.json();
  setUsers(data);
};

const fetchDepartments = async () => {
  const res = await fetch("http://localhost:3000/api/departments");
  const data = await res.json();
  setDeptList(data);
};
useEffect(() => {
  fetchUsers();
  fetchDepartments();
}, []);
const handleSaveUser = async () => {
  const userData = {
    name,
    email,
    password,
    role,
    department,
    section
  };

  if (editingUserId) {
    // UPDATE
    await fetch(`http://localhost:3000/api/users/${editingUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  } else {
    // ADD
    await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  }

  fetchUsers();
  setEditingUserId(null);
  clearForm();
};

const [studentCount, setStudentCount] = useState(0);

const checkStudents = async () => {
  if (!pDept || !pSem || !pSec) return;

  const res = await fetch(
    `http://localhost:3000/api/students?department=${pDept}&semester=${pSem}&section=${pSec}`
  );

  const data = await res.json();

  setStudentCount(data.length);
};
useEffect(() => {
  checkStudents();
}, [pDept, pSem, pSec]);


  

  return (
    <div className="admin">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🎓 Admin</h2>
        <ul>
          <li onClick={() => setActive("dashboard")}>📊 Dashboard</li>
          <li onClick={() => setActive("users")}>👤 Users</li>
          <li onClick={() => setActive("departments")}>🏫 Departments</li>
          <li onClick={() => setActive("subjects")}>📚 Subjects</li>
          <li onClick={() => setActive("assignments")}>📝 Assignments</li>
          <li onClick={() => setActive("reports")}>📊 Reports</li>
          <li onClick={() => setActive("markSettings")}>⚙️ Marks Settings</li>
          <li onClick={() => setActive("promote")}>🎓 Promote Students</li>
          <li onClick={() => setActive("changePassword")}>🔑 Change Password</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* NAVBAR */}
        <div className="navbar">
          <h2>{active.toUpperCase()}</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* ================= DASHBOARD ================= */}
        {active === "dashboard" && (
  <>
    <div className="cards">
      <div className="card students">
        👨‍🎓 Students: {students.length}
      </div>

      <div className="card faculty">
        👨‍🏫 Faculty: {faculty.length}
      </div>

      <div className="card dept">
        🏫 Departments: {departments.length}
      </div>

      <div className="card subjects">
        📚 Subjects: {subjects.length}
      </div>
   

    {/* 🔥 ADD PROMOTION HERE */}
   
    </div>
  </>
)}
        {/* ================= USERS ================= */}
     {active === "users" && (
  <div className="users-container">

    <h2>Users Management</h2>

    {!showForm && (
  <button
    className="add-btn"
    onClick={() => {
      setEditingUserId(null);
      setShowForm(true);
    }}
  >
    + Add User
  </button>
)}

    {showForm && (
      <div className="user-form-card">

        <h3>Add User</h3>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Set Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setType("");
            setDepartment("");
            setDepartments([]);
            setSection("");
          }}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="student">Student</option>
        </select>

        {role !== "admin" && role !== "" && (
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setDepartment("");
              setDepartments([]);
              setSection("");
            }}
          >
            <option value="">Select Type</option>
            <option value="BTECH">B.Tech</option>
            <option value="DIPLOMA">Diploma</option>
            <option value="PG">PG</option>
            <option value="FIRST_YEAR">First Year</option>
            <option value="PHARMACY">pharmacy</option>
          </select>
        )}

        {/* FIXED: replaced <> with div */}
        {type && (
          <div>

            
              {role !== "hod" && role !== "admin" && (
  <select
    value={department}
    onChange={(e) => {
      setDepartment(e.target.value);
      setSection("");
    }}
  >
    <option value="">Select Department</option>

   {deptList
  .filter((d) => d.type === type)
  .map((d) => (
    <option key={d.name} value={d.name}>
      {d.name}
    </option>
))}
  </select>
)}

       {role === "hod" && (
  <div className="dept-grid">
    {deptList
      .filter((d) => d.type === type)
      .map((dept) => (
        <label
  key={dept.name}
  className={departments.includes(dept.name) ? "dept-chip active" : "dept-chip"}
>
  <input
    type="checkbox"
    checked={departments.includes(dept.name)}
    onChange={(e) => {
      if (e.target.checked) {
        setDepartments([...departments, dept.name]);
      } else {
        setDepartments(
          departments.filter((d) => d !== dept.name)
        );
      }
    }}
  />
  {dept.name}
</label>
      ))}
  </div>
)}
  

        {role === "student" && department && (
  <>
    {/* SECTION */}
    <select
      value={section}
      onChange={(e) => setSection(e.target.value)}
    >
      <option value="">Select Section</option>
      {deptList
        .find((d) => d.name === department)?.sections
        ?.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
    </select>

    {/* SEMESTER */}
    <select
      value={semester}
      onChange={(e) => setSemester(e.target.value)}
    >
      <option value="">Select Semester</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
      <option value="8">8</option>
    </select>
  </>
)}
        </div>
        )}
      

        <div className="form-buttons">
          <button
  className="save-btn"
  onClick={async () => {
    if (role === "hod" && departments.length === 0) {
  alert("Select at least one department");
  return;
}
 const userData = {
  name,
  email,
  password,
  role,
  type,
  department:
    role === "hod"
      ? departments.join(", ")   // ✅ FIX
      : department,
  section,
  semester
};
  try {
    if (editingUserId) {
      // UPDATE
      await fetch(`http://localhost:3000/api/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      console.log("User updated");
    } else {
      // CREATE
      await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      console.log("User created");
    }

    fetchUsers();
    setEditingUserId(null);
    clearForm();
    setShowForm(false);

  } catch (err) {
    console.log("ERROR:", err);
  }
}}
>
  Save
</button>

          <button
            className="cancel-btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>

      </div>
    )}

    <table className="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
  {users.map((u) => (
    <tr key={u._id}>
      <td>{u.id}</td>
      <td>{u.name}</td>
      <td>{u.email}</td>
      <td>{u.role}</td>
      
  <td>
  {Array.isArray(u.department)
    ? u.department.join(", ")
    : u.department || "-"}
</td>
      <td>
        <button
  className="edit-btn"
  onClick={() => handleEditUser(u)}
>
  ✏️Edit
</button>

<button
  className="delete-btn"
  onClick={() => {
    console.log("Clicked delete:", u._id); // debug
    handleDeleteUser(u._id);
  }}
>
 
  🗑 Delete
</button>
      </td>
    </tr>
  ))}
</tbody>
    </table>

  </div>
)}
        {/* ================= DEPARTMENTS ================= */}
  {active === "departments" && (
  <div>
    <h2>Departments</h2>

    {/* ADD BUTTON */}
    <button
      className="add-btn"
      onClick={() => setShowDeptForm(true)}
    >
      + Add Department
    </button>

    {/* POPUP FORM */}
    {showDeptForm && (
      <div className="form-popup">
        <h3>Add Department</h3>

        <input
          type="text"
          placeholder="Department Name"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
        />
        <select
  value={deptType}
  onChange={(e) => setDeptType(e.target.value)}
>
  <option value="">Select Course Type</option>
  <option value="BTECH">B.Tech</option>
  <option value="DIPLOMA">Diploma</option>
  <option value="PG">PG</option>
  <option value="PHARMACY">Pharmacy</option>
</select>

        <input
          type="text"
          placeholder="HOD Name"
          value={hodName}
          onChange={(e) => setHodName(e.target.value)}
        />
        <input
  type="number"
  placeholder="Total Semesters (e.g. 8)"
  value={totalSem}
  onChange={(e) => setTotalSem(e.target.value)}
/>

        {/* ✅ NEW: SECTIONS INPUT */}
        <input
          type="text"
          placeholder="Enter Sections (A,B,C)"
          value={sectionsInput}
          onChange={(e) => setSectionsInput(e.target.value)}
        />

        <div className="form-actions">
          <button
            className="save-btn"
            onClick={async () => {
  if (!deptName || !hodName || !sectionsInput || !deptType || !totalSem) {
    alert("Fill all fields");
    return;
  }
  if (!editingDeptId && deptList.some(d => d.name === deptName)) {
  alert("Department already exists ❌");
  return;
}

  const sectionsArray = sectionsInput
    .split(",")
    .map((s) => s.trim());

  if (editingDeptId) {
  // ✏️ UPDATE
  await fetch(`http://localhost:3000/api/departments/${editingDeptId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: deptName,
      hod: hodName,
      type: deptType,
      totalSemesters: Number(totalSem),
      sections: sectionsArray
    })
  });

  console.log("Department updated");
} else {
  // ➕ CREATE
  await fetch("http://localhost:3000/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: deptName,
      hod: hodName,
      type: deptType,
      totalSemesters: Number(totalSem),
      sections: sectionsArray
    })
  });

  console.log("Department created");
}

  fetchDepartments();

  setDeptName("");
  setDeptType("");
  setHodName("");
  setSectionsInput("");
  setTotalSem("");
  setShowDeptForm(false);
}}
          >
            Save
          </button>

          <button
            className="cancel-btn"
            onClick={() => setShowDeptForm(false)}
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
          <th>Department</th>
          <th>Type</th>
          <th>HOD</th>
          <th>Sections</th> 
        
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {deptList
  .filter(d => d.name && d.type && d.hod)   // ✅ remove empty rows
  .map((d, index) => (
          <tr key={d._id}>
            <td>{index + 1}</td>
            <td>{d.name}</td>
            <td>{d.type}</td>
            <td>{d.hod}</td>
            <td>{d.sections.join(", ")}</td>
            <td className="action-buttons">
  <button
  className="edit-btn"
  onClick={() => {
    console.log("EDIT CLICKED");
    handleEdit(d);
  }}
>
 ✏️Edit
</button>

  <button
    className="delete-btn"
    onClick={() => handleDeleteDept(d._id)}
  >
    🗑 Delete
  </button>
</td>
            
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        
           
   

        
   
       {/*================ SUBJECTS ================= */}
        {active === "subjects" && (
  <Subjects
    deptList={deptList}
    subjects={subjects}
    setSubjects={setSubjects}
  />
)}
{/*================ assign ================= */}
      {active === "assignments" && (
  <Assignments
    users={users}
    deptList={deptList}
    subjects={subjects}
    assignments={assignments}
    setAssignments={setAssignments}
  />
)}
          
        
        {/* ================= reports ================= */}
        {active === "reports" && (
  <div className="reports-container">
    <h2>📊 Institution Reports</h2>
    <button onClick={downloadReportPDF} className="download-btn">
  Download PDF
</button>

    {/* DROPDOWNS */}
   
    <div style={{ marginBottom: "15px" }}>
      
      <select onChange={(e) => setReportDept(e.target.value)}>
        <option>Select Department</option>
        {deptList.map((d, i) => (
          <option key={i} value={d.name}>{d.name}</option>
        ))}
      </select>

      <select onChange={(e) => setReportSem(e.target.value)}>
        <option>Select Semester</option>
        {[1,2,3,4,5,6,7,8].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select onChange={(e) => setReportSec(e.target.value)}>
        <option>Select Section</option>
        {deptList
          .find(d => d.name === reportDept)?.sections
          ?.map((sec, i) => (
            <option key={i} value={sec}>{sec}</option>
          ))}
      </select>

    </div>

    {/* TABLE */}
    {reportData.length > 0 && (() => {

      const classReport = {};

      reportData.forEach(m => {
        if (!classReport[m.studentId]) {
          classReport[m.studentId] = {
            name: m.name,
            subjects: {},
            total: 0
          };
        }

        classReport[m.studentId].subjects[m.subject] = m.total;
        classReport[m.studentId].total += m.total;
      });

      const finalReport = Object.values(classReport);
      const allSubjects = [...new Set(reportData.map(m => m.subject))];

      return (
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
            {finalReport.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>

                {allSubjects.map((sub, j) => (
                  <td key={j}>
                    {s.subjects[sub] || "-"}
                  </td>
                ))}

                <td>{s.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
      );
    })()}

  </div>
)}

{/* ================= MARKS settings ================= */}
{active === "markSettings" && (
  <MarksSettings
  deptList={deptList}
  subjects={subjects}
    markLimits={markLimits}
    setMarkLimits={setMarkLimits}
  />
)}
{/* ================= promote and depromote ================= */}

{active === "promote" && (
  <div className="promote-page">
    <h2>Promote Students</h2>

    <div className="promote-box">
      <select onChange={(e) => setPDept(e.target.value)}>
        <option>Select Department</option>
        {deptList.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setPSem(e.target.value)}>
        <option>Select Semester</option>
        {[1,2,3,4,5,6,7,8].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="promote-actions">
        <button
          onClick={handlePromote}
          disabled={!pDept || !pSem}
        >
          Promote Students
        </button>

        <button
          onClick={handleDepromote}
          className="depromote-btn"
          disabled={!pDept || !pSem}
        >
          Depromote Students
        </button>
      </div>
    </div>
  </div>
)}

        {/* ================= CHANGE PASSWORD ================= */}
       {active === "changePassword" && (
  <ChangePassword currentUser={loggedInUser} />
)}
      </div>
   </div> 
    
  );
}

export default Admin;
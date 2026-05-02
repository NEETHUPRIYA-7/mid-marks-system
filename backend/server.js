const User = require("./models/User");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

// CORS: echo request origin to ensure ACAO is returned for browser preflight

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "CORS working" });
});

// connect DB
connectDB();

// routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const Department = require("./models/Department");
const Subject = require("./models/Subject");
const Assignment = require("./models/Assignment");
const MarkSettings = require("./models/MarkSettings");
const Marks = require("./models/Marks");






// ================= DEPARTMENT APIs =================

// ADD DEPARTMENT
app.post("/api/departments", async (req, res) => {
  try {
    console.log("📘 Creating department:", req.body);

    const dept = new Department(req.body);
    await dept.save();

    console.log("✅ Department saved:", dept._id);

    res.json({ message: "Department added successfully" });
  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});
// GET ALL DEPARTMENTS
app.get("/api/departments", async (req, res) => {
  try {
    const data = await Department.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE DEPARTMENT
// DELETE DEPARTMENT
app.delete("/api/departments/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Deleting ID:", id);

    const deleted = await Department.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.put("/api/departments/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("Updating department:", id);
    console.log("New data:", req.body);

    // ✅ DEFINE updatedDept properly
    const updatedDept = await Department.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        hod: req.body.hod,
        type: req.body.type,
        totalSemesters: Number(req.body.totalSemesters),
        sections: req.body.sections
      },
      { returnDocument: "after" }
    );

    // ✅ NOW this works
    console.log("Updated department:", updatedDept);

    res.json(updatedDept);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
  
// USERS API



// ✅ GET USERS
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// ✅ ADD USER
app.post("/api/users", async (req, res) => {
  try {
    console.log("🔥 Creating user:", req.body);   // 👈 ADD THIS

    const newUser = new User(req.body);
    await newUser.save();

    console.log("✅ User saved:", newUser._id);   // 👈 ADD THIS

    res.json(newUser);
  } catch (err) {
    console.log("❌ Error creating user:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("🔥 Deleting user:", id); // IMPORTANT

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: err.message });
  }
});



   app.put("/api/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("✏️ Updating user:", id);
    console.log("📦 New data:", req.body);

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });

    console.log("✅ Updated user:", updatedUser);

    res.json(updatedUser);
  } catch (err) {
    console.log("❌ Error updating:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= SUBJECT MODEL =================


// ================= CREATE SUBJECT =================
app.post("/api/subjects", async (req, res) => {
  try {
    console.log("📌 Creating subject:", req.body);

    const newSubject = new Subject(req.body);
    await newSubject.save();

    console.log("✅ Subject saved:", newSubject._id);

    res.json(newSubject);
  } catch (err) {
    console.log("❌ Error creating subject:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= GET SUBJECTS =================
app.get("/api/subjects", async (req, res) => {
  try {
    console.log("📥 Fetching subjects...");

    const subjects = await Subject.find();

    console.log("✅ Subjects count:", subjects.length);

    res.json(subjects);
  } catch (err) {
    console.log("❌ Error fetching subjects:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= UPDATE SUBJECT =================
app.put("/api/subjects/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("✏️ Updating subject:", id);
    console.log("📌 New data:", req.body);

    const updated = await Subject.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after" }
    );

    console.log("✅ Updated subject:", updated);

    res.json(updated);
  } catch (err) {
    console.log("❌ Error updating subject:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE SUBJECT =================
app.delete("/api/subjects/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("🗑 Deleting subject:", id);

    await Subject.findByIdAndDelete(id);

    console.log("✅ Subject deleted");

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log("❌ Error deleting subject:", err);
    res.status(500).json({ error: err.message });
  }
});

//===========Assignments===========
// IMPORT


// CREATE
app.post("/api/assignments", async (req, res) => {
  console.log("Creating assignment:", req.body);

  const newAssign = new Assignment(req.body);
  await newAssign.save();

  res.json(newAssign);
});

// GET
app.get("/api/assignments", async (req, res) => {
  try {
    const data = await Assignment.find()
      .populate("facultyId", "name")   // ✅ populate faculty name
      .populate("subjectId", "name");  // ✅ populate subject name

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching assignments" });
  }
});



app.put("/api/assignments/:id", async (req, res) => {
  try {
    console.log("Updating assignment:", req.params.id);

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
// DELETE
app.delete("/api/assignments/:id", async (req, res) => {
  console.log("Deleting assignment:", req.params.id);

  await Assignment.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted successfully" });
});




// SAVE or UPDATE
app.post("/api/marksettings", async (req, res) => {
  console.log("Marks updated");
  try {
    const { department, midMax, assignmentMax, totalInternalMax } = req.body;

    const updated = await MarkSettings.findOneAndUpdate(
      { department },
      { midMax, assignmentMax, totalInternalMax },
      { returnDocument: "after", upsert: true } // ✅ create if not exists
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET

app.delete("/api/marksettings/:id", async (req, res) => {
  console.log("Marks deleted");
  try {
    await MarkSettings.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/marksettings/:id", async (req, res) => {
  try {
    const updated = await MarkSettings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument:"after"}
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//change password
app.put("/api/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating password" });
  }
});

app.post("/api/marks", async (req, res) => {
  try {
    await Marks.insertMany(req.body);
    res.json({ message: "Marks saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/marks/submit", async (req, res) => {
  const { department, section, subject } = req.body;

  await Marks.updateMany(
    { department, section, subject },
    { status: "submitted" }
  );

  res.json({ message: "Submitted" });
});



app.get("/api/students", async (req, res) => {
  try {
    const { department, semester, section } = req.query;

    const data = await User.find({
      role: "student",
      department: department,
      semester: Number(semester),
      section: section
    });

    console.log("Students Found:", data);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

app.get("/api/mark-settings", async (req, res) => {
  try {
    const data = await MarkSettings.find(); // ✅ CHANGE HERE
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/mark-settings", async (req, res) => {
  try {
    const { department, midMax, assignmentMax, totalInternalMax } = req.body;

    const existing = await MarkSettings.findOne({ department });

    if (existing) {
      // 🔥 UPDATE INSTEAD OF ERROR
      existing.midMax = midMax;
      existing.assignmentMax = assignmentMax;
      existing.totalInternalMax = totalInternalMax;

      await existing.save();

      return res.json({ message: "Updated existing settings" });
    }

    // CREATE NEW
    const newSetting = new MarkSettings({
      department,
      midMax,
      assignmentMax,
      totalInternalMax
    });

    await newSetting.save();

    res.json(newSetting);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error saving settings" });
  }
});
app.put("/api/mark-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { midMax, assignmentMax, totalInternalMax } = req.body;

    const updated = await MarkSettings.findByIdAndUpdate(
      id,
      {
        midMax,
        assignmentMax,
        totalInternalMax
      },
      { new: true } // return updated data
    );

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/mark-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await MarkSettings.findByIdAndDelete(id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.post("/api/marks/save", async (req, res) => {
  try {
    const marks = req.body;

    for (let m of marks) {
      await Marks.findOneAndUpdate(
        {
          studentId: m.studentId,
          subject: m.subject   // 🔥 VERY IMPORTANT
        },
        {
          ...m,
          status: "draft"
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Draft saved" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error saving draft" });
  }
});

app.post("/api/marks/submit", async (req, res) => {
  try {
    const marks = req.body;

    for (let m of marks) {
      await Marks.findOneAndUpdate(
        {
          studentId: m.studentId,
          subject: m.subject   // 🔥 IMPORTANT
        },
        {
          ...m,
          status: "submitted"
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Submitted to HOD" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error submitting" });
  }
});







app.get("/api/marks", async (req, res) => {
  try {
    const { department, semester, section, subject, status } = req.query;

    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (section) query.section = section;
    if (subject) query.subject = subject;   // 🔥 IMPORTANT
    if (status) query.status = status;

    const data = await Marks.find(query);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching marks" });
  }
});

// APPROVE
app.post("/api/marks/approve", async (req, res) => {
  const { studentId, subject } = req.body;

  await Marks.findOneAndUpdate(
    { studentId, subject },
    { status: "approved" }
  );

  res.json({ message: "Approved" });
});

// REJECT
app.post("/api/marks/reject", async (req, res) => {
  try {
    const { studentId, subject, reason } = req.body;

    console.log("REJECT DATA:", req.body); // 🔍 debug

    const updated = await Marks.findOneAndUpdate(
      { studentId, subject },
      {
        status: "rejected",
        reason: reason || "No reason provided"
      },
      { new: true } // ✅ VERY IMPORTANT
    );

    console.log("UPDATED DOC:", updated); // 🔍 debug

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Reject failed" });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


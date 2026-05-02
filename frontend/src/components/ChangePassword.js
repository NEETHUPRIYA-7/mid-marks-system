import { useState } from "react";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="users-container">
      <h2>Change Password</h2>

      <div className="form-popup">

        {/* OLD PASSWORD */}
        <div className="password-box">
          <input
            type={showOld ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <span onClick={() => setShowOld(!showOld)}>
            {showOld ? "🙈" : "👁"}
          </span>
        </div>

        {/* NEW PASSWORD */}
        <div className="password-box">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span onClick={() => setShowNew(!showNew)}>
            {showNew ? "🙈" : "👁"}
          </span>
        </div>

        <button
          className="save-btn"
          onClick={async () => {

            if (!oldPassword || !newPassword) {
              alert("Fill all fields");
              return;
            }

            // ✅ get user safely
            const user = JSON.parse(localStorage.getItem("user"));
            console.log("User:",user);

            if (!user||!user._id) {
              alert("User not logged in ❌");
              return;
            }

            try {
              const res = await fetch("http://localhost:3000/api/change-password", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  userId: user._id,
                  oldPassword,
                  newPassword
                })
              });

              const data = await res.json();

              if (!res.ok) {
                alert(data.message || "Error updating password ❌");
                return;
              }

              alert("✅ Password updated successfully");

              setOldPassword("");
              setNewPassword("");

            } catch (err) {
              console.log(err);
              alert("❌ Error updating password");
            }
          }}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Admin from "./components/Admin";
import Hod from "./components/Hod";
import Faculty from "./components/Faculty";
import Student from "./components/Student";


function App() {
  
  return (
    

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/hod" element={<Hod />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/student" element={<Student />} />
      </Routes>


  );
}

export default App;
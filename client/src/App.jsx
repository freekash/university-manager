import React from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import AdminDashboard from './pages/AdminDashboard';
import Branches from './pages/admin/Branches';
import AdminDepartments from './pages/admin/Departments';
import Semesters from './pages/admin/Semesters';
import Subjects from './pages/admin/Subjects';
import Faculty from './pages/admin/Faculty';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyMarksManager from './pages/faculty/MarksManager';
import StudentAttendanceView from './pages/student/AttendanceView';

const MainLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // In a real app, you would have a proper authentication check here.
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isLoginPage && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="semesters" element={<Semesters />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="faculty" element={<Faculty />} />
        </Route>

        {/* Faculty Routes */}
        <Route path="/faculty">
          <Route path="attendance" element={<FacultyAttendance />} />
          <Route path="marks" element={<FacultyMarksManager />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student">
          <Route path="attendance" element={<StudentAttendanceView />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;

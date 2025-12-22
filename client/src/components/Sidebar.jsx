import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';

const drawerWidth = 240;

const Sidebar = () => {
  // In a real application, you'd get the user role from context/redux
  const userRole = 'ADMIN'; // Placeholder: Assume admin for now for visibility

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#181a20', // Binance dark background
          color: '#EAECEF', // Binance text color
          borderRight: '1px solid #2a2d34', // Subtle border
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 'bold' }}>
          EduFlow
        </Typography>
      </Toolbar>
      <List>
        <ListItem button component={Link} to="/" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/students" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
          <ListItemText primary="Students" />
        </ListItem>
        <ListItem button component={Link} to="/departments" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
          <ListItemText primary="Departments" />
        </ListItem>
        <ListItem button component={Link} to="/courses" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
          <ListItemText primary="Courses" />
        </ListItem>

        {userRole === 'ADMIN' && ( // Conditionally render for Admin role
          <>
            <ListItem button component={Link} to="/admin/dashboard" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/admin/branches" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Branches" />
            </ListItem>
            <ListItem button component={Link} to="/admin/departments" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Departments" />
            </ListItem>
            <ListItem button component={Link} to="/admin/semesters" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Semesters" />
            </ListItem>
            <ListItem button component={Link} to="/admin/subjects" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Subjects" />
            </ListItem>
            <ListItem button component={Link} to="/admin/faculty" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Faculty" />
            </ListItem>
          </>
        )}

        {userRole === 'FACULTY' && ( // Conditionally render for Faculty role
          <>
            <ListItem button component={Link} to="/faculty/attendance" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Take Attendance" />
            </ListItem>
            <ListItem button component={Link} to="/faculty/marks" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
              <ListItemText primary="Manage Marks" />
            </ListItem>
          </>
        )}

        {userRole === 'STUDENT' && ( // Conditionally render for Student role
          <ListItem button component={Link} to="/student/attendance" sx={{ '&.active': { color: '#FCD535' }, '&:hover': { color: '#FCD535' } }}>
            <ListItemText primary="My Attendance" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;

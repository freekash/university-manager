import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        Admin Dashboard
      </Typography>

      <Paper sx={{ p: 3, mt: 3, bgcolor: '#181a20', color: '#EAECEF', borderRadius: '8px', border: '1px solid #2a2d34' }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#FCD535' }}>
          Daily Attendance Volume (College Wide)
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #6B7280', borderRadius: '4px' }}>
          <Typography variant="body1" sx={{ color: '#6B7280' }}>
            [Placeholder for TradingView Style Chart]
            <br/>
            (Chart.js or similar library integration for daily attendance data)
          </Typography>
        </Box>
      </Paper>

      {/* Add placeholders for other admin metrics or quick links */}
      <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
        <Paper sx={{ p: 2, bgcolor: '#181a20', color: '#EAECEF', borderRadius: '8px', border: '1px solid #2a2d34', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#FCD535' }}>1500</Typography>
          <Typography variant="body2" sx={{ color: '#EAECEF' }}>Total Students</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: '#181a20', color: '#EAECEF', borderRadius: '8px', border: '1px solid #2a2d34', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#FCD535' }}>75</Typography>
          <Typography variant="body2" sx={{ color: '#EAECEF' }}>Total Faculty</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: '#181a20', color: '#EAECEF', borderRadius: '8px', border: '1px solid #2a2d34', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#FCD535' }}>12</Typography>
          <Typography variant="body2" sx={{ color: '#EAECEF' }}>Total Departments</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

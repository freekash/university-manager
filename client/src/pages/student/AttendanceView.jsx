import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentAttendanceView = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if not student
    useEffect(() => {
        if (user && user.role !== 'STUDENT') {
            navigate('/'); // Redirect to dashboard or unauthorized page
        }
    }, [user, navigate]);

    const fetchAttendance = async () => {
        try {
            setError(null);
            const response = await API.get('/students/me/attendance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendanceRecords(response.data);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            setError(err.response?.data?.message || 'Failed to fetch attendance records.');
        }
    };

    useEffect(() => {
        if (token && user?.role === 'STUDENT') {
            fetchAttendance();
        }
    }, [token, user]);

    // Calculate attendance summary
    const totalClasses = attendanceRecords.length;
    const classesPresent = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const attendancePercentage = totalClasses > 0 ? ((classesPresent / totalClasses) * 100).toFixed(2) : 0;

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                My Attendance
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3, bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>{attendancePercentage}%</Typography>
                    <Typography variant="body1" sx={{ color: '#EAECEF' }}>Attendance Rate</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: '#00B06A', fontFamily: 'IBM Plex Sans, sans-serif' }}>{classesPresent}</Typography>
                    <Typography variant="body1" sx={{ color: '#EAECEF' }}>Classes Present</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: '#FF4D4D', fontFamily: 'IBM Plex Sans, sans-serif' }}>{totalClasses - classesPresent}</Typography>
                    <Typography variant="body1" sx={{ color: '#EAECEF' }}>Classes Absent</Typography>
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="attendance table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Date</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Subject</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Class</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendanceRecords.map((record) => (
                                <TableRow
                                    key={record.id}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: '#2a2d34' }
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                        {new Date(record.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{record.subject?.name}</TableCell>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{record.class?.name}</TableCell>
                                    <TableCell sx={{ color: record.status === 'PRESENT' ? '#00B06A' : '#FF4D4D', borderBottom: '1px solid #2a2d34' }}>
                                        {record.status}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentAttendanceView;

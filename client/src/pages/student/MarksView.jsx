import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentMarksView = () => {
    const [markRecords, setMarkRecords] = useState([]);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if not student
    useEffect(() => {
        if (user && user.role !== 'STUDENT') {
            navigate('/'); // Redirect to dashboard or unauthorized page
        }
    }, [user, navigate]);


    const fetchMarks = async () => {
        try {
            setError(null);
            const response = await API.get('/students/me/marks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMarkRecords(response.data);
        } catch (err) {
            console.error('Failed to fetch marks:', err);
            setError(err.response?.data?.message || 'Failed to fetch marks records.');
        }
    };

    useEffect(() => {
        if (token && user?.role === 'STUDENT') {
            fetchMarks();
        }
    }, [token, user]);

    // Helper to determine mark status for styling
    const getMarkStatusColor = (marksObtained, totalMarks) => {
        if (totalMarks === 0) return '#EAECEF'; // Neutral if no total marks
        const percentage = (marksObtained / totalMarks) * 100;
        if (percentage >= 50) return '#00B06A'; // Green for passing
        return '#FF4D4D'; // Red for failing
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                My Marks
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="marks table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Subject</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Class</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Exam Type</TableCell>
                            <TableCell align="right" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Marks</TableCell>
                            <TableCell align="right" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Percentage</TableCell>
                            <TableCell align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {markRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    No marks records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            markRecords.map((record) => (
                                <TableRow
                                    key={record.id}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: '#2a2d34' }
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                        {record.subject?.name}
                                    </TableCell>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{record.class?.name}</TableCell>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{record.examType}</TableCell>
                                    <TableCell align="right" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                        {record.marksObtained}/{record.totalMarks}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                        {record.totalMarks > 0 ? ((record.marksObtained / record.totalMarks) * 100).toFixed(2) : 0}%
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: getMarkStatusColor(record.marksObtained, record.totalMarks), borderBottom: '1px solid #2a2d34' }}>
                                        {record.totalMarks > 0 && (record.marksObtained / record.totalMarks) * 100 >= 50 ? 'PASS' : 'FAIL'}
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

export default StudentMarksView;

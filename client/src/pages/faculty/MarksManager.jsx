import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, InputLabel, FormControl, TextField, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const FacultyMarksManager = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [examType, setExamType] = useState('');
    const [marksRecords, setMarksRecords] = useState({}); // {studentId: {marksObtained: '', totalMarks: ''}}
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if not faculty
    useEffect(() => {
        if (user && user.role !== 'FACULTY') {
            navigate('/'); // Redirect to dashboard or unauthorized page
        }
    }, [user, navigate]);


    const fetchFacultyData = async () => {
        try {
            setError(null);
            const [classesRes, subjectsRes] = await Promise.all([
                API.get('/faculty/classes', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/faculty/subjects', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setClasses(classesRes.data);
            setSubjects(subjectsRes.data.map(item => item.subject)); // Assuming the API returns objects with {subject, class}
        } catch (err) {
            console.error('Failed to fetch faculty data:', err);
            setError(err.response?.data?.message || 'Failed to fetch faculty classes or subjects.');
        }
    };

    const fetchStudentsAndExistingMarks = async () => {
        if (selectedClassId && selectedSubjectId && examType) {
            try {
                // Fetch students for the selected class
                const studentsRes = await API.get(`/admin/classes/${selectedClassId}/students`, { headers: { Authorization: `Bearer ${token}` } });
                setStudents(studentsRes.data);

                // Fetch existing marks for these students, subject, and exam type
                // This would ideally be a dedicated endpoint like /faculty/marks?classId=...&subjectId=...&examType=...
                // For now, let's assume we can query marks from /api/students/:id/marks and filter
                const existingMarks = {}; // Simulate fetching existing marks
                // In a real app, you'd fetch /api/marks?classId=...&subjectId=...&examType=...
                // For this example, we'll initialize with empty or assumed default
                studentsRes.data.forEach(student => {
                    existingMarks[student.id] = { marksObtained: '', totalMarks: '' };
                });
                // TODO: Implement actual fetching of existing marks from backend

                setMarksRecords(existingMarks);
            } catch (err) {
                console.error('Failed to fetch students or marks:', err);
                setError(err.response?.data?.message || 'Failed to fetch students or marks.');
                setStudents([]);
            }
        } else {
            setStudents([]);
            setMarksRecords({});
        }
    };


    useEffect(() => {
        if (token && user?.role === 'FACULTY') {
            fetchFacultyData();
        }
    }, [token, user]);

    useEffect(() => {
        if (token && selectedClassId && selectedSubjectId && examType) {
            fetchStudentsAndExistingMarks();
        }
    }, [token, selectedClassId, selectedSubjectId, examType]);


    const handleMarksChange = (studentId, field, value) => {
        setMarksRecords(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
            },
        }));
    };

    const handleSubmitMarks = async () => {
        try {
            setError(null);
            setMessage(null);

            if (!selectedClassId || !selectedSubjectId || !examType || Object.keys(marksRecords).length === 0) {
                setError('Please select a class, subject, exam type, and input marks.');
                return;
            }

            // Iterate over marksRecords and submit each
            for (const studentId in marksRecords) {
                const { marksObtained, totalMarks } = marksRecords[studentId];
                if (marksObtained !== '' && totalMarks !== '') {
                    await API.post('/faculty/marks', {
                        studentId: parseInt(studentId),
                        classId: parseInt(selectedClassId),
                        subjectId: parseInt(selectedSubjectId),
                        examType,
                        marksObtained: parseInt(marksObtained),
                        totalMarks: parseInt(totalMarks),
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }

            setMessage('Marks saved successfully!');
            // Optionally refetch or clear state
            // fetchStudentsAndExistingMarks();
        } catch (err) {
            console.error('Failed to save marks:', err);
            setError(err.response?.data?.message || 'Failed to save marks.');
        }
    };

    const examTypes = ['Quiz 1', 'Quiz 2', 'Midterm', 'Final', 'Assignment 1', 'Assignment 2']; // Example exam types

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Marks
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}
            {message && (
                <Alert severity="success" sx={{ mb: 3, bgcolor: '#1a2a1a', color: '#77ff77', border: '1px solid #00ff00' }}>
                    {message}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3, bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#6B7280' }}>Class</InputLabel>
                        <Select
                            name="classId"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            sx={{
                                color: '#EAECEF',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '& .MuiSvgIcon-root': { color: '#EAECEF' }
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#6B7280' }}>Subject</InputLabel>
                        <Select
                            name="subjectId"
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            sx={{
                                color: '#EAECEF',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '& .MuiSvgIcon-root': { color: '#EAECEF' }
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>{subject.name} ({subject.code})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#6B7280' }}>Exam Type</InputLabel>
                        <Select
                            name="examType"
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            sx={{
                                color: '#EAECEF',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                '& .MuiSvgIcon-root': { color: '#EAECEF' }
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {examTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {selectedClassId && selectedSubjectId && examType && students.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#0b0e11' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Student Name</TableCell>
                                    <TableCell align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Marks Obtained</TableCell>
                                    <TableCell align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Total Marks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#2a2d34' } }}>
                                        <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                            {student.user.name}
                                        </TableCell>
                                        <TableCell align="center" sx={{ borderBottom: '1px solid #2a2d34' }}>
                                            <TextField
                                                type="number"
                                                value={marksRecords[student.id]?.marksObtained || ''}
                                                onChange={(e) => handleMarksChange(student.id, 'marksObtained', e.target.value)}
                                                size="small"
                                                sx={{
                                                    width: 100,
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                                    '& .MuiInputBase-input': { color: '#EAECEF' },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ borderBottom: '1px solid #2a2d34' }}>
                                            <TextField
                                                type="number"
                                                value={marksRecords[student.id]?.totalMarks || ''}
                                                onChange={(e) => handleMarksChange(student.id, 'totalMarks', e.target.value)}
                                                size="small"
                                                sx={{
                                                    width: 100,
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                                    '& .MuiInputBase-input': { color: '#EAECEF' },
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 3,
                            bgcolor: '#FCD535', color: '#0b0e11',
                            '&:hover': { bgcolor: '#e0c030' }
                        }}
                        onClick={handleSubmitMarks}
                    >
                        Save Marks
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

export default FacultyMarksManager;
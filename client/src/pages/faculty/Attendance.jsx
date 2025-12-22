import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, InputLabel, FormControl, TextField, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const FacultyAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendanceRecords, setAttendanceRecords] = useState({}); // {studentId: 'PRESENT'/'ABSENT'}
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { token, user } = useAuth(); // Assuming useAuth provides token and user info (including userId and role)
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

    const fetchStudentsForClass = async () => {
        if (selectedClassId) {
            try {
                // Assuming an endpoint to get students for a specific class.
                // If not, we might need to fetch all students and filter by classId on client side, or create a new backend endpoint.
                // For now, let's assume we can get students by classId.
                const response = await API.get(`/admin/classes/${selectedClassId}/students`, { headers: { Authorization: `Bearer ${token}` } });
                setStudents(response.data);
                // Initialize attendance records for new students
                const initialAttendance = {};
                response.data.forEach(student => {
                    initialAttendance[student.id] = 'PRESENT'; // Default to present
                });
                setAttendanceRecords(initialAttendance);
            } catch (err) {
                console.error('Failed to fetch students:', err);
                setError(err.response?.data?.message || 'Failed to fetch students for the selected class.');
                setStudents([]);
            }
        } else {
            setStudents([]);
        }
    };


    useEffect(() => {
        if (token && user?.role === 'FACULTY') {
            fetchFacultyData();
        }
    }, [token, user]);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudentsForClass();
        }
    }, [selectedClassId, token]);


    const handleAttendanceChange = (studentId, status) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status,
        }));
    };

    const handleSubmitAttendance = async () => {
        try {
            setError(null);
            setMessage(null);

            if (!selectedClassId || !selectedSubjectId || !attendanceDate || Object.keys(attendanceRecords).length === 0) {
                setError('Please select a class, subject, date, and mark attendance for at least one student.');
                return;
            }

            const attendanceData = Object.keys(attendanceRecords).map(studentId => ({
                studentId: parseInt(studentId),
                status: attendanceRecords[studentId],
            }));

            await API.post('/faculty/attendance', {
                classId: parseInt(selectedClassId),
                subjectId: parseInt(selectedSubjectId),
                date: attendanceDate,
                attendanceData,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Attendance marked successfully!');
            // Optionally clear selections or reset state
            // setSelectedClassId('');
            // setSelectedSubjectId('');
            // setStudents([]);
            // setAttendanceRecords({});
        } catch (err) {
            console.error('Failed to mark attendance:', err);
            setError(err.response?.data?.message || 'Failed to mark attendance.');
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Take Attendance
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

                    <TextField
                        label="Attendance Date"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        InputLabelProps={{ shrink: true, sx: { color: '#6B7280' } }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                            '& .MuiInputBase-input': { color: '#EAECEF' },
                            '& .MuiSvgIcon-root': { color: '#EAECEF' }
                        }}
                    />
                </Box>
            </Paper>

            {selectedClassId && selectedSubjectId && students.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#0b0e11' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Student Name</TableCell>
                                    <TableCell align="center" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#2a2d34' } }}>
                                        <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                            {student.user.name}
                                        </TableCell>
                                        <TableCell align="center" sx={{ borderBottom: '1px solid #2a2d34' }}>
                                            <FormControl component="fieldset">
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Button
                                                        variant={attendanceRecords[student.id] === 'PRESENT' ? 'contained' : 'outlined'}
                                                        onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: attendanceRecords[student.id] === 'PRESENT' ? '#00B06A' : 'transparent',
                                                            color: attendanceRecords[student.id] === 'PRESENT' ? '#FFF' : '#00B06A',
                                                            borderColor: '#00B06A',
                                                            '&:hover': {
                                                                bgcolor: attendanceRecords[student.id] === 'PRESENT' ? '#009050' : 'rgba(0, 176, 106, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        Present
                                                    </Button>
                                                    <Button
                                                        variant={attendanceRecords[student.id] === 'ABSENT' ? 'contained' : 'outlined'}
                                                        onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: attendanceRecords[student.id] === 'ABSENT' ? '#FF4D4D' : 'transparent',
                                                            color: attendanceRecords[student.id] === 'ABSENT' ? '#FFF' : '#FF4D4D',
                                                            borderColor: '#FF4D4D',
                                                            '&:hover': {
                                                                bgcolor: attendanceRecords[student.id] === 'ABSENT' ? '#D03030' : 'rgba(255, 77, 77, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        Absent
                                                    </Button>
                                                </Box>
                                            </FormControl>
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
                        onClick={handleSubmitAttendance}
                    >
                        Save Attendance
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

export default FacultyAttendance;
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, Alert, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#181a20',
    border: '1px solid #2a2d34',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    color: '#EAECEF',
};

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', departmentId: '', semesterId: '' });
    const [editingSubject, setEditingSubject] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchSubjectsAndDependencies = async () => {
        try {
            setError(null);
            const [subjectsRes, departmentsRes, semestersRes] = await Promise.all([
                API.get('/admin/subjects', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/admin/semesters', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setSubjects(subjectsRes.data);
            setDepartments(departmentsRes.data);
            setSemesters(semestersRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to fetch subjects or dependencies.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchSubjectsAndDependencies();
        }
    }, [token]);

    const handleOpen = (subject = null) => {
        setError(null);
        if (subject) {
            setEditingSubject(subject);
            setFormData({ name: subject.name, code: subject.code, departmentId: subject.departmentId, semesterId: subject.semesterId });
        } else {
            setEditingSubject(null);
            setFormData({ name: '', code: '', departmentId: '', semesterId: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingSubject(null);
        setFormData({ name: '', code: '', departmentId: '', semesterId: '' });
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingSubject) {
                await API.put(`/admin/subjects/${editingSubject.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/admin/subjects', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchSubjectsAndDependencies();
            handleClose();
        } catch (err) {
            console.error('Failed to save subject:', err);
            setError(err.response?.data?.message || 'Failed to save subject.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                setError(null);
                await API.delete(`/admin/subjects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSubjectsAndDependencies();
            } catch (err) {
                console.error('Failed to delete subject:', err);
                setError(err.response?.data?.message || 'Failed to delete subject.');
            }
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Subjects
            </Typography>

            <Button
                variant="contained"
                onClick={() => handleOpen()}
                sx={{
                    mb: 3,
                    bgcolor: '#FCD535', color: '#0b0e11',
                    '&:hover': { bgcolor: '#e0c030' }
                }}
            >
                Add Subject
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="subjects table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>ID</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Name</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Code</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Department</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Semester</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((subject) => (
                            <TableRow
                                key={subject.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#2a2d34' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    {subject.id}
                                </TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{subject.name}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{subject.code}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{subject.department?.name}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{subject.semester?.name}</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #2a2d34' }}>
                                    <Button
                                        onClick={() => handleOpen(subject)}
                                        sx={{ color: '#FCD535', '&:hover': { bgcolor: 'rgba(252, 213, 53, 0.1)' } }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(subject.id)}
                                        sx={{ color: '#FF4D4D', '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.1)' } }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: '#FCD535', mb: 2 }}>
                        {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Subject Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                sx: {
                                    color: '#EAECEF',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: '#6B7280' },
                            }}
                        />
                        <TextField
                            label="Subject Code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                sx: {
                                    color: '#EAECEF',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: '#6B7280' },
                            }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#6B7280' }}>Department</InputLabel>
                            <Select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                required
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
                                {departments.map((department) => (
                                    <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#6B7280' }}>Semester</InputLabel>
                            <Select
                                name="semesterId"
                                value={formData.semesterId}
                                onChange={handleChange}
                                required
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
                                {semesters.map((semester) => (
                                    <MenuItem key={semester.id} value={semester.id}>{semester.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                bgcolor: '#FCD535', color: '#0b0e11',
                                '&:hover': { bgcolor: '#e0c030' }
                            }}
                        >
                            {editingSubject ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default Subjects;

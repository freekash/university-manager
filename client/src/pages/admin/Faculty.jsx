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

const Faculty = () => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', departmentId: '' });
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchFacultyAndDependencies = async () => {
        try {
            setError(null);
            const [facultyRes, departmentsRes] = await Promise.all([
                API.get('/admin/faculty', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setFacultyMembers(facultyRes.data);
            setDepartments(departmentsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to fetch faculty or departments.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchFacultyAndDependencies();
        }
    }, [token]);

    const handleOpen = (faculty = null) => {
        setError(null);
        if (faculty) {
            setEditingFaculty(faculty);
            setFormData({
                name: faculty.user.name,
                email: faculty.user.email,
                password: '', // Password is not editable directly without re-entering
                departmentId: faculty.departmentId
            });
        } else {
            setEditingFaculty(null);
            setFormData({ name: '', email: '', password: '', departmentId: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingFaculty(null);
        setFormData({ name: '', email: '', password: '', departmentId: '' });
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const dataToSend = { ...formData };
            if (!dataToSend.password) {
                delete dataToSend.password; // Don't send empty password on update
            }

            if (editingFaculty) {
                await API.put(`/admin/faculty/${editingFaculty.id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/admin/faculty', dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchFacultyAndDependencies();
            handleClose();
        } catch (err) {
            console.error('Failed to save faculty:', err);
            setError(err.response?.data?.message || 'Failed to save faculty.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                setError(null);
                await API.delete(`/admin/faculty/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchFacultyAndDependencies();
            } catch (err) {
                console.error('Failed to delete faculty:', err);
                setError(err.response?.data?.message || 'Failed to delete faculty.');
            }
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Faculty
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
                Add Faculty
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="faculty table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>ID</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Name</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Email</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Department</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facultyMembers.map((faculty) => (
                            <TableRow
                                key={faculty.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#2a2d34' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    {faculty.id}
                                </TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{faculty.user?.name}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{faculty.user?.email}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{faculty.department?.name}</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #2a2d34' }}>
                                    <Button
                                        onClick={() => handleOpen(faculty)}
                                        sx={{ color: '#FCD535', '&:hover': { bgcolor: 'rgba(252, 213, 53, 0.1)' } }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(faculty.id)}
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
                        {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Faculty Name"
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
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
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
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required={!editingFaculty} // Password is required only on creation
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
                            {editingFaculty ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default Faculty;

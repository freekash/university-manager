import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, Alert
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

const Semesters = () => {
    const [semesters, setSemesters] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });
    const [editingSemester, setEditingSemester] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchSemesters = async () => {
        try {
            setError(null);
            const response = await API.get('/admin/semesters', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSemesters(response.data);
        } catch (err) {
            console.error('Failed to fetch semesters:', err);
            setError(err.response?.data?.message || 'Failed to fetch semesters.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchSemesters();
        }
    }, [token]);

    const handleOpen = (semester = null) => {
        setError(null);
        if (semester) {
            setEditingSemester(semester);
            setFormData({
                name: semester.name,
                startDate: semester.startDate.split('T')[0], // Format date for input type="date"
                endDate: semester.endDate.split('T')[0],   // Format date for input type="date"
            });
        } else {
            setEditingSemester(null);
            setFormData({ name: '', startDate: '', endDate: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingSemester(null);
        setFormData({ name: '', startDate: '', endDate: '' });
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingSemester) {
                await API.put(`/admin/semesters/${editingSemester.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/admin/semesters', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchSemesters();
            handleClose();
        } catch (err) {
            console.error('Failed to save semester:', err);
            setError(err.response?.data?.message || 'Failed to save semester.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this semester?')) {
            try {
                setError(null);
                await API.delete(`/admin/semesters/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSemesters();
            } catch (err) {
                console.error('Failed to delete semester:', err);
                setError(err.response?.data?.message || 'Failed to delete semester.');
            }
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Semesters
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
                Add Semester
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="semesters table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>ID</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Name</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Start Date</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>End Date</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {semesters.map((semester) => (
                            <TableRow
                                key={semester.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#2a2d34' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    {semester.id}
                                </TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{semester.name}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{new Date(semester.startDate).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{new Date(semester.endDate).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #2a2d34' }}>
                                    <Button
                                        onClick={() => handleOpen(semester)}
                                        sx={{ color: '#FCD535', '&:hover': { bgcolor: 'rgba(252, 213, 53, 0.1)' } }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(semester.id)}
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
                        {editingSemester ? 'Edit Semester' : 'Add New Semester'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Semester Name"
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
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{
                                shrink: true,
                                sx: { color: '#6B7280' },
                            }}
                            InputProps={{
                                sx: {
                                    color: '#EAECEF',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                },
                            }}
                        />
                        <TextField
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{
                                shrink: true,
                                sx: { color: '#6B7280' },
                            }}
                            InputProps={{
                                sx: {
                                    color: '#EAECEF',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                },
                            }}
                        />
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
                            {editingSemester ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default Semesters;

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

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]); // To populate the branch dropdown
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', branchId: '' });
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchDepartmentsAndBranches = async () => {
        try {
            setError(null);
            const [departmentsRes, branchesRes] = await Promise.all([
                API.get('/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/admin/branches', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setDepartments(departmentsRes.data);
            setBranches(branchesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to fetch departments or branches.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchDepartmentsAndBranches();
        }
    }, [token]);

    const handleOpen = (department = null) => {
        setError(null);
        if (department) {
            setEditingDepartment(department);
            setFormData({ name: department.name, branchId: department.branchId });
        } else {
            setEditingDepartment(null);
            setFormData({ name: '', branchId: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingDepartment(null);
        setFormData({ name: '', branchId: '' });
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingDepartment) {
                await API.put(`/admin/departments/${editingDepartment.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/admin/departments', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchDepartmentsAndBranches();
            handleClose();
        } catch (err) {
            console.error('Failed to save department:', err);
            setError(err.response?.data?.message || 'Failed to save department.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                setError(null);
                await API.delete(`/admin/departments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchDepartmentsAndBranches();
            } catch (err) {
                console.error('Failed to delete department:', err);
                setError(err.response?.data?.message || 'Failed to delete department.');
            }
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Departments
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
                Add Department
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="departments table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>ID</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Name</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Branch</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.map((department) => (
                            <TableRow
                                key={department.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#2a2d34' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    {department.id}
                                </TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{department.name}</TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{department.branch?.name}</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #2a2d34' }}>
                                    <Button
                                        onClick={() => handleOpen(department)}
                                        sx={{ color: '#FCD535', '&:hover': { bgcolor: 'rgba(252, 213, 53, 0.1)' } }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(department.id)}
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
                        {editingDepartment ? 'Edit Department' : 'Add New Department'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Department Name"
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#6B7280' }}>Branch</InputLabel>
                            <Select
                                name="branchId"
                                value={formData.branchId}
                                onChange={handleChange}
                                required
                                sx={{
                                    color: '#EAECEF',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2d34' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FCD535' },
                                    '& .MuiSvgIcon-root': { color: '#EAECEF' } // Dropdown arrow color
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {branches.map((branch) => (
                                    <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
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
                            {editingDepartment ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default AdminDepartments;
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth'; // Assuming an auth hook to get the token
import API from '../../services/api';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#181a20', // Binance dark background
    border: '1px solid #2a2d34',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    color: '#EAECEF',
};

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [editingBranch, setEditingBranch] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth(); // Get token from assumed auth context

    const fetchBranches = async () => {
        try {
            setError(null);
            const response = await API.get('/admin/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(response.data);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
            setError(err.response?.data?.message || 'Failed to fetch branches.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchBranches();
        }
    }, [token]);

    const handleOpen = (branch = null) => {
        setError(null);
        if (branch) {
            setEditingBranch(branch);
            setFormData({ name: branch.name });
        } else {
            setEditingBranch(null);
            setFormData({ name: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingBranch(null);
        setFormData({ name: '' });
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingBranch) {
                await API.put(`/admin/branches/${editingBranch.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/admin/branches', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchBranches();
            handleClose();
        } catch (err) {
            console.error('Failed to save branch:', err);
            setError(err.response?.data?.message || 'Failed to save branch.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                setError(null);
                await API.delete(`/admin/branches/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchBranches();
            } catch (err) {
                console.error('Failed to delete branch:', err);
                setError(err.response?.data?.message || 'Failed to delete branch.');
            }
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Manage Branches
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
                Add Branch
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#2a1a1a', color: '#ff7777', border: '1px solid #ff0000' }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: '#181a20', border: '1px solid #2a2d34', borderRadius: '8px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="branches table">
                    <TableHead sx={{ bgcolor: '#0b0e11' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>ID</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Name</TableCell>
                            <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {branches.map((branch) => (
                            <TableRow
                                key={branch.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#2a2d34' }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>
                                    {branch.id}
                                </TableCell>
                                <TableCell sx={{ color: '#EAECEF', borderBottom: '1px solid #2a2d34' }}>{branch.name}</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #2a2d34' }}>
                                    <Button
                                        onClick={() => handleOpen(branch)}
                                        sx={{ color: '#FCD535', '&:hover': { bgcolor: 'rgba(252, 213, 53, 0.1)' } }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(branch.id)}
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
                        {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Branch Name"
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
                            {editingBranch ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default Branches;

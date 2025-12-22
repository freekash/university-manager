import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
    Typography, Box, Button, Paper, Modal, TextField, Alert,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import {
    Grid,
    Table,
    TableHeaderRow,
    PagingPanel,
    TableFilterRow,
    Toolbar,
    SearchPanel,
} from '@devexpress/dx-react-grid-material-ui';
import {
    SortingState,
    PagingState,
    IntegratedPaging,
    FilteringState,
    IntegratedFiltering,
    IntegratedSorting,
    SearchState,
} from '@devexpress/dx-react-grid';

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

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', branchId: '' });
    const [errorMessage, setErrorMessage] = useState(null);

    const [columns] = useState([
        { name: 'name', title: 'Name' },
        { name: 'branch', title: 'Branch' },
        { name: 'actions', title: 'Actions' },
    ]);

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/departments');
            const formattedDepartments = data.map(dep => ({
                ...dep,
                branch: dep.branch.name,
            }));
            setDepartments(formattedDepartments);
            setErrorMessage(null);
        } catch (error) {
            console.error('Failed to fetch departments', error);
            setErrorMessage(error.response?.data?.message || 'Failed to fetch departments.');
        }
    };

    const fetchBranches = async () => {
        try {
            const { data } = await API.get('/admin/branches');
            setBranches(data);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        }
    }

    useEffect(() => {
        fetchDepartments();
        fetchBranches();
    }, []);

    const handleOpen = () => {
        setFormData({ name: '', branchId: '' });
        setErrorMessage(null);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        try {
            await API.post('/admin/departments', { ...formData, branchId: parseInt(formData.branchId) });
            fetchDepartments();
            handleClose();
        } catch (error) {
            console.error('Failed to create department', error);
            setErrorMessage(error.response?.data?.message || 'Failed to create department.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await API.delete(`/admin/departments/${id}`);
                fetchDepartments();
            } catch (error) {
                console.error('Failed to delete department', error);
                setErrorMessage(error.response?.data?.message || 'Failed to delete department.');
            }
        }
    };

    const CellComponent = ({ row, column, ...restProps }) => {
        if (column.name === 'actions') {
            return (
                <Table.Cell {...restProps}>
                    <Button size="small" onClick={() => alert('Edit not implemented')}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </Table.Cell>
            );
        }
        return <Table.Cell {...restProps} />;
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#0b0e11', minHeight: '100vh', color: '#EAECEF' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FCD535' }}>
                Departments
            </Typography>
            <Button variant="contained" sx={{ mb: 2, bgcolor: '#FCD535', color: '#0b0e11', '&:hover': { bgcolor: '#e0c030' } }} onClick={handleOpen}>
                Add Department
            </Button>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: '#2a1a1a', color: '#ff7777' }}>
                    {errorMessage}
                </Alert>
            )}

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ color: '#FCD535', mb: 2 }}>
                        Add New Department
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} required InputLabelProps={{ sx: { color: '#6B7280' } }} sx={{ input: { color: '#EAECEF' } }} />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel sx={{ color: '#6B7280' }}>Branch</InputLabel>
                            <Select name="branchId" value={formData.branchId} onChange={handleChange} label="Branch" sx={{ color: '#EAECEF', '.MuiSvgIcon-root': { color: '#EAECEF' } }}>
                                {branches.map(branch => (
                                    <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#FCD535', color: '#0b0e11', '&:hover': { bgcolor: '#e0c030' } }}>Create</Button>
                    </form>
                </Box>
            </Modal>

            <Paper sx={{ mt: 4, bgcolor: '#181a20', color: '#EAECEF' }}>
                <Grid
                    rows={departments}
                    columns={columns}
                >
                    <PagingState
                        defaultCurrentPage={0}
                        pageSize={10}
                    />
                    <SortingState
                        defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
                    />
                     <FilteringState defaultFilters={[]} />
                    <SearchState />
                    
                    <IntegratedPaging />
                    <IntegratedSorting />
                    <IntegratedFiltering />

                    <Table cellComponent={CellComponent} />
                    <TableHeaderRow showSortingControls />
                    <TableFilterRow />
                    <Toolbar />
                    <SearchPanel />
                    <PagingPanel />
                </Grid>
            </Paper>
        </Box>
    );
};

export default Departments;
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

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', departmentId: '', semesterId: '' });
    const [errorMessage, setErrorMessage] = useState(null);

    const [columns] = useState([
        { name: 'name', title: 'Name' },
        { name: 'code', title: 'Code' },
        { name: 'department', title: 'Department' },
        { name: 'semester', title: 'Semester' },
        { name: 'actions', title: 'Actions' },
    ]);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses');
            const formattedCourses = data.map(course => ({
                ...course,
                department: course.department.name,
                semester: course.semester.name,
            }));
            setCourses(formattedCourses);
            setErrorMessage(null);
        } catch (error) {
            console.error('Failed to fetch courses', error);
            setErrorMessage(error.response?.data?.message || 'Failed to fetch courses.');
        }
    };
    
    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/departments');
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const handleOpen = () => {
        setFormData({ name: '', code: '', departmentId: '', semesterId: '' });
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
            await API.post('/courses', { ...formData, departmentId: parseInt(formData.departmentId), semesterId: parseInt(formData.semesterId) });
            fetchCourses();
            handleClose();
        } catch (error) {
            console.error('Failed to create course', error);
            setErrorMessage(error.response?.data?.message || 'Failed to create course.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await API.delete(`/courses/${id}`);
                fetchCourses();
            } catch (error) {
                console.error('Failed to delete course', error);
                setErrorMessage(error.response?.data?.message || 'Failed to delete course.');
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
                Courses
            </Typography>
            <Button variant="contained" sx={{ mb: 2, bgcolor: '#FCD535', color: '#0b0e11', '&:hover': { bgcolor: '#e0c030' } }} onClick={handleOpen}>
                Add Course
            </Button>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: '#2a1a1a', color: '#ff7777' }}>
                    {errorMessage}
                </Alert>
            )}

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ color: '#FCD535', mb: 2 }}>
                        Add New Course
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} required InputLabelProps={{ sx: { color: '#6B7280' } }} sx={{ input: { color: '#EAECEF' } }} />
                        <TextField label="Course Code" name="code" fullWidth margin="normal" onChange={handleChange} required InputLabelProps={{ sx: { color: '#6B7280' } }} sx={{ input: { color: '#EAECEF' } }} />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel sx={{ color: '#6B7280' }}>Department</InputLabel>
                            <Select name="departmentId" value={formData.departmentId} onChange={handleChange} label="Department" sx={{ color: '#EAECEF', '.MuiSvgIcon-root': { color: '#EAECEF' } }}>
                                {departments.map(dep => (
                                    <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField label="Semester ID" name="semesterId" fullWidth margin="normal" onChange={handleChange} required InputLabelProps={{ sx: { color: '#6B7280' } }} sx={{ input: { color: '#EAECEF' } }} />

                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#FCD535', color: '#0b0e11', '&:hover': { bgcolor: '#e0c030' } }}>Create</Button>
                    </form>
                </Box>
            </Modal>

            <Paper sx={{ mt: 4, bgcolor: '#181a20', color: '#EAECEF' }}>
                <Grid
                    rows={courses}
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

export default Courses;
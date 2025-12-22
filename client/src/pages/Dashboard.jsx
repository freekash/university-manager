import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { People, School, Business, Group } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 300 },
  { name: 'Mar', students: 500 },
  { name: 'Apr', students: 200 },
  { name: 'May', students: 700 },
  { name: 'Jun', students: 600 },
];

const cardData = [
  {
    title: 'Students',
    value: '1,234',
    icon: <People sx={{ fontSize: 40 }} />,
    link: '/students',
  },
  {
    title: 'Courses',
    value: '56',
    icon: <School sx={{ fontSize: 40 }} />,
    link: '/courses',
  },
  {
    title: 'Departments',
    value: '12',
    icon: <Business sx={{ fontSize: 40 }} />,
    link: '/departments',
  },
  {
    title: 'Faculty',
    value: '123',
    icon: <Group sx={{ fontSize: 40 }} />,
    link: '/faculty',
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the University Management System
      </Typography>
      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              component={Link}
              to={card.link}
              sx={{ textDecoration: 'none' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {card.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h5" component="div">
                      {card.value}
                    </Typography>
                    <Typography color="text.secondary">{card.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Student Enrollment
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import Projects from './Projects';
import Tasks from './Tasks';
import Team from './Team';
import ActivityLog from './ActivityLog';
import api from '../api';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Chip, LinearProgress, Avatar, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';

function Dashboard() {
  const [view, setView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  // Progress calculation
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.project?._id === projectId);
    if (!projectTasks.length) return 0;
    const done = projectTasks.filter(t => t.status === 'Done').length;
    return Math.round((done / projectTasks.length) * 100);
  };

  // Task status summary
  const statusSummary = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  // Upcoming deadlines (next 5 tasks by deadline)
  const upcoming = [...tasks]
    .filter(t => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      case 'To Do': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 3, 
          p: 4, 
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Welcome back, {user?.name}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user?.role} • Project Management Dashboard
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<LogoutIcon />} 
              onClick={handleLogout}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' }
              }}
            >
              Logout
            </Button>
          </Stack>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <DashboardIcon />
                  </Avatar>
                  <Typography variant="h6">Project Progress</Typography>
                </Stack>
                {projects.map(p => (
                  <Box key={p._id} mb={2}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{p.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">{getProjectProgress(p._id)}%</Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProjectProgress(p._id)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white'
                        }
                      }} 
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6">Task Status</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>To Do</Typography>
                    <Chip label={statusSummary['To Do'] || 0} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>In Progress</Typography>
                    <Chip label={statusSummary['In Progress'] || 0} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Done</Typography>
                    <Chip label={statusSummary['Done'] || 0} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h6">Upcoming Deadlines</Typography>
                </Stack>
                <Stack spacing={1}>
                  {upcoming.map(t => (
                    <Box key={t._id}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{t.title}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {t.deadline?.substr(0, 10)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Navigation */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', mb: 4 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant={view === 'projects' ? 'contained' : 'outlined'} 
                onClick={() => setView('projects')}
                startIcon={<DashboardIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  ...(view === 'projects' && {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #5a6fd8, #6a4190)' }
                  })
                }}
              >
                Projects
              </Button>
              <Button 
                variant={view === 'tasks' ? 'contained' : 'outlined'} 
                onClick={() => setView('tasks')}
                startIcon={<AssignmentIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  ...(view === 'tasks' && {
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #e085e8, #e54b5f)' }
                  })
                }}
              >
                Tasks
              </Button>
              <Button 
                variant={view === 'team' ? 'contained' : 'outlined'} 
                onClick={() => setView('team')}
                startIcon={<GroupIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  ...(view === 'team' && {
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #45a1f0, #00e6f0)' }
                  })
                }}
              >
                Team
              </Button>
              <Button 
                variant={view === 'activity' ? 'contained' : 'outlined'} 
                onClick={() => setView('activity')}
                startIcon={<TimelineIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  ...(view === 'activity' && {
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #3dd870, #32e6c8)' }
                  })
                }}
              >
                Activity Log
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {view === 'projects' && <Projects />}
            {view === 'tasks' && <Tasks />}
            {view === 'team' && <Team />}
            {view === 'activity' && <ActivityLog />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Dashboard;


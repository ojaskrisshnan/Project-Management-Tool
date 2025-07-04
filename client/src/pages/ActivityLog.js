import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Card, CardContent, Select, MenuItem, Stack, Alert, FormControl, InputLabel, Chip, Avatar } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'Admin';

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  const fetchLogs = async (type, id) => {
    setLoading(true);
    setLogs([]);
    setError('');
    try {
      const res = await api.get(`/activity-logs/${type}/${id}`);
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch activity logs');
    }
    setLoading(false);
  };

  if (!isAdmin) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h5" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Only Admin can view activity logs.
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Activity Log
        </Typography>
        <Chip 
          label="Admin Only" 
          color="success" 
          variant="outlined"
          icon={<TimelineIcon />}
        />
      </Stack>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" color="primary">
              Filter Activities
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="project-label">Select Project</InputLabel>
              <Select
                labelId="project-label"
                value={selectedProject}
                label="Select Project"
                onChange={e => { setSelectedProject(e.target.value); setSelectedTask(''); if (e.target.value) fetchLogs('project', e.target.value); }}
                variant="outlined"
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="task-label">Select Task</InputLabel>
              <Select
                labelId="task-label"
                value={selectedTask}
                label="Select Task"
                onChange={e => { setSelectedTask(e.target.value); setSelectedProject(''); if (e.target.value) fetchLogs('task', e.target.value); }}
                variant="outlined"
              >
                <MenuItem value="">All Tasks</MenuItem>
                {tasks.map(t => <MenuItem key={t._id} value={t._id}>{t.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading activity logs...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : logs.length === 0 ? (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Activity Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a project or task to view activity logs.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {logs.map((log, index) => (
            <Card key={log._id} sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="flex-start" spacing={3}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48
                  }}>
                    {log.user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {log.user?.name || 'Unknown User'}
                      </Typography>
                      <Chip 
                        label={log.user?.role || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </Stack>
                    
                    <Typography variant="body1" color="text.primary" mb={1}>
                      {log.action}
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ActivityLog; 
import React, { useEffect, useState } from 'react';
import api from '../api';
import { fetchUsers } from '../api/user';
import { Box, Typography, Button, Card, CardContent, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Stack, Chip, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', team: [] });
  const [editId, setEditId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'Admin';
  const isManager = user && user.role === 'Manager';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to fetch projects');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers().then(setUsers);
  }, []);

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'team' && options) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm({ ...form, team: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setShowForm(false);
      setForm({ name: '', description: '', deadline: '', team: [] });
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleEdit = (project) => {
    setEditId(project._id);
    setForm({
      name: project.name,
      description: project.description,
      deadline: project.deadline ? project.deadline.substr(0, 10) : '',
      team: project.team.map(u => u._id),
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editId}`, form);
      setEditId(null);
      setShowForm(false);
      setForm({ name: '', description: '', deadline: '', team: [] });
      fetchProjects();
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Not Started': return 'info';
      default: return 'default';
    }
  };

  const visibleProjects = isAdmin ? projects : projects.filter(p => p.team.some(u => u._id === user.id));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Projects
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', deadline: '', team: [] }); }}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #5a6fd8, #6a4190)' }
            }}
          >
            {showForm ? 'Cancel' : 'New Project'}
          </Button>
        )}
      </Stack>

      {showForm && isAdmin && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" mb={3} color="primary">
              {editId ? 'Edit Project' : 'Create New Project'}
            </Typography>
            <Box component="form" onSubmit={editId ? handleUpdate : handleCreate}>
              <Stack spacing={3}>
                <TextField 
                  name="name" 
                  label="Project Name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  name="description" 
                  label="Description" 
                  value={form.description} 
                  onChange={handleChange} 
                  fullWidth 
                  variant="outlined"
                  multiline
                  rows={3}
                />
                <TextField 
                  name="deadline" 
                  label="Deadline" 
                  type="date" 
                  value={form.deadline} 
                  onChange={handleChange} 
                  InputLabelProps={{ shrink: true }} 
                  fullWidth 
                  variant="outlined"
                />
                <FormControl fullWidth>
                  <InputLabel id="team-label">Team Members</InputLabel>
                  <Select
                    labelId="team-label"
                    name="team"
                    multiple
                    value={form.team}
                    onChange={handleChange}
                    renderValue={(selected) => selected.map(id => users.find(u => u._id === id)?.name).join(', ')}
                    variant="outlined"
                  >
                    {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>)}
                  </Select>
                </FormControl>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #5a6fd8, #6a4190)' }
                  }}
                >
                  {editId ? 'Update Project' : 'Create Project'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Stack spacing={3}>
          {visibleProjects.map((p) => {
            const canEditDelete = isAdmin || (isManager && p.team.some(u => u._id === user.id));
            return (
              <Card key={p._id} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Typography variant="h5" fontWeight="bold">{p.name}</Typography>
                        <Chip 
                          label={p.status} 
                          color={getStatusColor(p.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      
                      {p.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {p.description}
                        </Typography>
                      )}

                      <Stack direction="row" alignItems="center" spacing={3} mb={2}>
                        {p.deadline && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarTodayIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {p.deadline?.substr(0, 10)}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {p.team.length} members
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {p.team.map(u => (
                          <Chip 
                            key={u._id} 
                            label={u.name} 
                            size="small" 
                            variant="outlined"
                            avatar={<Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>{u.name[0]}</Avatar>}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      {canEditDelete && (
                        <Stack direction="row" spacing={1}>
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select 
                              value={p.status} 
                              onChange={async e => {
                                await api.put(`/projects/${p._id}`, { ...p, status: e.target.value });
                                fetchProjects();
                              }}
                              variant="outlined"
                            >
                              <MenuItem value="Not Started">Not Started</MenuItem>
                              <MenuItem value="In Progress">In Progress</MenuItem>
                              <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton 
                            onClick={() => handleEdit(p)} 
                            color="primary"
                            sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)' }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(p._id)} 
                            color="error"
                            sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default Projects; 
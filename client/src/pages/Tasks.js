import React, { useEffect, useState } from 'react';
import api from '../api';
import { fetchUsers } from '../api/user';
import { Box, Typography, Button, Card, CardContent, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', priority: 'Medium', deadline: '' });
  const [editId, setEditId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'Admin';
  const isManager = user && user.role === 'Manager';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    api.get('/projects').then(res => setProjects(res.data));
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
      await api.post('/tasks', form);
      setShowForm(false);
      setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'Medium', deadline: '' });
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.substr(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${editId}`, form);
      setEditId(null);
      setShowForm(false);
      setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'Medium', deadline: '' });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await api.get(`/comments/${taskId}`);
      setComments(res.data);
      setCommentTaskId(taskId);
      setShowComments(true);
    } catch (err) {
      alert('Failed to fetch comments');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/comments', { taskId: commentTaskId, content: newComment });
      setNewComment('');
      fetchComments(commentTaskId);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const canEditTask = (task) => isAdmin || (isManager && task.project?.team?.some(u => u._id === user.id));
  const canUpdateStatus = (task) => isAdmin || (isManager && task.project?.team?.some(u => u._id === user.id)) || (task.assignedTo?._id === user.id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      case 'To Do': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const visibleTasks = isAdmin ? tasks : isManager ? tasks.filter(t => t.project?.team?.some(u => u._id === user.id)) : tasks.filter(t => t.assignedTo?._id === user.id);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tasks
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'Medium', deadline: '' }); }}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #e085e8, #e54b5f)' }
            }}
          >
            {showForm ? 'Cancel' : 'New Task'}
          </Button>
        )}
      </Stack>

      {showForm && isAdmin && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" mb={3} color="primary">
              {editId ? 'Edit Task' : 'Create New Task'}
            </Typography>
            <Box component="form" onSubmit={editId ? handleUpdate : handleCreate}>
              <Stack spacing={3}>
                <TextField 
                  name="title" 
                  label="Task Title" 
                  value={form.title} 
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
                <FormControl fullWidth>
                  <InputLabel id="project-label">Project</InputLabel>
                  <Select
                    labelId="project-label"
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  >
                    <MenuItem value="">Select Project</MenuItem>
                    {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="assigned-label">Assign to</InputLabel>
                  <Select
                    labelId="assigned-label"
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    <MenuItem value="">Assign to</MenuItem>
                    {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
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
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #e085e8, #e54b5f)' }
                  }}
                >
                  {editId ? 'Update Task' : 'Create Task'}
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
          {visibleTasks.map((t) => (
            <Card key={t._id} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <Typography variant="h5" fontWeight="bold">{t.title}</Typography>
                      <Chip 
                        label={t.status} 
                        color={getStatusColor(t.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        label={t.priority} 
                        color={getPriorityColor(t.priority)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                    
                    {t.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {t.description}
                      </Typography>
                    )}

                    <Stack direction="row" alignItems="center" spacing={3} mb={2}>
                      {t.project && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FolderIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {t.project?.name}
                          </Typography>
                        </Stack>
                      )}
                      {t.assignedTo && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {t.assignedTo?.name}
                          </Typography>
                        </Stack>
                      )}
                      {t.deadline && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {t.deadline?.substr(0, 10)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {Array.isArray(t.project?.team) && t.project.team.map(u => (
                      <Chip 
                        key={u._id} 
                        label={u.name} 
                        size="small" 
                        variant="outlined"
                        avatar={<Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>{u.name ? u.name[0] : ''}</Avatar>}
                      />
                    ))}
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1}>
                      {canUpdateStatus(t) && (
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select 
                            value={t.status} 
                            onChange={async e => {
                              await api.put(`/tasks/${t._id}`, { ...t, status: e.target.value });
                              fetchTasks();
                            }}
                            variant="outlined"
                          >
                            <MenuItem value="To Do">To Do</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {canEditTask(t) && (
                        <IconButton 
                          onClick={() => handleEdit(t)} 
                          color="primary"
                          sx={{ bgcolor: 'rgba(240, 147, 251, 0.1)' }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canEditTask(t) && (
                        <IconButton 
                          onClick={() => handleDelete(t._id)} 
                          color="error"
                          sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => fetchComments(t._id)} 
                        color="info"
                        sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}
                      >
                        <CommentIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={showComments} onClose={() => setShowComments(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mb={3}>
            {comments.map(c => (
              <Card key={c._id} variant="outlined">
                <CardContent sx={{ py: 2, px: 3 }}>
                  <Typography variant="body2">{c.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    - {c.user?.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Box component="form" onSubmit={handleAddComment}>
            <Stack direction="row" spacing={2}>
              <TextField 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                label="Add comment" 
                required 
                fullWidth 
                variant="outlined"
              />
              <Button 
                type="submit" 
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #e085e8, #e54b5f)' }
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComments(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks; 
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Card, CardContent, Stack, Alert, Avatar, Chip, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';

function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <AdminPanelSettingsIcon />;
      case 'Manager': return <SupervisorAccountIcon />;
      case 'Developer': return <DeveloperModeIcon />;
      default: return <GroupIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'warning';
      case 'Developer': return 'info';
      default: return 'default';
    }
  };

  const getRoleGradient = (role) => {
    switch (role) {
      case 'Admin': return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
      case 'Manager': return 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)';
      case 'Developer': return 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Team Members
        </Typography>
        <Chip 
          label={`${users.length} members`} 
          color="primary" 
          variant="outlined"
          icon={<GroupIcon />}
        />
      </Stack>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {users.map((u) => (
            <Grid item xs={12} sm={6} md={4} key={u._id}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      fontSize: '2rem',
                      mx: 'auto',
                      mb: 2,
                      background: getRoleGradient(u.role),
                      color: 'white'
                    }}
                  >
                    {u.name[0].toUpperCase()}
                  </Avatar>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {u.name}
                  </Typography>
                  
                  <Chip 
                    label={u.role} 
                    color={getRoleColor(u.role)}
                    icon={getRoleIcon(u.role)}
                    sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      background: getRoleGradient(u.role),
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    {u.email}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Team; 
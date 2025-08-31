import { useAuth } from '@/hooks/useAuth';
import { Dashboard, Logout, VpnKey } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

interface HeaderProps {
  showAuthButtons?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showAuthButtons = false }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          Contacts App
        </Typography>
        
        {showAuthButtons ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => router.push('/register')}
            >
              Register
            </Button>
          </Box>
        ) : user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<VpnKey />}
              onClick={() => router.push('/api-keys')}
            >
              API Keys
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
              onClick={handleMenu}
            >
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </MenuItem>
              <MenuItem onClick={() => { router.push('/dashboard'); handleClose(); }}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => { router.push('/api-keys'); handleClose(); }}>
                <VpnKey sx={{ mr: 1 }} />
                API Keys
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
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
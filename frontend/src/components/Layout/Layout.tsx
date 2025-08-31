import { useAuth } from '@/hooks/useAuth';
import { Box, Container } from '@mui/material';
import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showAuthButtons?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showAuthButtons = false }) => {
  
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header showAuthButtons={showAuthButtons} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
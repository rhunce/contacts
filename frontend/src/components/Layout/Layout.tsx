import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  showAuthButtons?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showAuthButtons = false }) => {
  const { user } = useAuth();

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
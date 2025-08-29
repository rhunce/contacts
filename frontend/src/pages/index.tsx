import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout/Layout';
import { Person, Email, Phone } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  console.log('HomePage: Component rendered, current path:', router.pathname, 'user:', user);

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <Layout showAuthButtons>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Box>
            </Box>
            
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to Contacts
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Manage your contacts with ease and efficiency
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email />
                <Typography>Email Management</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone />
                <Typography>Phone Directory</Typography>
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/register')}
              sx={{ px: 4, py: 1.5 }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default HomePage;
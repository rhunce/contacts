import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import { useRouter } from 'next/router';
import { ArrowBack, History } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout/Layout';
import { contactService } from '@/services/contactService';
import { Contact, ContactHistory } from '@/types/contact';
import toast from 'react-hot-toast';

const ContactHistoryPage: React.FC = () => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [history, setHistory] = useState<ContactHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (id && typeof id === 'string') {
      loadContactAndHistory(id);
    }
  }, [user, id, router]);

  const loadContactAndHistory = async (contactId: string) => {
    try {
      setLoading(true);
      const [contactData, historyData] = await Promise.all([
        contactService.getContact(contactId),
        contactService.getContactHistory(contactId),
      ]);
      
      setContact(contactData.data);
      setHistory(historyData.data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load contact history');
      toast.error(error.message || 'Failed to load contact history');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'update':
        return 'primary';
      case 'delete':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Contact History
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : contact ? (
          <>
            {/* Contact Info Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      mr: 3,
                    }}
                  >
                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      {contact.firstName} {contact.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {contact.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {contact.phone}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* History List */}
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              History ({history.length} entries)
            </Typography>

            {history.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No history found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This contact has no history records yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {history.map((entry, index) => (
                  <Card key={entry.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={entry.action}
                            color={getActionColor(entry.action) as any}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {entry.fieldName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(entry.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          From:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                          {entry.oldValue || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          To:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                          {entry.newValue || 'N/A'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Alert severity="warning">
            Contact not found
          </Alert>
        )}
      </Box>
    </Layout>
  );
};

export default ContactHistoryPage;
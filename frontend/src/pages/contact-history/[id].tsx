import AuthGuard from '@/components/Layout/AuthGuard';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { contactService } from '@/services/contactService';
import { Contact, ContactHistory } from '@/types/contact';
import { ArrowBack, History } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const ContactHistoryPage: React.FC = () => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [history, setHistory] = useState<ContactHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // Show 20 entries per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadContactAndHistory(id);
    }
  }, [id]);

  const loadContactAndHistory = async (contactId: string) => {
    try {
      setLoading(true);
      const [contactData, historyData] = await Promise.all([
        contactService.getContact(contactId),
        contactService.getContactHistory(contactId, 1, pageSize, 'desc'),
      ]);
      setContact(contactData);

      // Extract items from paginated response
      setHistory(historyData?.data?.items || []);
      setTotalPages(historyData?.pagination?.totalPages || 1);
      setTotalItems(historyData?.pagination?.total || 0);
      setCurrentPage(1);
    } catch (error: any) {
      setError(error.message || 'Failed to load contact history');
      toast.error(error.message || 'Failed to load contact history');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (!id || typeof id !== 'string' || currentPage >= totalPages || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const historyData = await contactService.getContactHistory(id, nextPage, pageSize, 'desc');

      // Append new items to existing history
      setHistory(prev => [...prev, ...(historyData?.data?.items || [])]);
      setCurrentPage(nextPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load more history');
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AuthGuard requireAuth={true}>
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
              {/* Contact Info Card - Only show if contact has valid data */}
              {contact.firstName || contact.lastName || contact.email || contact.phone ? (
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
                        {(contact?.firstName?.charAt(0) || '')}{(contact?.lastName?.charAt(0) || '')}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                          {contact?.firstName || 'Unknown'} {contact?.lastName || ''}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {contact?.email || 'No email'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {contact?.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ) : null}

              {/* History List */}
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                History ({totalItems} total entries)
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
                  {history.map((entry, index) => {
                    // Get all changed fields for this entry
                    const changedFields = [
                      { field: 'firstName', change: entry.firstName },
                      { field: 'lastName', change: entry.lastName },
                      { field: 'email', change: entry.email },
                      { field: 'phone', change: entry.phone }
                    ].filter(item => item.change); // Only include fields that were changed

                    return (
                      <Card key={entry.id}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(entry.createdAt)}
                            </Typography>
                          </Box>

                          {changedFields.map(({ field, change }) => (
                            <Box key={field} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip
                                  label="Updated"
                                  color="primary"
                                  size="small"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                  {field}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  From:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                                  {change?.before || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  To:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                                  {change?.after || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>

              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {history.length} of {totalItems} entries
                  </Typography>

                  {currentPage < totalPages && (
                    <Button
                      variant="outlined"
                      onClick={loadMoreHistory}
                      disabled={loadingMore}
                      startIcon={loadingMore ? <CircularProgress size={16} /> : null}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  )}

                  {currentPage > 1 && (
                    <Typography variant="body2" color="text.secondary">
                      Page {currentPage} of {totalPages}
                    </Typography>
                  )}
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
    </AuthGuard>
  );
};

export default ContactHistoryPage;
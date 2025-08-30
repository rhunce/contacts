import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, VpnKey, CheckCircle, Warning, Search, Close, ContentCopy } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { apiKeyService } from '@/services/apiKeyService';
import { ApiKey } from '@/types/apiKey';
import Layout from '@/components/Layout/Layout';
import AuthGuard from '@/components/Layout/AuthGuard';
import ApiKeyCard from '@/components/ApiKeys/ApiKeyCard';
import CreateApiKeyModal from '@/components/ApiKeys/CreateApiKeyModal';
import { toast } from 'react-hot-toast';

const ApiKeysPage: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (data: any) => {
    try {
      const response = await apiKeyService.createApiKey(data);
      setApiKeys(prev => [response.info, ...prev]);
      setShowCreateModal(false);
      
      // Store the API key and show it in a modal
      setNewApiKey(response.apiKey);
      setShowKeyModal(true);
      
      toast.success('API key created successfully!');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      await apiKeyService.revokeApiKey(id);
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, isActive: false } : key
      ));
      toast.success('API key revoked successfully');
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyService.deleteApiKey(id);
      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast.success('API key deleted successfully');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleRestoreApiKey = async (id: string) => {
    try {
      await apiKeyService.restoreApiKey(id);
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, isActive: true } : key
      ));
      toast.success('API key restored successfully');
    } catch (error: any) {
      console.error('Error restoring API key:', error);
      toast.error('Failed to restore API key');
    }
  };

  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && key.isActive) ||
      (filterStatus === 'revoked' && !key.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const activeKeys = apiKeys.filter(key => key.isActive);
  const revokedKeys = apiKeys.filter(key => !key.isActive);

  return (
    <AuthGuard requireAuth={true}>
      <Layout>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  API Keys
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Manage your API keys for external integrations
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowCreateModal(true)}
                sx={{ px: 3 }}
              >
                Create New Key
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1, mr: 2 }}>
                      <VpnKey sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Keys
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {apiKeys.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'success.100', borderRadius: 1, mr: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Keys
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {activeKeys.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'warning.100', borderRadius: 1, mr: 2 }}>
                      <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Revoked Keys
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {revokedKeys.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    placeholder="Search API keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <MenuItem value="all">All Keys</MenuItem>
                      <MenuItem value="active">Active Only</MenuItem>
                      <MenuItem value="revoked">Revoked Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* API Keys List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredApiKeys.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <VpnKey sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No API keys found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first API key.'
                }
              </Typography>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create API Key
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredApiKeys.map((apiKey) => (
                <ApiKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  onRevoke={handleRevokeApiKey}
                  onDelete={handleDeleteApiKey}
                  onRestore={handleRestoreApiKey}
                />
              ))}
            </Box>
          )}

          {/* Create API Key Modal */}
          {showCreateModal && (
            <CreateApiKeyModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateApiKey}
            />
          )}

          {/* API Key Display Modal */}
          {showKeyModal && (
            <Dialog
              open={showKeyModal}
              onClose={() => setShowKeyModal(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">🔑 Your New API Key</Typography>
                  <IconButton onClick={() => setShowKeyModal(false)} size="small">
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> This is the only time you'll see this API key. 
                    Make sure to copy it and store it securely.
                  </Typography>
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    API Key:
                  </Typography>
                  <TextField
                    fullWidth
                    value={newApiKey}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(newApiKey);
                    toast.success('API key copied to clipboard!');
                  }}
                  variant="contained"
                  startIcon={<ContentCopy />}
                >
                  Copy to Clipboard
                </Button>
                <Button onClick={() => setShowKeyModal(false)}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      </Layout>
    </AuthGuard>
  );
};

export default ApiKeysPage;

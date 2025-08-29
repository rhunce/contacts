import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import Layout from '@/components/Layout/Layout';
import AuthGuard from '@/components/Layout/AuthGuard';
import ContactCard from '@/components/Contacts/ContactCard';
import AddContactModal from '@/components/Contacts/AddContactModal';
import DeleteContactModal from '@/components/Contacts/DeleteContactModal';
import EditContactModal from '@/components/Contacts/EditContactModal';
import { Contact } from '@/types/contact';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  
  const {
    contacts,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isUpdating,
    isDeleting,
  } = useContacts(selectedFilter === 'all' ? undefined : selectedFilter);

  const handleAddContact = async (contactData: any) => {
    try {
      await createContact(contactData);
      setShowAddModal(false);
      toast.success('Contact created successfully!');
    } catch (error: any) {
      // Re-throw the error so the modal can handle it
      throw error;
    }
  };

  const handleEditContact = async (contactData: any) => {
    if (!selectedContact) return;
    
    try {
      await updateContact({ id: selectedContact.id, data: contactData });
      setShowEditModal(false);
      setSelectedContact(null);
      toast.success('Contact updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact');
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    try {
      await deleteContact(selectedContact.id);
      setShowDeleteModal(false);
      setSelectedContact(null);
      toast.success('Contact deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact');
    }
  };

  const alphabetFilters = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  return (
    <AuthGuard requireAuth={true}>
      <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Contacts
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddModal(true)}
            sx={{ px: 3 }}
          >
            Add Contact
          </Button>
        </Box>

        {/* Alphabet Filters */}
        <div style={{ marginBottom: 24, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
            {alphabetFilters.map((filter) => (
              <Chip
                key={filter}
                label={filter === 'all' ? 'All' : filter}
                onClick={() => setSelectedFilter(filter)}
                color={selectedFilter === filter ? 'primary' : 'default'}
                variant={selectedFilter === filter ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load contacts
          </Alert>
        ) : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !contacts || contacts.length === 0 || contacts.every(contact => !contact) ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No contacts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedFilter === 'all' 
                ? 'Get started by adding your first contact'
                : `No contacts found starting with "${selectedFilter}"`
              }
            </Typography>
            {selectedFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddModal(true)}
                sx={{ mt: 2 }}
              >
                Add Your First Contact
              </Button>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: '70vh',
              overflowY: 'auto',
              pr: 1,
            }}
          >
            <Grid container spacing={3}>
              {contacts?.filter(contact => contact && contact.id).map((contact) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                  <ContactCard
                    contact={contact}
                    onEdit={(contact) => {
                      setSelectedContact(contact);
                      setShowEditModal(true);
                    }}
                    onDelete={(contact) => {
                      setSelectedContact(contact);
                      setShowDeleteModal(true);
                    }}
                    onViewHistory={(contact) => {
                      if (contact?.id) {
                        router.push(`/contact-history/${contact.id}`);
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            
            {isFetchingNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Modals */}
      <AddContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddContact}
        loading={isCreating}
      />

      <EditContactModal
        open={showEditModal}
        contact={selectedContact}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContact(null);
        }}
        onSubmit={handleEditContact}
        loading={isUpdating}
      />

      <DeleteContactModal
        open={showDeleteModal}
        contact={selectedContact}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDeleteContact}
        loading={isDeleting}
      />
      </Layout>
    </AuthGuard>
  );
};

export default DashboardPage;
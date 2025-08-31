import { contactService } from '@/services/contactService';
import { SSEEvent, sseService } from '@/services/sseService';
import { Contact, CreateContactRequest, UpdateContactRequest } from '@/types/contact';
import { useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';

export const useContacts = (filter?: string) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery(
    ['contacts', filter],
    ({ pageParam = 1 }) => contactService.getContacts(pageParam, 20, filter),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data.pagination.page < lastPage.data.pagination.totalPages) {
          return lastPage.data.pagination.page + 1;
        }
        return undefined;
      },
    }
  );

  const createContactMutation = useMutation(
    (contactData: CreateContactRequest) => contactService.createContact(contactData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
      },
    }
  );

  const updateContactMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateContactRequest }) =>
      contactService.updateContact(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
      },
    }
  );

  const deleteContactMutation = useMutation(
    (id: string) => contactService.deleteContact(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allContacts = data?.pages.flatMap(page => page.data.items) || [];

  // SSE integration for real-time updates
  useEffect(() => {
    const handleSSEEvent = (event: SSEEvent) => {
      switch (event.type) {
        case 'contact:created':
          // Add new contact to the cache
          queryClient.setQueryData(['contacts', filter], (oldData: any) => {
            if (!oldData) return oldData;
            
            const newContact = event.data;
            const updatedPages = oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                // Add to first page
                return {
                  ...page,
                  data: {
                    ...page.data,
                    items: [newContact, ...page.data.items]
                  }
                };
              }
              return page;
            });
            
            return {
              ...oldData,
              pages: updatedPages
            };
          });
          break;

        case 'contact:updated':
          // Update existing contact in the cache
          queryClient.setQueryData(['contacts', filter], (oldData: any) => {
            if (!oldData) return oldData;
            
            const updatedContact = event.data;
            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.map((contact: Contact) =>
                  contact.id === updatedContact.id ? updatedContact : contact
                )
              }
            }));
            
            return {
              ...oldData,
              pages: updatedPages
            };
          });
          break;

        case 'contact:deleted':
          // Remove contact from the cache
          queryClient.setQueryData(['contacts', filter], (oldData: any) => {
            if (!oldData) return oldData;
            
            const deletedContactId = event.data.id;
            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.filter((contact: Contact) => contact.id !== deletedContactId)
              }
            }));
            
            return {
              ...oldData,
              pages: updatedPages
            };
          });
          break;

        case 'connected':
          console.log('SSE connected:', event.message);
          break;
      }
    };

    // Connect to SSE
    sseService.connect(handleSSEEvent);

    // Cleanup on unmount
    return () => {
      sseService.disconnect();
    };
  }, [queryClient, filter]);

  return {
    contacts: allContacts,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    createContact: createContactMutation.mutateAsync,
    updateContact: updateContactMutation.mutateAsync,
    deleteContact: deleteContactMutation.mutateAsync,
    isCreating: createContactMutation.isLoading,
    isUpdating: updateContactMutation.isLoading,
    isDeleting: deleteContactMutation.isLoading,
    refetch
  };
};
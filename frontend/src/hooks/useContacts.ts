import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { contactService } from '@/services/contactService';
import { Contact, CreateContactRequest, UpdateContactRequest } from '@/types/contact';

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
'use client';

import { useState, useCallback } from 'react';
import { Plus, Upload, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ImportModal } from '@/components/contacts/ImportModal';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContacts, useCreateContact, useDeleteContacts } from '@/hooks/useContacts';
import { useLists, useAddContactsToList } from '@/hooks/useLists';
import { ContactFormData } from '@/lib/utils/validators';

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [addToListIds, setAddToListIds] = useState<string[]>([]);
  const [selectedListId, setSelectedListId] = useState('');

  const { data: contactsData, isLoading } = useContacts({ page, pageSize: 25, search, status: statusFilter || undefined });
  const { data: lists } = useLists();
  const createContact = useCreateContact();
  const deleteContacts = useDeleteContacts();
  const addToList = useAddContactsToList();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCreate = (data: ContactFormData) => {
    createContact.mutate(data, {
      onSuccess: () => setShowCreateForm(false),
    });
  };

  const handleDelete = () => {
    deleteContacts.mutate(deleteIds, {
      onSuccess: () => setDeleteIds([]),
    });
  };

  const handleAddToList = () => {
    if (selectedListId) {
      addToList.mutate({ listId: selectedListId, contactIds: addToListIds }, {
        onSuccess: () => { setAddToListIds([]); setSelectedListId(''); },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kontaktit</h1>
          <p className="text-muted-foreground">
            Hallitse kontaktejasi
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Tuo CSV
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Lisää kontakti
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchInput placeholder="Hae kontakteja..." onChange={handleSearch} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kaikki tilat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki tilat</SelectItem>
            <SelectItem value="subscribed">Tilaajat</SelectItem>
            <SelectItem value="unsubscribed">Peruuttaneet</SelectItem>
            <SelectItem value="bounced">Virheet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : contactsData && contactsData.data.length > 0 ? (
        <>
          <ContactsTable
            contacts={contactsData.data}
            onDelete={(ids) => setDeleteIds(ids)}
            onAddToList={(ids) => setAddToListIds(ids)}
          />
          <Pagination
            currentPage={contactsData.page ?? 1}
            totalPages={contactsData.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="Ei kontakteja"
          description="Aloita lisäämällä ensimmäinen kontakti tai tuomalla CSV-tiedosto."
          actionLabel="Lisää kontakti"
          onAction={() => setShowCreateForm(true)}
        />
      )}

      {/* Create contact dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lisää kontakti</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            loading={createContact.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Import modal */}
      <ImportModal open={showImport} onOpenChange={setShowImport} />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => { if (!open) setDeleteIds([]); }}
        title="Poista kontaktit"
        description={`Haluatko varmasti poistaa ${deleteIds.length} kontaktia? Tätä toimintoa ei voi perua.`}
        confirmLabel="Poista"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteContacts.isPending}
      />

      {/* Add to list dialog */}
      <Dialog open={addToListIds.length > 0} onOpenChange={(open) => { if (!open) { setAddToListIds([]); setSelectedListId(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lisää listalle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger>
                <SelectValue placeholder="Valitse lista" />
              </SelectTrigger>
              <SelectContent>
                {lists?.map((list) => (
                  <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setAddToListIds([]); setSelectedListId(''); }}>Peruuta</Button>
              <Button onClick={handleAddToList} disabled={!selectedListId || addToList.isPending}>
                {addToList.isPending ? 'Lisätään...' : `Lisää ${addToListIds.length} kontaktia`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

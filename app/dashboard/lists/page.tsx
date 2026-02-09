'use client';

import { useState } from 'react';
import { Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListCard } from '@/components/lists/ListCard';
import { ListForm } from '@/components/lists/ListForm';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useLists, useCreateList, useUpdateList, useDeleteList } from '@/hooks/useLists';
import { ContactList } from '@/types';
import { ContactListFormData } from '@/lib/utils/validators';

export default function ListsPage() {
  const { data: lists, isLoading } = useLists();
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState<ContactList | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = (data: ContactListFormData) => {
    createList.mutate(data, { onSuccess: () => setShowCreate(false) });
  };

  const handleEdit = (data: ContactListFormData) => {
    if (editingList) {
      updateList.mutate({ id: editingList.id, ...data }, {
        onSuccess: () => setEditingList(null),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteList.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listat</h1>
          <p className="text-muted-foreground">Ryhmittele kontaktejasi listoihin</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Luo lista
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onEdit={setEditingList}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={List}
          title="Ei listoja"
          description="Luo ensimmäinen lista kontaktiesi ryhmittelyyn"
          actionLabel="Luo lista"
          onAction={() => setShowCreate(true)}
        />
      )}

      {/* Create list dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Luo uusi lista</DialogTitle>
          </DialogHeader>
          <ListForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={createList.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit list dialog */}
      <Dialog open={!!editingList} onOpenChange={(open) => { if (!open) setEditingList(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Muokkaa listaa</DialogTitle>
          </DialogHeader>
          {editingList && (
            <ListForm
              defaultValues={{ name: editingList.name, description: editingList.description || '', color: editingList.color }}
              onSubmit={handleEdit}
              onCancel={() => setEditingList(null)}
              loading={updateList.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Poista lista"
        description="Haluatko varmasti poistaa tämän listan? Kontakteja ei poisteta."
        confirmLabel="Poista"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteList.isPending}
      />
    </div>
  );
}

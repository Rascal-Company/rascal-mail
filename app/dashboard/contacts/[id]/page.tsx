'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Building2, Phone, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactForm } from '@/components/contacts/ContactForm';
import { TagBadge } from '@/components/contacts/TagBadge';
import { useContact, useUpdateContact } from '@/hooks/useContacts';
import { formatDate } from '@/lib/utils/formatters';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useState } from 'react';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  subscribed: 'Tilaaja',
  unsubscribed: 'Peruuttanut',
  bounced: 'Virhe',
  complained: 'Valittanut',
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: contact, isLoading } = useContact(id);
  const updateContact = useUpdateContact();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return <p>Kontaktia ei löytynyt</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {contact.first_name || contact.last_name
              ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
              : contact.email}
          </h1>
          <p className="text-muted-foreground">{contact.email}</p>
        </div>
        <Badge variant={contact.status === 'subscribed' ? 'success' : 'secondary'}>
          {statusLabels[contact.status]}
        </Badge>
        <Button variant="outline" onClick={() => setEditing(!editing)}>
          {editing ? 'Peruuta' : 'Muokkaa'}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Muokkaa kontaktia</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm
              defaultValues={{
                email: contact.email,
                first_name: contact.first_name || '',
                last_name: contact.last_name || '',
                company: contact.company || '',
                phone: contact.phone || '',
                tags: contact.tags,
              }}
              onSubmit={(data) => {
                updateContact.mutate({ id, ...data }, {
                  onSuccess: () => setEditing(false),
                });
              }}
              onCancel={() => setEditing(false)}
              loading={updateContact.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Yhteystiedot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Lisätty {formatDate(contact.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tagit</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Ei tageja</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

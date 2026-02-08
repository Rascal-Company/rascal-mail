'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useList, useListContacts } from '@/hooks/useLists';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatDate, formatNumber } from '@/lib/utils/formatters';
import Link from 'next/link';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: list, isLoading: listLoading } = useList(id);
  const { data: contacts, isLoading: contactsLoading } = useListContacts(id);

  if (listLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!list) return <p>Listaa ei löytynyt</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: list.color }} />
          <h1 className="text-3xl font-bold">{list.name}</h1>
        </div>
        <Badge variant="secondary">
          <Users className="mr-1 h-3 w-3" />
          {formatNumber(list.contact_count)} kontaktia
        </Badge>
      </div>

      {list.description && (
        <p className="text-muted-foreground">{list.description}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kontaktit</CardTitle>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : contacts && contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sähköposti</TableHead>
                  <TableHead>Etunimi</TableHead>
                  <TableHead>Sukunimi</TableHead>
                  <TableHead>Yritys</TableHead>
                  <TableHead>Tila</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Link href={`/dashboard/contacts/${contact.id}`} className="text-primary hover:underline">
                        {contact.email}
                      </Link>
                    </TableCell>
                    <TableCell>{contact.first_name}</TableCell>
                    <TableCell>{contact.last_name}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Badge variant={contact.status === 'subscribed' ? 'success' : 'secondary'}>
                        {contact.status === 'subscribed' ? 'Tilaaja' : contact.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Ei kontakteja tällä listalla</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

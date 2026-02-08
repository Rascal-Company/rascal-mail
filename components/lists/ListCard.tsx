'use client';

import { Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContactList } from '@/types';
import { formatNumber } from '@/lib/utils/formatters';
import Link from 'next/link';

interface ListCardProps {
  list: ContactList;
  onEdit: (list: ContactList) => void;
  onDelete: (id: string) => void;
}

export function ListCard({ list, onEdit, onDelete }: ListCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link href={`/dashboard/lists/${list.id}`} className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
            {list.name}
          </CardTitle>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(list)}>
              <Pencil className="mr-2 h-4 w-4" />
              Muokkaa
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(list.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Poista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Link href={`/dashboard/lists/${list.id}`}>
          {list.description && (
            <p className="text-sm text-muted-foreground mb-3">{list.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{formatNumber(list.contact_count)} kontaktia</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

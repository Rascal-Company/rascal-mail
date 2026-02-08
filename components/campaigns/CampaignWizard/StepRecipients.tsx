'use client';

import { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { useLists } from '@/hooks/useLists';
import { CampaignWizardData } from '@/types';
import { formatNumber } from '@/lib/utils/formatters';

interface Props {
  data: Partial<CampaignWizardData>;
  onUpdate: (updates: Partial<CampaignWizardData>) => void;
}

export function StepRecipients({ data, onUpdate }: Props) {
  const { data: lists, isLoading } = useLists();

  const selectedIds = data.listIds || [];

  const toggleList = (listId: string) => {
    const newIds = selectedIds.includes(listId)
      ? selectedIds.filter((id) => id !== listId)
      : [...selectedIds, listId];
    onUpdate({ listIds: newIds });
  };

  useEffect(() => {
    if (lists) {
      const total = lists
        .filter((l) => selectedIds.includes(l.id))
        .reduce((sum, l) => sum + l.contact_count, 0);
      onUpdate({ totalRecipients: total });
    }
  }, [selectedIds, lists]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium mb-2">Valitse vastaanottajalistat</h3>
        <p className="text-sm text-muted-foreground">
          Peruuttaneet ja virheelliset osoitteet jätetään automaattisesti pois.
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Ladataan listoja...</p>
        ) : lists && lists.length > 0 ? (
          lists.map((list) => (
            <label
              key={list.id}
              className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors"
            >
              <Checkbox
                checked={selectedIds.includes(list.id)}
                onCheckedChange={() => toggleList(list.id)}
              />
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
              <div className="flex-1">
                <p className="font-medium">{list.name}</p>
                {list.description && (
                  <p className="text-sm text-muted-foreground">{list.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {formatNumber(list.contact_count)}
              </div>
            </label>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Ei listoja. Luo ensin lista kontakteillesi.
          </p>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-lg font-semibold">
            Vastaanottajia yhteensä: {formatNumber(data.totalRecipients || 0)}
          </p>
        </div>
      )}
    </div>
  );
}

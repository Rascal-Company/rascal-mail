'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignWizardData } from '@/types';
import { formatNumber } from '@/lib/utils/formatters';
import { useLists } from '@/hooks/useLists';

interface Props {
  data: Partial<CampaignWizardData>;
}

export function StepReview({ data }: Props) {
  const { data: lists } = useLists();
  const selectedLists = lists?.filter((l) => data.listIds?.includes(l.id)) || [];

  return (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-medium">Tarkista kampanjan tiedot</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perustiedot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kampanjan nimi</span>
            <span className="font-medium">{data.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aihe</span>
            <span className="font-medium">{data.subject || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lähettäjä</span>
            <span className="font-medium">{data.fromName} &lt;{data.fromEmail}&gt;</span>
          </div>
          {data.replyTo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vastausosoite</span>
              <span className="font-medium">{data.replyTo}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sisältö</CardTitle>
        </CardHeader>
        <CardContent>
          {data.htmlContent ? (
            <Badge variant="success">Sisältö valmis</Badge>
          ) : (
            <Badge variant="destructive">Sisältö puuttuu</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vastaanottajat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedLists.map((list) => (
              <Badge key={list.id} variant="outline">
                <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: list.color }} />
                {list.name} ({formatNumber(list.contact_count)})
              </Badge>
            ))}
          </div>
          <p className="font-semibold">
            Yhteensä: {formatNumber(data.totalRecipients || 0)} vastaanottajaa
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lähetys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {data.sendNow ? 'Lähetä heti' : `Ajastettu: ${data.scheduledAt || '-'}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

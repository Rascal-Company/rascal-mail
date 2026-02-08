'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/hooks/useOrganization';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SenderSettingsPage() {
  const { currentOrg } = useOrganization();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Lähettäjän asetukset</h1>
        <p className="text-muted-foreground">Domain-varmennus ja lähettäjän tila</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SendGrid-varmennus</CardTitle>
          <CardDescription>Domainin vahvistaminen parantaa sähköpostien toimitettavuutta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Domain-varmennus</p>
              <p className="text-sm text-muted-foreground">
                {currentOrg?.from_email ? `Domain: ${currentOrg.from_email.split('@')[1]}` : 'Ei lähettäjäosoitetta asetettu'}
              </p>
            </div>
            {currentOrg?.sendgrid_verified ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Varmennettu
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Ei varmennettu
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Domain-varmennus tehdään SendGrid-hallintapaneelissa. Lisää tarvittavat DNS-tietueet domainillesi ja merkitse varmennus tehdyksi.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Crown, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization } from '@/hooks/useOrganization';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/useToast';
import { OrgMember } from '@/types';
import { formatDate } from '@/lib/utils/formatters';

const roleLabels: Record<string, string> = {
  owner: 'Omistaja',
  admin: 'Ylläpitäjä',
  member: 'Jäsen',
};

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

export default function TeamPage() {
  const { currentOrg } = useOrganization();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => {
    if (currentOrg) {
      fetchMembers();
    }
  }, [currentOrg]);

  const fetchMembers = async () => {
    if (!currentOrg) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('org_members')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .order('created_at');
    setMembers(data || []);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!currentOrg || !inviteEmail) return;
    toast({ title: 'Kutsu lähetetty', description: `Kutsu lähetetty osoitteeseen ${inviteEmail}` });
    setShowInvite(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tiimi</h1>
          <p className="text-muted-foreground">Hallitse organisaation jäseniä</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Kutsu jäsen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jäsenet</CardTitle>
          <CardDescription>Organisaation nykyiset jäsenet ja roolit</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sähköposti</TableHead>
                <TableHead>Rooli</TableHead>
                <TableHead>Liittynyt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role] || User;
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {roleLabels[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kutsu jäsen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nimi@yritys.fi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rooli</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Ylläpitäjä</SelectItem>
                  <SelectItem value="member">Jäsen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInvite(false)}>Peruuta</Button>
              <Button onClick={handleInvite}>Lähetä kutsu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAuthClient, createDataClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/useToast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authClient = createAuthClient();
  const dataClient = createDataClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up via Rascal AI auth
      const { data, error } = await authClient.auth.signUp({ email, password });
      if (error) {
        toast({ title: 'Rekisteröinti epäonnistui', description: error.message, variant: 'destructive' });
        return;
      }

      if (data.user) {
        // Create organization in Rascal Mail database
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const { data: org, error: orgError } = await dataClient
          .from('organizations')
          .insert({ name: orgName, slug })
          .select()
          .single();

        if (org && !orgError) {
          await dataClient.from('org_members').insert({
            user_id: data.user.id,
            email: email,
            organization_id: org.id,
            role: 'owner',
          });
        }

        toast({ title: 'Tili luotu!', description: 'Voit nyt kirjautua sisään' });
        router.push('/login');
      }
    } catch {
      toast({ title: 'Virhe', description: 'Yhteysongelma, yritä uudelleen', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Luo tili</CardTitle>
        <CardDescription>Aloita sähköpostimarkkinointi tänään</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organisaation nimi</Label>
            <Input
              id="orgName"
              placeholder="Yritys Oy"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Sähköposti</Label>
            <Input
              id="email"
              type="email"
              placeholder="nimi@yritys.fi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Salasana</Label>
            <Input
              id="password"
              type="password"
              placeholder="Vähintään 6 merkkiä"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Luodaan tiliä...' : 'Rekisteröidy'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Onko sinulla jo tili?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Kirjaudu sisään
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

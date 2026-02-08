'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAuthClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/useToast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createAuthClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Kirjautuminen epäonnistui', description: error.message, variant: 'destructive' });
      } else {
        router.push('/dashboard');
        router.refresh();
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
        <CardTitle className="text-2xl">Rascal Mail</CardTitle>
        <CardDescription>Kirjaudu sisään tilillesi</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Ei tiliä?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Rekisteröidy
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

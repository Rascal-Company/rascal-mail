'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contactSchema, type ContactFormData } from '@/lib/utils/validators';

interface ContactFormProps {
  defaultValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ContactForm({ defaultValues, onSubmit, onCancel, loading }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      company: '',
      phone: '',
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Sähköposti *</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Etunimi</Label>
          <Input id="first_name" {...register('first_name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Sukunimi</Label>
          <Input id="last_name" {...register('last_name')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Yritys</Label>
          <Input id="company" {...register('company')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Puhelin</Label>
          <Input id="phone" type="tel" {...register('phone')} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Peruuta
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Tallennetaan...' : 'Tallenna'}
        </Button>
      </div>
    </form>
  );
}

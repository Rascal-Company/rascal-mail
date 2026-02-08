'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactListSchema, type ContactListFormData } from '@/lib/utils/validators';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#e11d48', '#4f46e5'];

interface ListFormProps {
  defaultValues?: Partial<ContactListFormData>;
  onSubmit: (data: ContactListFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ListForm({ defaultValues, onSubmit, onCancel, loading }: ListFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactListFormData>({
    resolver: zodResolver(contactListSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#2563eb',
      ...defaultValues,
    },
  });

  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nimi *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Kuvaus</Label>
        <Textarea id="description" {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label>Väri</Label>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setValue('color', color)}
            />
          ))}
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

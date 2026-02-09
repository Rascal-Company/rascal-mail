'use client';

import { useState } from 'react';
import { ImportModal } from '@/components/contacts/ImportModal';
import { useEffect } from 'react';

export default function ImportPage() {
  const [open, setOpen] = useState(true);

  return <ImportModal open={open} onOpenChange={setOpen} />;
}

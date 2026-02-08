'use client';

import React, { useRef } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { Button } from '@/components/ui/button';

interface Props {
  initialDesign?: object;
  onSave: (html: string, design: object) => void;
  onCancel?: () => void;
}

const MERGE_TAGS = [
  { name: 'Etunimi', value: '{{first_name}}' },
  { name: 'Sukunimi', value: '{{last_name}}' },
  { name: 'Sähköposti', value: '{{email}}' },
  { name: 'Yritys', value: '{{company}}' },
  { name: 'Peruutuslinkki', value: '{{unsubscribe_url}}' },
];

export function UnlayerEditor({ initialDesign, onSave, onCancel }: Props) {
  const editorRef = useRef<EditorRef>(null);

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    if (initialDesign) {
      unlayer.loadDesign(initialDesign as any);
    }
  };

  const handleSave = () => {
    editorRef.current?.editor?.exportHtml((data: { html: string; design: object }) => {
      const { html, design } = data;
      onSave(html, design);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 border rounded-lg overflow-hidden">
        <EmailEditor
          ref={editorRef}
          onReady={onReady}
          options={{
            locale: 'fi-FI',
            appearance: {
              theme: 'light',
              panels: {
                tools: { dock: 'left' },
              },
            },
            features: {
              textEditor: {
                spellChecker: true,
              },
            },
            mergeTags: MERGE_TAGS,
            tools: {
              button: { enabled: true },
              divider: { enabled: true },
              heading: { enabled: true },
              html: { enabled: true },
              image: { enabled: true },
              menu: { enabled: true },
              social: { enabled: true },
              text: { enabled: true },
              video: { enabled: true },
            },
          }}
        />
      </div>
      <div className="flex justify-end gap-3 mt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Peruuta
          </Button>
        )}
        <Button onClick={handleSave}>Tallenna</Button>
      </div>
    </div>
  );
}

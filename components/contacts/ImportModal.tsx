"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import type { ImportResult } from "@/types";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_OPTIONS = [
  { value: "skip", label: "Ohita" },
  { value: "email", label: "Sähköposti" },
  { value: "first_name", label: "Etunimi" },
  { value: "last_name", label: "Sukunimi" },
];

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      setFile(selectedFile);
      setResult(null);

      Papa.parse(selectedFile, {
        preview: 6,
        complete: (results) => {
          const rows = results.data as string[][];
          if (rows.length > 0) {
            setHeaders(rows[0]);
            setPreview(rows.slice(1, 6));
            // Auto-map columns
            const autoMap: Record<number, string> = {};
            rows[0].forEach((header, index) => {
              const lower = header.toLowerCase().trim();
              if (lower.includes("email") || lower.includes("sähköposti"))
                autoMap[index] = "email";
              else if (lower.includes("first") || lower.includes("etunimi"))
                autoMap[index] = "first_name";
              else if (lower.includes("last") || lower.includes("sukunimi"))
                autoMap[index] = "last_name";
            });
            setMapping(autoMap);
          }
        },
      });
    },
    [],
  );

  const handleImport = async () => {
    if (!file || !currentOrg) return;

    setImporting(true);
    setProgress(0);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = (results.data as string[][]).slice(1);
        const total = rows.length;
        const emailIndex = Object.entries(mapping).find(
          ([_, v]) => v === "email",
        )?.[0];

        if (emailIndex === undefined) {
          toast({
            title: "Virhe",
            description: "Sähköpostikenttä on pakollinen",
            variant: "destructive",
          });
          setImporting(false);
          return;
        }

        // Map CSV rows to contact objects
        const contacts = rows
          .map((row) => {
            const contact: Record<string, string> = {};
            Object.entries(mapping).forEach(([colIndex, field]) => {
              if (field !== "skip") {
                contact[field] = row[parseInt(colIndex)] || "";
              }
            });
            return contact;
          })
          .filter((c) => c.email);

        try {
          // Send all contacts to API endpoint
          const response = await fetch("/api/contacts/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId: currentOrg.id,
              contacts,
            }),
          });

          if (!response.ok) {
            throw new Error("Import failed");
          }

          const { imported } = await response.json();

          setProgress(100);
          setResult({
            total,
            imported,
            duplicates: 0,
            errors: total - imported,
          });
          queryClient.invalidateQueries({ queryKey: ["contacts"] });
          toast({ title: `${imported} kontaktia tuotu onnistuneesti` });
        } catch (error) {
          toast({
            title: "Virhe",
            description: "Kontaktien tuonti epäonnistui",
            variant: "destructive",
          });
          setResult({
            total,
            imported: 0,
            duplicates: 0,
            errors: total,
          });
        } finally {
          setImporting(false);
        }
      },
    });
  };

  const reset = () => {
    setFile(null);
    setHeaders([]);
    setMapping({});
    setPreview([]);
    setResult(null);
    setProgress(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tuo kontakteja CSV-tiedostosta</DialogTitle>
          <DialogDescription>
            Valitse CSV-tiedosto ja yhdistä sarakkeet oikeisiin kenttiin.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Valitse CSV-tiedosto</p>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Valitse tiedosto
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </Button>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {result.imported}
                </p>
                <p className="text-sm text-muted-foreground">Tuotu</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.duplicates}</p>
                <p className="text-sm text-muted-foreground">Duplikaatteja</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">Yhdistä sarakkeet:</p>
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate">{header}</span>
                  <Select
                    value={mapping[index] || "skip"}
                    onValueChange={(value) =>
                      setMapping({ ...mapping, [index]: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {progress}%
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Sulje
            </Button>
          ) : file ? (
            <>
              <Button variant="outline" onClick={reset} disabled={importing}>
                Takaisin
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  importing || !Object.values(mapping).includes("email")
                }
              >
                {importing ? "Tuodaan..." : "Tuo kontaktit"}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "@/hooks/useToast";
import {
  organizationSchema,
  type OrganizationFormData,
} from "@/lib/utils/validators";

export default function SettingsPage() {
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    if (currentOrg) {
      reset({
        name: currentOrg.name,
        from_name: currentOrg.from_name || "",
        from_email: currentOrg.from_email || "",
        reply_to_email: currentOrg.reply_to_email || "",
      });
    }
  }, [currentOrg, reset]);

  const onSubmit = async (data: OrganizationFormData) => {
    if (!currentOrg) return;
    setLoading(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentOrg.id,
          name: data.name,
          from_name: data.from_name || "",
          from_email: data.from_email || "",
          reply_to_email: data.reply_to_email || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to update organization");

      toast({ title: "Asetukset tallennettu" });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Asetukset</h1>
        <p className="text-muted-foreground">
          Hallitse organisaation asetuksia
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Organisaation tiedot</CardTitle>
            <CardDescription>Perustiedot organisaatiostasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organisaation nimi *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lähettäjän oletusasetukset</CardTitle>
            <CardDescription>
              Käytetään oletuksena uusissa kampanjoissa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from_name">Lähettäjän nimi</Label>
              <Input
                id="from_name"
                {...register("from_name")}
                placeholder="Yritys Oy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_email">Lähettäjän sähköposti</Label>
              <Input
                id="from_email"
                type="email"
                {...register("from_email")}
                placeholder="noreply@yritys.fi"
              />
              {errors.from_email && (
                <p className="text-sm text-destructive">
                  {errors.from_email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply_to_email">Vastausosoite</Label>
              <Input
                id="reply_to_email"
                type="email"
                {...register("reply_to_email")}
                placeholder="info@yritys.fi"
              />
              {errors.reply_to_email && (
                <p className="text-sm text-destructive">
                  {errors.reply_to_email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Tallennetaan..." : "Tallenna asetukset"}
          </Button>
        </div>
      </form>
    </div>
  );
}

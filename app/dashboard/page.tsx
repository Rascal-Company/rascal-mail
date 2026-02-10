"use client";

import {
  Users,
  Send,
  Eye,
  MousePointer,
  Upload,
  Megaphone,
  FileText,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useRecentCampaigns } from "@/hooks/useAnalytics";
import { useOrganization } from "@/hooks/useOrganization";
import { StatCardSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "@/lib/utils/formatters";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  draft: "Luonnos",
  scheduled: "Ajastettu",
  sending: "Lähetetään",
  sent: "Lähetetty",
  paused: "Keskeytetty",
  cancelled: "Peruutettu",
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  scheduled: "warning",
  sending: "default",
  sent: "success",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Hyvää huomenta";
  if (hour < 18) return "Hyvää iltapäivää";
  return "Hyvää iltaa";
}

const quickActions = [
  {
    label: "Uusi kampanja",
    description: "Luo ja lähetä uusi sähköpostikampanja",
    href: "/dashboard/campaigns/new",
    icon: Megaphone,
  },
  {
    label: "Tuo kontakteja",
    description: "Tuo kontakteja CSV-tiedostosta",
    href: "/dashboard/contacts/import",
    icon: Upload,
  },
  {
    label: "Luo mallipohja",
    description: "Suunnittele uusi sähköpostimallipohja",
    href: "/dashboard/templates/new",
    icon: FileText,
  },
];

const statCardConfig = [
  {
    label: "Kontaktit yhteensä",
    key: "totalContacts" as const,
    icon: Users,
    format: formatNumber,
    color: "bg-rascal-orange/10 text-rascal-orange",
  },
  {
    label: "Lähetetyt (30pv)",
    key: "emailsSent30d" as const,
    icon: Send,
    format: formatNumber,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    label: "Avausprosentti",
    key: "openRate" as const,
    icon: Eye,
    format: formatPercent,
    color: "bg-green-500/10 text-green-500",
  },
  {
    label: "Klikkausprosentti",
    key: "clickRate" as const,
    icon: MousePointer,
    format: formatPercent,
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentCampaigns, isLoading: campaignsLoading } =
    useRecentCampaigns();
  const { currentOrg } = useOrganization();

  return (
    <div className="space-y-8">
      {/* Greeting + action buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}
            {currentOrg ? `, ${currentOrg.name}` : ""}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tervetuloa Rascal Mailiin
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/contacts/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Tuo kontakteja
            </Button>
          </Link>
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Uusi kampanja
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCardConfig.map((stat) => (
              <Card
                key={stat.label}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.format(stats?.[stat.key] ?? 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Pikatoiminnot</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-all hover:border-rascal-orange/50 hover:shadow-md">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-lg bg-rascal-orange/10 p-2.5 text-rascal-orange">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-rascal-orange transition-colors">
                      {action.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viimeisimmät kampanjat</CardTitle>
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">
              Näytä kaikki
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : recentCampaigns && recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        (statusColors[campaign.status] || "secondary") as any
                      }
                    >
                      {statusLabels[campaign.status] ?? campaign.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(campaign.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-medium">Ei kampanjoita vielä</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aloita luomalla ensimmäinen kampanjasi
              </p>
              <Link href="/dashboard/campaigns/new">
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Luo kampanja
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ei käyttöoikeutta</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            Rascal Mail ei ole käytössä tilillesi. Ota yhteyttä ylläpitoon
            aktivoidaksesi palvelun.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

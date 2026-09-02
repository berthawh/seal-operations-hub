import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Eye, PauseCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { CertificateBack, CertificateFront } from "@/components/seal/certificate-artwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courses, organisations, people, sessions } from "@/lib/seal-data";

export const Route = createFileRoute("/certificates/new")({
  head: () => ({
    meta: [
      { title: "Create certificate — Seal" },
      {
        name: "description",
        content:
          "Create a credential, preview both faces and approve or hold it before the PDF is generated.",
      },
      { property: "og:title", content: "Create certificate — Seal" },
      { property: "og:description", content: "Preview and approve a credential before issuing." },
    ],
  }),
  component: CreateCertificate,
});

function CreateCertificate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [personId, setPersonId] = useState("per-2");
  const [courseId, setCourseId] = useState(courses[0]!.id);
  const [sessionId, setSessionId] = useState(sessions[0]!.id);
  const [orgId, setOrgId] = useState(organisations[0]!.id);
  const [completedOn, setCompletedOn] = useState("2026-09-12");
  const [validUntil, setValidUntil] = useState("2028-09-12");
  const [confirm, setConfirm] = useState(false);

  const person = people.find((p) => p.id === personId)!;
  const course = courses.find((c) => c.id === courseId)!;
  const org = organisations.find((o) => o.id === orgId)!;
  const number = "SEAL-2026-0432";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Create certificate"
          description="Details first, then a full front and back preview before anything is issued."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Certificates", to: "/certificates" },
            { label: "Create" },
          ]}
          meta={
            <StatusChip tone={step === 1 ? "info" : "seal"}>
              {step === 1 ? "Step 1 — Details" : "Step 2 — Preview & approval"}
            </StatusChip>
          }
          actions={
            <Button variant="ghost" asChild>
              <Link to="/certificates">Cancel</Link>
            </Button>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
          <Panel className="p-6">
            <PanelHeader
              className="p-0 pb-4"
              title="Credential details"
              subtitle="These values are printed on the certificate."
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Learner</Label>
                <Select value={personId} onValueChange={setPersonId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {people
                      .filter((p) => p.role === "Learner")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session</Label>
                <Select value={sessionId} onValueChange={setSessionId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.reference} · {s.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Select value={orgId} onValueChange={setOrgId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {organisations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="completed">Completed on</Label>
                  <Input
                    id="completed"
                    type="date"
                    value={completedOn}
                    onChange={(e) => setCompletedOn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid">Valid until</Label>
                  <Input
                    id="valid"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-sunken p-4">
                <Field label="Certificate number" value={<span className="font-mono">{number}</span>} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Generated automatically and locked once approved.
                </p>
              </div>
              <Button
                variant="seal"
                className="w-full"
                onClick={() => setStep(2)}
                disabled={step === 2}
              >
                <Eye className="size-4" /> Preview certificate
              </Button>
            </div>
          </Panel>

          <Panel className="p-6">
            {step === 1 ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck className="size-6" />
                </div>
                <p className="mt-4 text-sm font-semibold">Preview appears here</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Complete the credential details, then generate a front and back preview before
                  approval.
                </p>
              </div>
            ) : (
              <div className="animate-[rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both] space-y-5">
                <PanelHeader
                  className="p-0"
                  title="Preview & approval"
                  subtitle="Nothing is generated as a PDF until you approve."
                  action={<StatusChip tone="warning">Awaiting approval</StatusChip>}
                />
                <Tabs defaultValue="front">
                  <TabsList className="rounded-lg">
                    <TabsTrigger value="front">Front</TabsTrigger>
                    <TabsTrigger value="back">Back</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="front" className="animate-[fade_0.3s_ease_both] pt-4">
                    <CertificateFront
                      learner={person.name}
                      course={course.name}
                      completedOn={completedOn}
                      number={number}
                      organisation={org.name}
                    />
                  </TabsContent>
                  <TabsContent value="back" className="animate-[fade_0.3s_ease_both] pt-4">
                    <CertificateBack
                      number={number}
                      validUntil={validUntil}
                      course={course.name}
                    />
                  </TabsContent>
                  <TabsContent value="data" className="animate-[fade_0.3s_ease_both] pt-4">
                    <div className="grid gap-4 rounded-xl border border-border p-5 sm:grid-cols-2">
                      <Field label="Learner" value={person.name} />
                      <Field label="Organisation" value={org.name} />
                      <Field label="Course" value={course.name} />
                      <Field label="Session" value={sessionId} />
                      <Field label="Completed on" value={completedOn} />
                      <Field label="Valid until" value={validUntil} />
                      <Field label="Certificate number" value={number} />
                      <Field label="Validity period" value={`${course.validityMonths} months`} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="size-4" /> Back to details
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast.warning("Certificate placed on hold", {
                          description: `${number} · ${person.name}`,
                        })
                      }
                    >
                      <PauseCircle className="size-4" /> Hold
                    </Button>
                    <Button variant="seal" onClick={() => setConfirm(true)}>
                      Approve & issue <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Approve and generate PDF?</DialogTitle>
            <DialogDescription>
              The certificate number will be locked and the credential delivered to the learner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <Field label="Learner" value={person.name} />
            <Field label="Number" value={number} />
            <Field label="Course" value={course.name} />
            <Field label="Valid until" value={validUntil} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="seal"
              onClick={() => {
                setConfirm(false);
                toast.success("Certificate issued", { description: number });
                void navigate({ to: "/certificates" });
              }}
            >
              <Check className="size-4" /> Confirm & issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

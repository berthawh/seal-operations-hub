import { Panel } from "@/components/seal/primitives";
import { courseTerms } from "@/lib/seal-data";
import { cn } from "@/lib/utils";

/**
 * Fixed small print shown on every course. The wording is controlled and
 * identical across the catalogue.
 */
export function CourseTerms({ className }: { className?: string }) {
  return (
    <Panel className={cn("bg-surface-sunken p-5", className)}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Course terms
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {courseTerms.map((section) => (
          <div key={section.title}>
            <p className="text-[13px] font-semibold tracking-tight">{section.title}</p>
            {section.body.map((line) => (
              <p key={line} className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

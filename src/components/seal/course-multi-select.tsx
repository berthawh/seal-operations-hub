import { useId, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { courseColour, courses } from "@/lib/seal-data";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CHIP_LIMIT = 5;

/**
 * Searchable, filterable, keyboard-driven multi-select for the course catalogue.
 * Arrow keys move between options, Space/Enter toggles, Home/End jump.
 */
export function CourseMultiSelect({
  value,
  onChange,
  label = "Courses they deliver",
  disabled = false,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  disabled?: boolean;
}) {
  const listId = useId();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (selectedOnly && !value.includes(c.id)) return false;
      if (!q) return true;
      return `${c.name} ${c.category}`.toLowerCase().includes(q);
    });
  }, [query, category, selectedOnly, value]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((c) => c !== id) : [...value, id]);

  const visibleIds = visible.map((c) => c.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => value.includes(id));

  const toggleVisible = () =>
    onChange(
      allVisibleSelected
        ? value.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...value, ...visibleIds])),
    );

  const focusOption = (index: number) => {
    const next = Math.max(0, Math.min(visible.length - 1, index));
    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const perRow = 2;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusOption(index + (e.key === "ArrowDown" ? perRow : 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusOption(index - (e.key === "ArrowUp" ? perRow : 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      focusOption(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusOption(visible.length - 1);
    }
  };

  const selected = courses.filter((c) => value.includes(c.id));
  const shownChips = showAllChips ? selected : selected.slice(0, CHIP_LIMIT);
  const hiddenCount = selected.length - shownChips.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={searchId}>{label}</Label>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-foreground"
            aria-hidden="true"
          >
            {value.length} of {courses.length}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={toggleVisible}
            className={cn(
              "rounded text-[11px] font-medium text-seal underline-offset-2 hover:underline disabled:opacity-50",
              focusRing,
            )}
          >
            {allVisibleSelected
              ? query || category !== "all"
                ? "Clear these"
                : "Clear all"
              : query || category !== "all"
                ? "Select these"
                : "Select all"}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={searchId}
          type="search"
          role="searchbox"
          value={query}
          disabled={disabled}
          placeholder="Search courses…"
          aria-controls={listId}
          aria-describedby={`${listId}-status`}
          className="pl-8"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && query) {
              e.preventDefault();
              setQuery("");
            }
            if (e.key === "ArrowDown" && visible.length > 0) {
              e.preventDefault();
              focusOption(0);
            }
          }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter courses by category">
        {[{ key: "all", name: "All" }, ...categories.map((c) => ({ key: c, name: c }))].map((c) => {
          const on = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => setCategory(c.key)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                on
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted/60",
                focusRing,
              )}
            >
              {c.name}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={selectedOnly}
          disabled={disabled}
          onClick={() => setSelectedOnly((v) => !v)}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
            selectedOnly
              ? "border-seal/30 bg-seal/10 text-seal"
              : "border-border text-muted-foreground hover:bg-muted/60",
            focusRing,
          )}
        >
          Selected only
        </button>
      </div>

      <div
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Course catalogue"
        className="max-h-52 overflow-y-auto rounded-xl border border-border p-2"
      >
        {visible.length === 0 ? (
          <p className="px-1 py-3 text-[11px] text-muted-foreground">
            No courses match that search.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {visible.map((c, i) => {
              const on = value.includes(c.id);
              const colour = courseColour(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  disabled={disabled}
                  tabIndex={i === Math.min(activeIndex, visible.length - 1) ? 0 : -1}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  onFocus={() => setActiveIndex(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors",
                    on
                      ? colour.chip
                      : "border-border bg-transparent text-muted-foreground hover:bg-muted/60",
                    focusRing,
                  )}
                >
                  {on ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    <span className={cn("size-1.5 rounded-full", colour.dot)} aria-hidden="true" />
                  )}
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p id={`${listId}-status`} aria-live="polite" className="text-[11px] text-muted-foreground">
        {value.length} of {courses.length} courses selected · {visible.length} shown
      </p>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Selected courses">
          {shownChips.map((c) => {
            const colour = courseColour(c.id);
            return (
              <span
                key={c.id}
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  colour.chip,
                )}
              >
                <span className="truncate">{c.name}</span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${c.name}`}
                  onClick={() => toggle(c.id)}
                  className={cn("rounded-full p-0.5 hover:bg-foreground/10", focusRing)}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            );
          })}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAllChips(true)}
              className={cn(
                "rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/60",
                focusRing,
              )}
            >
              +{hiddenCount} more
            </button>
          ) : null}
          {showAllChips && selected.length > CHIP_LIMIT ? (
            <button
              type="button"
              onClick={() => setShowAllChips(false)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:underline",
                focusRing,
              )}
            >
              Show fewer
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

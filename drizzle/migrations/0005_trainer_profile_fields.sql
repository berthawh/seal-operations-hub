ALTER TABLE public.trainers
  ADD COLUMN IF NOT EXISTS course_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS recommended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0;
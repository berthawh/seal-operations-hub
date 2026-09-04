ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS preferred_time text NOT NULL DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS end_time text NOT NULL DEFAULT '17:00';
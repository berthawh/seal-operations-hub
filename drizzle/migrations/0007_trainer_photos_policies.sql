CREATE POLICY "Team views trainer photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'trainer-photos');

CREATE POLICY "Admins upload trainer photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trainer-photos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update trainer photos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'trainer-photos' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'trainer-photos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete trainer photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'trainer-photos' AND public.is_admin(auth.uid()));
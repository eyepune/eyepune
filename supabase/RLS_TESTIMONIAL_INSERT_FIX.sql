-- Fix RLS for testimonials so authenticated users can insert their feedback
DROP POLICY IF EXISTS "Allow Authenticated Insert Testimonial" ON public.testimonials;

CREATE POLICY "Allow Authenticated Insert Testimonial" ON public.testimonials 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create beta_signups table for storing beta user registrations
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup form)
CREATE POLICY "Anyone can sign up for beta"
ON public.beta_signups
FOR INSERT
WITH CHECK (true);

-- Only allow admins to view signups (no public read access)
CREATE POLICY "No public read access"
ON public.beta_signups
FOR SELECT
USING (false);
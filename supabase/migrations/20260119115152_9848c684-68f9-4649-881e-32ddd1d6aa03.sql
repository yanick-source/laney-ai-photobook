-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create photobooks table for cloud-saved projects
CREATE TABLE public.photobooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  local_id TEXT,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  book_format JSONB NOT NULL DEFAULT '{"size": "medium", "orientation": "vertical"}'::jsonb,
  pages JSONB,
  photos TEXT[],
  photos_with_quality JSONB,
  analysis JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on photobooks
ALTER TABLE public.photobooks ENABLE ROW LEVEL SECURITY;

-- Photobooks policies - users can only access their own
CREATE POLICY "Users can view their own photobooks"
  ON public.photobooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photobooks"
  ON public.photobooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photobooks"
  ON public.photobooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photobooks"
  ON public.photobooks FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER photobooks_updated_at
  BEFORE UPDATE ON public.photobooks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for photobook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('photobook-images', 'photobook-images', true);

-- Storage policies for photobook images
CREATE POLICY "Users can view their own photobook images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photobook-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own photobook images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photobook-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photobook images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photobook-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photobook images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photobook-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for photobooks (optional, for future collaborative features)
ALTER PUBLICATION supabase_realtime ADD TABLE public.photobooks;
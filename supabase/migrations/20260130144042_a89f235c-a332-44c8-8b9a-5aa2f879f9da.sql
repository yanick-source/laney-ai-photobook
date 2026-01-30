-- Create templates table for marketing template data
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tag TEXT,
  usage_count INTEGER DEFAULT 0,
  cover_image_path TEXT NOT NULL,
  spread_image_path TEXT,
  orientation TEXT DEFAULT 'horizontal' CHECK (orientation IN ('horizontal', 'vertical')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Public read access for active templates (marketing content)
CREATE POLICY "Anyone can view active templates"
ON public.templates
FOR SELECT
USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create public storage bucket for template images
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-images', 'template-images', true);

-- Storage policy: anyone can view template images
CREATE POLICY "Template images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'template-images');

-- Seed initial template data (using Unsplash URLs as placeholders)
INSERT INTO public.templates (name, category, tag, usage_count, cover_image_path, orientation, display_order) VALUES
('Wedding Elegance', 'wedding', 'Popular', 12500, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=900&fit=crop', 'horizontal', 1),
('Travel Adventures', 'travel', 'Trending', 8900, 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&h=900&fit=crop', 'horizontal', 2),
('Family Moments', 'family', NULL, 15200, 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=900&fit=crop', 'horizontal', 3),
('Baby First Year', 'baby', 'New', 6700, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&h=1200&fit=crop', 'vertical', 4),
('Summer Vacation', 'travel', NULL, 9400, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop', 'horizontal', 5),
('Birthday Celebration', 'birthday', NULL, 7800, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&h=1200&fit=crop', 'vertical', 6),
('Graduation Day', 'graduation', NULL, 5200, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=900&fit=crop', 'horizontal', 7),
('Modern Minimal', 'modern', 'Trending', 11300, 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=900&fit=crop', 'horizontal', 8),
('Classic Timeless', 'classic', NULL, 8100, 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=900&h=1200&fit=crop', 'vertical', 9),
('Romantic Love', 'wedding', NULL, 10400, 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1200&h=900&fit=crop', 'horizontal', 10),
('City Explorer', 'travel', NULL, 6300, 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900&h=1200&fit=crop', 'vertical', 11),
('Holiday Magic', 'holiday', 'Popular', 9800, 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&h=900&fit=crop', 'horizontal', 12),
('Portrait Series', 'portrait', NULL, 4500, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1200&fit=crop', 'vertical', 13);
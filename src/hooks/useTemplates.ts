import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  category: string;
  tag: string | null;
  usage_count: number;
  cover_image_path: string;
  spread_image_path: string | null;
  orientation: "horizontal" | "vertical";
  display_order: number;
  is_active: boolean;
}

// Database row type (matches what Supabase returns)
interface TemplateRow {
  id: string;
  name: string;
  category: string;
  tag: string | null;
  usage_count: number;
  cover_image_path: string;
  spread_image_path: string | null;
  orientation: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseTemplatesOptions {
  category?: string;
}

const getImageUrl = (path: string): string => {
  // If it's already a full URL (e.g., Unsplash), return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Otherwise, get public URL from Supabase storage
  const { data } = supabase.storage
    .from("template-images")
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const useTemplates = (options: UseTemplatesOptions = {}) => {
  const { category } = options;

  return useQuery({
    queryKey: ["templates", category],
    queryFn: async (): Promise<Template[]> => {
      let query = supabase
        .from("templates" as never)
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      // Transform paths to full URLs
      return ((data || []) as TemplateRow[]).map((template) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        tag: template.tag,
        usage_count: template.usage_count,
        cover_image_path: getImageUrl(template.cover_image_path),
        spread_image_path: template.spread_image_path 
          ? getImageUrl(template.spread_image_path) 
          : null,
        orientation: (template.orientation as "horizontal" | "vertical") || "horizontal",
        display_order: template.display_order,
        is_active: template.is_active,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper to get unique categories from templates
export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("templates" as never)
        .select("category")
        .eq("is_active", true);

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      const rows = (data || []) as { category: string }[];
      const categories = [...new Set(rows.map((t) => t.category))];
      return categories.sort();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

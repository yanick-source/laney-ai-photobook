import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/laney/MainLayout";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTemplates, useTemplateCategories } from "@/hooks/useTemplates";
import { TemplateCard } from "@/components/laney/TemplateCard";
import { Skeleton } from "@/components/ui/skeleton";

const Templates = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  
  const { data: templates = [], isLoading, error } = useTemplates({ 
    category: activeCategory 
  });
  const { data: dbCategories = [] } = useTemplateCategories();

  // Build category list with "All" option
  const categories = [
    { id: "all", label: t('templates.categories.all', 'Alles') },
    ...dbCategories.map(cat => ({
      id: cat,
      label: t(`templates.categories.${cat}`, cat.charAt(0).toUpperCase() + cat.slice(1))
    }))
  ];

  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('templates.title', 'Sjablonen')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('templates.subtitle', 'Kies een sjabloon als startpunt voor je fotoboek')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{t('templates.error', 'Failed to load templates')}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <Link key={template.id} to="/ai-creation">
                <TemplateCard
                  image={template.cover_image_path}
                  spreadImage={template.spread_image_path || undefined}
                  title={template.name}
                  usageCount={template.usage_count}
                  tag={template.tag || undefined}
                  orientation={template.orientation}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('templates.empty', 'No templates found')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Templates;

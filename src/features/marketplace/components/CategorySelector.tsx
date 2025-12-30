import { useTranslation } from 'react-i18next';
import type { MarketplaceCategory } from '@/lib/types/marketplace';

interface CategorySelectorProps {
  categories: MarketplaceCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  const locale = t('marketplace.categories.all');

  return (
    <div className="flex items-center gap-2 flex-wrap pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategoryId === null
            ? 'bg-blue-600 text-white dark:bg-blue-500'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <span>{t('marketplace.categories.all')}</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategoryId === category.id
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <span className="text-lg">{category.icon}</span>
          <span>{category[`name_${locale === 'all' ? 'en' : 'zh'}` as keyof typeof category] || category.name_zh}</span>
        </button>
      ))}
    </div>
  );
}

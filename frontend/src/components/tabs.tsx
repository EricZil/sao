'use client';

interface CategoryBarProps {
  onCategoryChange: (category: string) => void;
  activeCategory?: string;
}

export default function Tabs({ onCategoryChange, activeCategory }: CategoryBarProps) {
  const categories = [
    { id: 'nerd-stats', name: 'nerd stats' },
    { id: 'users-db', name: 'users db' },
    { id: 'sao', name: 'sao' },
    { id: 'admin', name: 'admin' }
  ];

  const clickCategory = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  const activeItem = categories.find(cat => cat.id === activeCategory);
  const activeName = activeItem ? activeItem.name : 'nerd stats';

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => clickCategory(category.id)}
          className={`p-4 font-mono text-sm border transition-all ${
            activeName === category.name
              ? 'border-green-500 bg-green-900/30 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
              : 'border-gray-700 bg-black/50 text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
          }`}
        >
          [/{category.name.replace(' ', '_')}]
        </button>
      ))}
    </div>
  );
}
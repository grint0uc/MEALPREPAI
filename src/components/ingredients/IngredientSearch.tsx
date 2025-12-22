'use client';

import { useState, useEffect, useRef } from 'react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  unit: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
}

interface SelectedIngredient extends Ingredient {
  quantity: number;
  userUnit: string;
}

interface IngredientSearchProps {
  onAddIngredient: (ingredient: SelectedIngredient) => void;
  selectedIngredients?: SelectedIngredient[];
}

export default function IngredientSearch({
  onAddIngredient,
  selectedIngredients = [],
}: IngredientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common units for different categories
  const getUnitsForCategory = (category: string) => {
    const units = {
      proteins: ['g', 'oz', 'lb', 'piece'],
      vegetables: ['g', 'oz', 'cup', 'piece'],
      fruits: ['g', 'oz', 'cup', 'piece'],
      grains: ['g', 'oz', 'cup'],
      dairy: ['g', 'ml', 'oz', 'cup', 'piece'],
      fats_oils: ['ml', 'tbsp', 'tsp'],
      spices_herbs: ['g', 'tsp', 'tbsp'],
      condiments: ['ml', 'g', 'tbsp', 'tsp'],
      legumes: ['g', 'oz', 'cup'],
      nuts_seeds: ['g', 'oz', 'cup'],
      beverages: ['ml', 'oz', 'cup'],
      other: ['g', 'ml', 'piece'],
    };
    return units[category as keyof typeof units] || ['g', 'ml', 'piece'];
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.ingredients || []);
        setShowDropdown(true);
        setFocusedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    const units = getUnitsForCategory(ingredient.category);
    setSelectedUnit(ingredient.unit || units[0]);

    const qty = parseFloat(quantity) || 1;
    onAddIngredient({
      ...ingredient,
      quantity: qty,
      userUnit: ingredient.unit || units[0],
    });

    // Reset form
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setQuantity('1');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSelectIngredient(searchResults[focusedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      proteins: 'bg-red-100 text-red-800',
      vegetables: 'bg-green-100 text-green-800',
      fruits: 'bg-pink-100 text-pink-800',
      grains: 'bg-yellow-100 text-yellow-800',
      dairy: 'bg-blue-100 text-blue-800',
      fats_oils: 'bg-purple-100 text-purple-800',
      spices_herbs: 'bg-orange-100 text-orange-800',
      condiments: 'bg-indigo-100 text-indigo-800',
      legumes: 'bg-amber-100 text-amber-800',
      nuts_seeds: 'bg-cyan-100 text-cyan-800',
      beverages: 'bg-teal-100 text-teal-800',
      other: 'bg-secondary-100 text-secondary-800',
    };
    return colors[category as keyof typeof colors] || 'bg-secondary-100 text-secondary-800';
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search ingredients (e.g., chicken, spinach, rice)..."
            className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown results */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchResults.map((ingredient, index) => (
            <button
              key={ingredient.id}
              onClick={() => handleSelectIngredient(ingredient)}
              className={`w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors border-b border-secondary-100 last:border-b-0 ${
                index === focusedIndex ? 'bg-secondary-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-secondary-900">{ingredient.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                        ingredient.category
                      )}`}
                    >
                      {formatCategoryName(ingredient.category)}
                    </span>
                    {ingredient.protein_per_100g && (
                      <span className="text-xs text-secondary-500">
                        {ingredient.protein_per_100g}g protein
                      </span>
                    )}
                    {ingredient.calories_per_100g && (
                      <span className="text-xs text-secondary-500">
                        {ingredient.calories_per_100g} cal
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg p-4 text-center text-secondary-500">
          No ingredients found for &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}

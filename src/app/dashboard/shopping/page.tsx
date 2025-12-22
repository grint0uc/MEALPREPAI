'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { parseAmount } from '@/lib/units';

interface ShoppingItem {
  name: string;
  amount: string;
  category: string;
  status: string;
  checked?: boolean;
  purchasedAmount?: string;
  isEditing?: boolean;
}

interface RunningLowItem {
  name: string;
  currentAmount: string;
  fridgeLife: number;
  status: 'low_stock' | 'expiring_soon';
}

export default function ShoppingPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [runningLow, setRunningLow] = useState<RunningLowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list');
      const data = await response.json();

      if (response.ok) {
        setShoppingList(data.shoppingList.map((item: ShoppingItem) => ({
          ...item,
          checked: false,
          purchasedAmount: item.amount,
          isEditing: false
        })));
        setRunningLow(data.runningLow);
      }
    } catch (error) {
      console.error('Failed to load shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (index: number) => {
    const item = shoppingList[index];
    const newCheckedState = !item.checked;

    // If checking an item, add it to fridge then remove from list
    if (newCheckedState && item.purchasedAmount) {
      await addToFridge(item.name, item.purchasedAmount);

      // Remove item from shopping list after adding to fridge
      setShoppingList(prev => prev.filter((_, i) => i !== index));
    } else {
      // If unchecking (shouldn't happen), just toggle
      setShoppingList(prev =>
        prev.map((it, i) =>
          i === index ? { ...it, checked: newCheckedState } : it
        )
      );
    }
  };

  const addToFridge = async (ingredientName: string, amount: string) => {
    setSaving(true);
    try {
      // Parse amount and unit - handle fractions and various formats
      const match = amount.match(/^([\d./\s]+)(.*)$/);
      if (!match) {
        console.error('Failed to parse amount:', amount);
        return;
      }

      const quantity = parseAmount(match[1]);
      const unit = match[2].trim() || 'pc';

      console.log('Adding to fridge:', { ingredientName, quantity, unit });

      const response = await fetch('/api/fridge/add-purchased', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName, quantity, unit }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        alert(`Failed to add ${ingredientName} to fridge: ${data.error}`);
      } else {
        console.log('Successfully added to fridge:', data);
      }
    } catch (error) {
      console.error('Failed to add to fridge:', error);
      alert('Failed to add ingredient to fridge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePurchasedAmount = (index: number, newAmount: string) => {
    setShoppingList(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, purchasedAmount: newAmount } : item
      )
    );
  };

  const toggleEditing = (index: number) => {
    setShoppingList(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const isInsufficientAmount = (item: ShoppingItem): boolean => {
    const needed = parseAmount(item.amount);
    const purchased = parseAmount(item.purchasedAmount || item.amount);
    return purchased < needed;
  };

  const groupByCategory = (items: ShoppingItem[]) => {
    const grouped: { [key: string]: ShoppingItem[] } = {};
    items.forEach(item => {
      const category = item.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const grouped = groupByCategory(shoppingList);
    let text = 'SHOPPING LIST\n';
    text += '='.repeat(40) + '\n\n';

    Object.entries(grouped).forEach(([category, items]) => {
      text += `${category.toUpperCase().replace('_', ' ')}\n`;
      text += '-'.repeat(20) + '\n';
      items.forEach(item => {
        text += `[ ] ${item.name} - ${item.amount}\n`;
      });
      text += '\n';
    });

    if (runningLow.length > 0) {
      text += '\nRUNNING LOW\n';
      text += '-'.repeat(20) + '\n';
      runningLow.forEach(item => {
        text += `⚠ ${item.name} (${item.currentAmount}) - ${item.status === 'expiring_soon' ? `${item.fridgeLife} days left` : 'Low stock'}\n`;
      });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedItems = groupByCategory(shoppingList);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Shopping List</h1>
            <p className="text-secondary-600">
              Ingredients you need for your meal plan
            </p>
          </div>
          {shoppingList.length > 0 && (
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          )}
        </div>

        {/* Running Low Alerts */}
        {runningLow.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Running Low
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {runningLow.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    item.status === 'expiring_soon'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-secondary-900 capitalize">{item.name}</div>
                      <div className="text-sm text-secondary-600 mt-1">
                        Current: {item.currentAmount}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'expiring_soon'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'expiring_soon'
                        ? `${item.fridgeLife} days left`
                        : 'Low stock'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List */}
        {shoppingList.length === 0 ? (
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">All stocked up!</h3>
            <p className="text-secondary-600">You have all the ingredients you need</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
            <div className="p-4 bg-secondary-50 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                Items to Buy ({shoppingList.filter(i => !i.checked).length} remaining)
              </h2>
            </div>

            <div className="divide-y divide-secondary-200">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="p-4">
                  <h3 className="text-sm font-semibold text-secondary-700 uppercase mb-3 capitalize">
                    {category.replace('_', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const globalIndex = shoppingList.findIndex(i => i === item);
                      return (
                        <div
                          key={globalIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            item.checked
                              ? 'bg-secondary-50 opacity-60'
                              : 'hover:bg-secondary-50'
                          }`}
                        >
                          <div
                            onClick={() => toggleItem(globalIndex)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                            item.checked
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-secondary-300'
                          }`}>
                            {item.checked && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium capitalize ${
                                item.checked ? 'line-through text-secondary-500' : 'text-secondary-900'
                              }`}>
                                {item.name}
                              </span>
                              {!item.isEditing && isInsufficientAmount(item) && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                  ⚠️ Less than needed
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-secondary-500 mt-0.5">
                              Needed: {item.amount}
                            </div>
                          </div>
                          {item.isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.purchasedAmount}
                                onChange={(e) => updatePurchasedAmount(globalIndex, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-24 px-2 py-1 text-sm text-secondary-900 border border-secondary-300 rounded focus:outline-none focus:border-primary-500"
                                placeholder="e.g. 2 cups"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEditing(globalIndex);
                                }}
                                className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-secondary-600">
                                {item.purchasedAmount}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEditing(globalIndex);
                                }}
                                className="px-2 py-1 text-xs text-secondary-600 hover:text-primary-600"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

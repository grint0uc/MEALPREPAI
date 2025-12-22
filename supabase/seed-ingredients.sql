-- Meal Prep AI - 500 Fitness-Focused Ingredients Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor

-- ============================================
-- PROTEINS (80 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Chicken
('Chicken Breast (boneless, skinless)', 'proteins', 'poultry', 'g', 165, 31, 0, 3.6, 0, 0.008, 3, true),
('Chicken Thigh (boneless, skinless)', 'proteins', 'poultry', 'g', 209, 26, 0, 10.9, 0, 0.006, 3, true),
('Ground Chicken', 'proteins', 'poultry', 'g', 143, 17.4, 0, 8.1, 0, 0.007, 2, true),
('Chicken Drumstick', 'proteins', 'poultry', 'g', 172, 28.3, 0, 5.7, 0, 0.004, 3, true),
('Chicken Wings', 'proteins', 'poultry', 'g', 203, 30.5, 0, 8.1, 0, 0.005, 3, true),
('Rotisserie Chicken', 'proteins', 'poultry', 'g', 190, 27, 0, 8.5, 0, 0.012, 4, true),

-- Turkey
('Turkey Breast', 'proteins', 'poultry', 'g', 135, 30, 0, 0.7, 0, 0.009, 3, true),
('Ground Turkey (93% lean)', 'proteins', 'poultry', 'g', 149, 19.2, 0, 7.7, 0, 0.008, 2, true),
('Ground Turkey (99% lean)', 'proteins', 'poultry', 'g', 112, 24, 0, 1.5, 0, 0.010, 2, true),
('Turkey Sausage', 'proteins', 'poultry', 'g', 196, 23.9, 1, 10.4, 0, 0.009, 5, true),

-- Beef
('Ground Beef (90% lean)', 'proteins', 'beef', 'g', 176, 26, 0, 10, 0, 0.009, 2, true),
('Ground Beef (85% lean)', 'proteins', 'beef', 'g', 215, 26, 0, 15, 0, 0.007, 2, true),
('Ground Beef (95% lean)', 'proteins', 'beef', 'g', 137, 28, 0, 5, 0, 0.011, 2, true),
('Sirloin Steak', 'proteins', 'beef', 'g', 183, 27, 0, 8, 0, 0.015, 3, true),
('Flank Steak', 'proteins', 'beef', 'g', 192, 27, 0, 9, 0, 0.012, 3, true),
('Ribeye Steak', 'proteins', 'beef', 'g', 291, 24, 0, 21, 0, 0.020, 3, true),
('NY Strip Steak', 'proteins', 'beef', 'g', 220, 26, 0, 12, 0, 0.018, 3, true),
('Chuck Roast', 'proteins', 'beef', 'g', 250, 26, 0, 16, 0, 0.008, 4, true),
('Beef Tenderloin', 'proteins', 'beef', 'g', 218, 26, 0, 12, 0, 0.025, 3, false),
('Beef Liver', 'proteins', 'beef', 'g', 135, 20.4, 3.9, 3.6, 0, 0.006, 2, false),

-- Pork
('Pork Tenderloin', 'proteins', 'pork', 'g', 143, 26, 0, 3.5, 0, 0.008, 3, true),
('Pork Chop (boneless)', 'proteins', 'pork', 'g', 231, 25, 0, 14, 0, 0.007, 3, true),
('Ground Pork', 'proteins', 'pork', 'g', 263, 17, 0, 21, 0, 0.006, 2, true),
('Pork Loin', 'proteins', 'pork', 'g', 143, 23, 0, 5, 0, 0.007, 4, true),
('Bacon', 'proteins', 'pork', 'g', 541, 37, 1.4, 42, 0, 0.012, 7, true),
('Ham (deli)', 'proteins', 'pork', 'g', 145, 21, 1.5, 6, 0, 0.010, 5, true),
('Prosciutto', 'proteins', 'pork', 'g', 195, 24, 0.3, 10, 0, 0.035, 14, false),

-- Fish & Seafood
('Salmon Fillet', 'proteins', 'fish', 'g', 208, 20, 0, 13, 0, 0.020, 2, true),
('Salmon (canned)', 'proteins', 'fish', 'g', 167, 23, 0, 8, 0, 0.012, 365, true),
('Tuna (canned in water)', 'proteins', 'fish', 'g', 86, 19, 0, 0.8, 0, 0.008, 365, true),
('Tuna Steak', 'proteins', 'fish', 'g', 144, 23, 0, 5, 0, 0.025, 2, true),
('Cod Fillet', 'proteins', 'fish', 'g', 82, 18, 0, 0.7, 0, 0.015, 2, true),
('Tilapia Fillet', 'proteins', 'fish', 'g', 96, 20, 0, 1.7, 0, 0.012, 2, true),
('Halibut', 'proteins', 'fish', 'g', 111, 23, 0, 1.6, 0, 0.030, 2, false),
('Mahi Mahi', 'proteins', 'fish', 'g', 85, 18.5, 0, 0.7, 0, 0.018, 2, true),
('Sardines (canned)', 'proteins', 'fish', 'g', 208, 25, 0, 11, 0, 0.006, 365, true),
('Mackerel', 'proteins', 'fish', 'g', 205, 19, 0, 14, 0, 0.010, 2, true),
('Trout', 'proteins', 'fish', 'g', 141, 20, 0, 6, 0, 0.012, 2, true),
('Shrimp', 'proteins', 'seafood', 'g', 99, 24, 0.2, 0.3, 0, 0.018, 2, true),
('Shrimp (frozen)', 'proteins', 'seafood', 'g', 99, 24, 0.2, 0.3, 0, 0.015, 180, true),
('Scallops', 'proteins', 'seafood', 'g', 111, 21, 5, 0.5, 0, 0.035, 2, false),
('Crab Meat', 'proteins', 'seafood', 'g', 97, 19, 0, 1.5, 0, 0.040, 2, false),
('Lobster', 'proteins', 'seafood', 'g', 98, 21, 0, 0.6, 0, 0.060, 2, false),
('Mussels', 'proteins', 'seafood', 'g', 172, 24, 7, 4.5, 0, 0.008, 2, false),
('Calamari', 'proteins', 'seafood', 'g', 175, 18, 7, 8, 0, 0.015, 2, false),

-- Eggs & Dairy Proteins
('Eggs (whole)', 'proteins', 'eggs', 'piece', 78, 6.3, 0.6, 5.3, 0, 0.25, 21, true),
('Egg Whites', 'proteins', 'eggs', 'g', 52, 11, 0.7, 0.2, 0, 0.015, 7, true),
('Cottage Cheese (low-fat)', 'proteins', 'dairy', 'g', 72, 12, 2.7, 1, 0, 0.008, 14, true),
('Greek Yogurt (plain, 0%)', 'proteins', 'dairy', 'g', 59, 10, 3.6, 0.7, 0, 0.010, 14, true),
('Greek Yogurt (plain, 2%)', 'proteins', 'dairy', 'g', 73, 10, 4, 2, 0, 0.010, 14, true),
('Skyr', 'proteins', 'dairy', 'g', 63, 11, 4, 0.2, 0, 0.012, 14, true),

-- Plant Proteins
('Tofu (firm)', 'proteins', 'plant', 'g', 144, 17, 3, 9, 0.3, 0.006, 7, true),
('Tofu (extra firm)', 'proteins', 'plant', 'g', 145, 17, 2, 9, 0, 0.006, 7, true),
('Tofu (silken)', 'proteins', 'plant', 'g', 55, 5, 2.4, 2.7, 0, 0.006, 5, true),
('Tempeh', 'proteins', 'plant', 'g', 195, 20, 8, 11, 0, 0.012, 10, true),
('Seitan', 'proteins', 'plant', 'g', 370, 75, 14, 2, 0.6, 0.015, 7, false),
('Edamame (shelled)', 'proteins', 'plant', 'g', 121, 12, 9, 5, 5, 0.010, 3, true),

-- Deli Meats (leaner options)
('Turkey Breast (deli)', 'proteins', 'deli', 'g', 104, 18, 2, 2, 0, 0.015, 7, true),
('Chicken Breast (deli)', 'proteins', 'deli', 'g', 100, 18, 1, 2, 0, 0.015, 7, true),
('Roast Beef (deli)', 'proteins', 'deli', 'g', 140, 21, 1, 5, 0, 0.018, 5, true),

-- Game Meats
('Bison Ground', 'proteins', 'game', 'g', 146, 20, 0, 7, 0, 0.018, 2, false),
('Venison', 'proteins', 'game', 'g', 158, 30, 0, 3.2, 0, 0.020, 3, false),
('Lamb (leg)', 'proteins', 'lamb', 'g', 258, 25, 0, 17, 0, 0.015, 3, true),
('Lamb (ground)', 'proteins', 'lamb', 'g', 283, 25, 0, 20, 0, 0.012, 2, true),

-- Protein Powders & Supplements
('Whey Protein Powder', 'proteins', 'supplement', 'g', 400, 80, 8, 4, 0, 0.030, 365, true),
('Casein Protein Powder', 'proteins', 'supplement', 'g', 380, 80, 5, 2, 0, 0.035, 365, false),
('Plant Protein Powder', 'proteins', 'supplement', 'g', 390, 75, 10, 5, 3, 0.035, 365, true),
('Collagen Peptides', 'proteins', 'supplement', 'g', 360, 90, 0, 0, 0, 0.050, 365, false),

-- More Poultry
('Duck Breast', 'proteins', 'poultry', 'g', 201, 23, 0, 11, 0, 0.025, 3, false),
('Cornish Hen', 'proteins', 'poultry', 'g', 220, 20, 0, 15, 0, 0.015, 3, false),
('Turkey Bacon', 'proteins', 'poultry', 'g', 218, 16, 1.5, 16, 0, 0.012, 14, true),
('Chicken Sausage', 'proteins', 'poultry', 'g', 168, 17, 2, 10, 0, 0.012, 7, true),
('Ground Chicken Breast', 'proteins', 'poultry', 'g', 120, 23, 0, 3, 0, 0.009, 2, true),

-- More Fish
('Sea Bass', 'proteins', 'fish', 'g', 97, 18, 0, 2, 0, 0.028, 2, false),
('Swordfish', 'proteins', 'fish', 'g', 144, 20, 0, 7, 0, 0.030, 2, false),
('Anchovies', 'proteins', 'fish', 'g', 210, 29, 0, 10, 0, 0.020, 365, false),
('Smoked Salmon', 'proteins', 'fish', 'g', 117, 18, 0, 4.3, 0, 0.045, 14, true);

-- ============================================
-- VEGETABLES (100 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Leafy Greens
('Spinach (fresh)', 'vegetables', 'leafy_greens', 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.006, 7, true),
('Spinach (frozen)', 'vegetables', 'leafy_greens', 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.004, 180, true),
('Kale', 'vegetables', 'leafy_greens', 'g', 49, 4.3, 9, 0.9, 3.6, 0.006, 7, true),
('Arugula', 'vegetables', 'leafy_greens', 'g', 25, 2.6, 3.7, 0.7, 1.6, 0.010, 5, true),
('Romaine Lettuce', 'vegetables', 'leafy_greens', 'g', 17, 1.2, 3.3, 0.3, 2.1, 0.004, 7, true),
('Iceberg Lettuce', 'vegetables', 'leafy_greens', 'g', 14, 0.9, 3, 0.1, 1.2, 0.003, 10, true),
('Mixed Greens', 'vegetables', 'leafy_greens', 'g', 20, 2, 3, 0.3, 2, 0.010, 5, true),
('Swiss Chard', 'vegetables', 'leafy_greens', 'g', 19, 1.8, 3.7, 0.2, 1.6, 0.005, 5, true),
('Collard Greens', 'vegetables', 'leafy_greens', 'g', 32, 3, 5.4, 0.6, 4, 0.004, 5, true),
('Bok Choy', 'vegetables', 'leafy_greens', 'g', 13, 1.5, 2.2, 0.2, 1, 0.004, 5, true),
('Cabbage (green)', 'vegetables', 'leafy_greens', 'g', 25, 1.3, 5.8, 0.1, 2.5, 0.002, 14, true),
('Cabbage (red)', 'vegetables', 'leafy_greens', 'g', 31, 1.4, 7.4, 0.2, 2.1, 0.003, 14, true),
('Brussels Sprouts', 'vegetables', 'cruciferous', 'g', 43, 3.4, 9, 0.3, 3.8, 0.005, 7, true),
('Watercress', 'vegetables', 'leafy_greens', 'g', 11, 2.3, 1.3, 0.1, 0.5, 0.012, 3, false),

-- Cruciferous Vegetables
('Broccoli', 'vegetables', 'cruciferous', 'g', 34, 2.8, 7, 0.4, 2.6, 0.004, 7, true),
('Broccoli (frozen)', 'vegetables', 'cruciferous', 'g', 34, 2.8, 7, 0.4, 2.6, 0.003, 180, true),
('Cauliflower', 'vegetables', 'cruciferous', 'g', 25, 1.9, 5, 0.3, 2, 0.004, 7, true),
('Cauliflower (frozen)', 'vegetables', 'cruciferous', 'g', 25, 1.9, 5, 0.3, 2, 0.003, 180, true),
('Cauliflower Rice', 'vegetables', 'cruciferous', 'g', 25, 2, 5, 0.3, 2, 0.008, 5, true),

-- Root Vegetables
('Carrots', 'vegetables', 'root', 'g', 41, 0.9, 10, 0.2, 2.8, 0.002, 21, true),
('Sweet Potato', 'vegetables', 'root', 'g', 86, 1.6, 20, 0.1, 3, 0.003, 14, true),
('White Potato', 'vegetables', 'root', 'g', 77, 2, 17, 0.1, 2.2, 0.002, 21, true),
('Red Potato', 'vegetables', 'root', 'g', 70, 1.9, 16, 0.1, 1.7, 0.003, 21, true),
('Yukon Gold Potato', 'vegetables', 'root', 'g', 77, 2, 17, 0.1, 2.2, 0.003, 21, true),
('Beets', 'vegetables', 'root', 'g', 43, 1.6, 10, 0.2, 2.8, 0.003, 14, true),
('Turnips', 'vegetables', 'root', 'g', 28, 0.9, 6, 0.1, 1.8, 0.003, 14, true),
('Parsnips', 'vegetables', 'root', 'g', 75, 1.2, 18, 0.3, 4.9, 0.004, 14, true),
('Radishes', 'vegetables', 'root', 'g', 16, 0.7, 3.4, 0.1, 1.6, 0.003, 14, true),
('Rutabaga', 'vegetables', 'root', 'g', 37, 1.1, 8.6, 0.2, 2.3, 0.003, 21, false),
('Jicama', 'vegetables', 'root', 'g', 38, 0.7, 9, 0.1, 4.9, 0.004, 14, false),

-- Alliums
('Onion (yellow)', 'vegetables', 'allium', 'g', 40, 1.1, 9, 0.1, 1.7, 0.002, 30, true),
('Onion (red)', 'vegetables', 'allium', 'g', 40, 1.1, 9, 0.1, 1.7, 0.003, 30, true),
('Onion (white)', 'vegetables', 'allium', 'g', 40, 1.1, 9, 0.1, 1.7, 0.003, 30, true),
('Green Onions (Scallions)', 'vegetables', 'allium', 'g', 32, 1.8, 7, 0.2, 2.6, 0.004, 7, true),
('Shallots', 'vegetables', 'allium', 'g', 72, 2.5, 17, 0.1, 3.2, 0.008, 30, true),
('Leeks', 'vegetables', 'allium', 'g', 61, 1.5, 14, 0.3, 1.8, 0.005, 14, true),
('Garlic', 'vegetables', 'allium', 'g', 149, 6.4, 33, 0.5, 2.1, 0.010, 30, true),

-- Peppers
('Bell Pepper (red)', 'vegetables', 'pepper', 'g', 31, 1, 6, 0.3, 2.1, 0.004, 10, true),
('Bell Pepper (green)', 'vegetables', 'pepper', 'g', 20, 0.9, 4.6, 0.2, 1.7, 0.003, 10, true),
('Bell Pepper (yellow)', 'vegetables', 'pepper', 'g', 27, 1, 6, 0.2, 0.9, 0.004, 10, true),
('Bell Pepper (orange)', 'vegetables', 'pepper', 'g', 27, 1, 6, 0.2, 0.9, 0.004, 10, true),
('Jalapeño Pepper', 'vegetables', 'pepper', 'g', 29, 0.9, 6.5, 0.4, 2.8, 0.006, 14, true),
('Serrano Pepper', 'vegetables', 'pepper', 'g', 32, 1.7, 6.7, 0.4, 3.7, 0.008, 14, false),
('Poblano Pepper', 'vegetables', 'pepper', 'g', 20, 0.8, 4.3, 0.2, 1.6, 0.005, 10, true),
('Habanero Pepper', 'vegetables', 'pepper', 'g', 40, 1.9, 8.8, 0.4, 1.5, 0.012, 14, false),
('Banana Pepper', 'vegetables', 'pepper', 'g', 27, 1.7, 5.4, 0.5, 3.4, 0.006, 10, true),

-- Squash
('Zucchini', 'vegetables', 'squash', 'g', 17, 1.2, 3.1, 0.3, 1, 0.003, 7, true),
('Yellow Squash', 'vegetables', 'squash', 'g', 16, 1.2, 3.4, 0.2, 1.1, 0.003, 7, true),
('Butternut Squash', 'vegetables', 'squash', 'g', 45, 1, 12, 0.1, 2, 0.003, 30, true),
('Acorn Squash', 'vegetables', 'squash', 'g', 40, 0.8, 10, 0.1, 1.5, 0.003, 30, true),
('Spaghetti Squash', 'vegetables', 'squash', 'g', 31, 0.6, 7, 0.6, 1.5, 0.004, 30, true),
('Delicata Squash', 'vegetables', 'squash', 'g', 40, 1, 10, 0.1, 1.5, 0.004, 21, false),
('Pumpkin', 'vegetables', 'squash', 'g', 26, 1, 6.5, 0.1, 0.5, 0.003, 30, true),
('Pumpkin (canned)', 'vegetables', 'squash', 'g', 34, 1.1, 8.1, 0.3, 2.9, 0.006, 365, true),

-- Nightshades
('Tomatoes', 'vegetables', 'nightshade', 'g', 18, 0.9, 3.9, 0.2, 1.2, 0.003, 7, true),
('Cherry Tomatoes', 'vegetables', 'nightshade', 'g', 18, 0.9, 3.9, 0.2, 1.2, 0.008, 10, true),
('Roma Tomatoes', 'vegetables', 'nightshade', 'g', 18, 0.9, 3.9, 0.2, 1.2, 0.004, 7, true),
('Grape Tomatoes', 'vegetables', 'nightshade', 'g', 18, 0.9, 3.9, 0.2, 1.2, 0.008, 10, true),
('Sun-dried Tomatoes', 'vegetables', 'nightshade', 'g', 258, 14, 56, 3, 12, 0.025, 180, true),
('Canned Tomatoes (diced)', 'vegetables', 'nightshade', 'g', 17, 0.9, 3.5, 0.1, 0.9, 0.003, 365, true),
('Canned Tomatoes (crushed)', 'vegetables', 'nightshade', 'g', 32, 1.6, 7, 0.3, 1.7, 0.003, 365, true),
('Tomato Paste', 'vegetables', 'nightshade', 'g', 82, 4.3, 19, 0.5, 4.1, 0.008, 30, true),
('Eggplant', 'vegetables', 'nightshade', 'g', 25, 1, 6, 0.2, 3, 0.003, 7, true),

-- Other Vegetables
('Cucumber', 'vegetables', 'other', 'g', 15, 0.7, 3.6, 0.1, 0.5, 0.002, 7, true),
('Celery', 'vegetables', 'other', 'g', 14, 0.7, 3, 0.2, 1.6, 0.003, 14, true),
('Asparagus', 'vegetables', 'other', 'g', 20, 2.2, 3.9, 0.1, 2.1, 0.008, 5, true),
('Green Beans', 'vegetables', 'other', 'g', 31, 1.8, 7, 0.1, 3.4, 0.004, 7, true),
('Green Beans (frozen)', 'vegetables', 'other', 'g', 31, 1.8, 7, 0.1, 3.4, 0.003, 180, true),
('Snap Peas', 'vegetables', 'other', 'g', 42, 2.8, 7.5, 0.2, 2.6, 0.008, 5, true),
('Snow Peas', 'vegetables', 'other', 'g', 42, 2.8, 7.5, 0.2, 2.6, 0.008, 5, true),
('Green Peas', 'vegetables', 'other', 'g', 81, 5.4, 14, 0.4, 5.7, 0.004, 3, true),
('Green Peas (frozen)', 'vegetables', 'other', 'g', 81, 5.4, 14, 0.4, 5.7, 0.003, 180, true),
('Corn', 'vegetables', 'other', 'g', 86, 3.3, 19, 1.4, 2.7, 0.003, 3, true),
('Corn (frozen)', 'vegetables', 'other', 'g', 86, 3.3, 19, 1.4, 2.7, 0.002, 180, true),
('Corn (canned)', 'vegetables', 'other', 'g', 64, 2.1, 14, 0.8, 1.7, 0.002, 365, true),
('Artichoke Hearts', 'vegetables', 'other', 'g', 47, 3.3, 11, 0.2, 5.4, 0.015, 14, true),
('Artichoke Hearts (canned)', 'vegetables', 'other', 'g', 38, 2.5, 8, 0.3, 4.8, 0.010, 365, true),
('Hearts of Palm', 'vegetables', 'other', 'g', 28, 2.5, 4, 0.6, 2.4, 0.015, 14, false),
('Mushrooms (white)', 'vegetables', 'fungi', 'g', 22, 3.1, 3.3, 0.3, 1, 0.006, 7, true),
('Mushrooms (cremini)', 'vegetables', 'fungi', 'g', 27, 2.5, 4.3, 0.1, 0.6, 0.008, 7, true),
('Mushrooms (portobello)', 'vegetables', 'fungi', 'g', 22, 2.1, 3.9, 0.4, 1.3, 0.010, 7, true),
('Mushrooms (shiitake)', 'vegetables', 'fungi', 'g', 34, 2.2, 6.8, 0.5, 2.5, 0.012, 7, true),
('Olives (black)', 'vegetables', 'other', 'g', 115, 0.8, 6, 11, 3.2, 0.012, 30, true),
('Olives (green)', 'vegetables', 'other', 'g', 145, 1, 4, 15, 3.3, 0.012, 30, true),
('Avocado', 'vegetables', 'other', 'g', 160, 2, 9, 15, 7, 0.010, 5, true),
('Bean Sprouts', 'vegetables', 'other', 'g', 31, 3.2, 6, 0.2, 1.8, 0.004, 3, true),
('Water Chestnuts', 'vegetables', 'other', 'g', 97, 1.4, 24, 0.1, 3, 0.008, 14, false),
('Bamboo Shoots', 'vegetables', 'other', 'g', 27, 2.6, 5, 0.3, 2.2, 0.006, 7, false),
('Fennel', 'vegetables', 'other', 'g', 31, 1.2, 7, 0.2, 3.1, 0.006, 10, false),
('Kohlrabi', 'vegetables', 'other', 'g', 27, 1.7, 6, 0.1, 3.6, 0.004, 14, false);

-- ============================================
-- FRUITS (60 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Berries
('Strawberries', 'fruits', 'berries', 'g', 32, 0.7, 7.7, 0.3, 2, 0.008, 5, true),
('Blueberries', 'fruits', 'berries', 'g', 57, 0.7, 14, 0.3, 2.4, 0.012, 10, true),
('Raspberries', 'fruits', 'berries', 'g', 52, 1.2, 12, 0.7, 6.5, 0.015, 3, true),
('Blackberries', 'fruits', 'berries', 'g', 43, 1.4, 10, 0.5, 5.3, 0.012, 3, true),
('Cranberries (fresh)', 'fruits', 'berries', 'g', 46, 0.4, 12, 0.1, 4.6, 0.010, 30, true),
('Mixed Berries (frozen)', 'fruits', 'berries', 'g', 48, 0.9, 11, 0.4, 4, 0.008, 180, true),

-- Citrus
('Orange', 'fruits', 'citrus', 'g', 47, 0.9, 12, 0.1, 2.4, 0.003, 14, true),
('Lemon', 'fruits', 'citrus', 'g', 29, 1.1, 9, 0.3, 2.8, 0.003, 21, true),
('Lime', 'fruits', 'citrus', 'g', 30, 0.7, 11, 0.2, 2.8, 0.003, 21, true),
('Grapefruit', 'fruits', 'citrus', 'g', 42, 0.8, 11, 0.1, 1.6, 0.004, 21, true),
('Clementine', 'fruits', 'citrus', 'g', 47, 0.9, 12, 0.2, 1.7, 0.006, 14, true),
('Tangerine', 'fruits', 'citrus', 'g', 53, 0.8, 13, 0.3, 1.8, 0.005, 14, true),

-- Tropical
('Banana', 'fruits', 'tropical', 'g', 89, 1.1, 23, 0.3, 2.6, 0.002, 7, true),
('Mango', 'fruits', 'tropical', 'g', 60, 0.8, 15, 0.4, 1.6, 0.006, 5, true),
('Pineapple', 'fruits', 'tropical', 'g', 50, 0.5, 13, 0.1, 1.4, 0.004, 5, true),
('Papaya', 'fruits', 'tropical', 'g', 43, 0.5, 11, 0.3, 1.7, 0.005, 5, true),
('Kiwi', 'fruits', 'tropical', 'g', 61, 1.1, 15, 0.5, 3, 0.006, 14, true),
('Coconut (shredded, unsweetened)', 'fruits', 'tropical', 'g', 354, 3.3, 15, 33, 9, 0.012, 180, true),
('Passion Fruit', 'fruits', 'tropical', 'g', 97, 2.2, 23, 0.7, 10, 0.015, 7, false),
('Dragon Fruit', 'fruits', 'tropical', 'g', 60, 1.2, 13, 0.4, 3, 0.012, 5, false),
('Guava', 'fruits', 'tropical', 'g', 68, 2.6, 14, 1, 5.4, 0.008, 5, false),

-- Stone Fruits
('Peach', 'fruits', 'stone', 'g', 39, 0.9, 10, 0.3, 1.5, 0.004, 5, true),
('Nectarine', 'fruits', 'stone', 'g', 44, 1.1, 11, 0.3, 1.7, 0.005, 5, true),
('Plum', 'fruits', 'stone', 'g', 46, 0.7, 11, 0.3, 1.4, 0.004, 5, true),
('Apricot', 'fruits', 'stone', 'g', 48, 1.4, 11, 0.4, 2, 0.005, 5, true),
('Cherries', 'fruits', 'stone', 'g', 63, 1.1, 16, 0.2, 2.1, 0.010, 7, true),
('Mango (frozen)', 'fruits', 'stone', 'g', 60, 0.8, 15, 0.4, 1.6, 0.008, 180, true),

-- Apples & Pears
('Apple (Gala)', 'fruits', 'pome', 'g', 52, 0.3, 14, 0.2, 2.4, 0.003, 30, true),
('Apple (Fuji)', 'fruits', 'pome', 'g', 52, 0.3, 14, 0.2, 2.4, 0.003, 30, true),
('Apple (Granny Smith)', 'fruits', 'pome', 'g', 52, 0.4, 14, 0.1, 2.8, 0.003, 30, true),
('Apple (Honeycrisp)', 'fruits', 'pome', 'g', 52, 0.3, 14, 0.2, 2.4, 0.004, 30, true),
('Pear (Bartlett)', 'fruits', 'pome', 'g', 57, 0.4, 15, 0.1, 3.1, 0.004, 7, true),
('Pear (Bosc)', 'fruits', 'pome', 'g', 57, 0.4, 15, 0.1, 3.1, 0.004, 7, true),

-- Melons
('Watermelon', 'fruits', 'melon', 'g', 30, 0.6, 8, 0.2, 0.4, 0.002, 7, true),
('Cantaloupe', 'fruits', 'melon', 'g', 34, 0.8, 8, 0.2, 0.9, 0.003, 7, true),
('Honeydew', 'fruits', 'melon', 'g', 36, 0.5, 9, 0.1, 0.8, 0.003, 7, true),

-- Grapes
('Grapes (red)', 'fruits', 'grapes', 'g', 69, 0.7, 18, 0.2, 0.9, 0.006, 10, true),
('Grapes (green)', 'fruits', 'grapes', 'g', 69, 0.7, 18, 0.2, 0.9, 0.006, 10, true),

-- Dried Fruits
('Raisins', 'fruits', 'dried', 'g', 299, 3.1, 79, 0.5, 3.7, 0.008, 180, true),
('Dates (Medjool)', 'fruits', 'dried', 'g', 277, 1.8, 75, 0.2, 6.7, 0.015, 180, true),
('Dried Cranberries', 'fruits', 'dried', 'g', 308, 0.1, 82, 1.4, 5.7, 0.012, 180, true),
('Dried Apricots', 'fruits', 'dried', 'g', 241, 3.4, 63, 0.5, 7.3, 0.012, 180, true),
('Prunes', 'fruits', 'dried', 'g', 240, 2.2, 64, 0.4, 7.1, 0.010, 180, true),
('Dried Figs', 'fruits', 'dried', 'g', 249, 3.3, 64, 0.9, 9.8, 0.012, 180, true),
('Goji Berries', 'fruits', 'dried', 'g', 349, 14, 77, 0.4, 13, 0.025, 365, false),

-- Frozen Fruits
('Strawberries (frozen)', 'fruits', 'frozen', 'g', 35, 0.7, 8, 0.3, 2, 0.006, 180, true),
('Blueberries (frozen)', 'fruits', 'frozen', 'g', 57, 0.7, 14, 0.3, 2.4, 0.008, 180, true),
('Raspberries (frozen)', 'fruits', 'frozen', 'g', 52, 1.2, 12, 0.7, 6.5, 0.010, 180, true),
('Peaches (frozen)', 'fruits', 'frozen', 'g', 39, 0.9, 10, 0.3, 1.5, 0.006, 180, true),
('Cherries (frozen)', 'fruits', 'frozen', 'g', 63, 1.1, 16, 0.2, 2.1, 0.008, 180, true),
('Banana (frozen)', 'fruits', 'frozen', 'g', 89, 1.1, 23, 0.3, 2.6, 0.004, 180, true),
('Acai (frozen puree)', 'fruits', 'frozen', 'g', 80, 1.5, 6, 5, 3, 0.020, 180, false),

-- Other Fruits
('Pomegranate', 'fruits', 'other', 'g', 83, 1.7, 19, 1.2, 4, 0.010, 14, true),
('Pomegranate Seeds', 'fruits', 'other', 'g', 83, 1.7, 19, 1.2, 4, 0.015, 5, true),
('Figs (fresh)', 'fruits', 'other', 'g', 74, 0.8, 19, 0.3, 2.9, 0.010, 3, false),
('Persimmon', 'fruits', 'other', 'g', 70, 0.6, 19, 0.2, 3.6, 0.008, 7, false),
('Lychee', 'fruits', 'other', 'g', 66, 0.8, 17, 0.4, 1.3, 0.012, 5, false),
('Starfruit', 'fruits', 'other', 'g', 31, 1, 7, 0.3, 2.8, 0.010, 7, false);

-- ============================================
-- GRAINS (50 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Rice
('Brown Rice', 'grains', 'rice', 'g', 111, 2.6, 23, 0.9, 1.8, 0.003, 180, true),
('White Rice (long grain)', 'grains', 'rice', 'g', 130, 2.7, 28, 0.3, 0.4, 0.002, 365, true),
('Jasmine Rice', 'grains', 'rice', 'g', 130, 2.7, 28, 0.3, 0.4, 0.003, 365, true),
('Basmati Rice', 'grains', 'rice', 'g', 121, 3.5, 25, 0.4, 0.4, 0.003, 365, true),
('Wild Rice', 'grains', 'rice', 'g', 101, 4, 21, 0.3, 1.8, 0.008, 180, true),
('Arborio Rice', 'grains', 'rice', 'g', 130, 2.4, 28, 0.2, 0.2, 0.004, 365, true),
('Black Rice', 'grains', 'rice', 'g', 356, 8.9, 76, 3.3, 3.5, 0.006, 180, false),
('Rice (instant)', 'grains', 'rice', 'g', 117, 2.5, 26, 0.2, 0.3, 0.002, 365, true),
('Cauliflower Rice', 'grains', 'rice_alternative', 'g', 25, 2, 5, 0.3, 2, 0.008, 5, true),

-- Pasta
('Whole Wheat Pasta', 'grains', 'pasta', 'g', 348, 15, 75, 1.4, 8, 0.004, 365, true),
('Regular Pasta', 'grains', 'pasta', 'g', 371, 13, 75, 1.5, 3.2, 0.003, 365, true),
('Brown Rice Pasta', 'grains', 'pasta', 'g', 356, 8, 78, 2, 2, 0.006, 365, true),
('Chickpea Pasta', 'grains', 'pasta', 'g', 340, 22, 56, 5, 11, 0.008, 365, true),
('Lentil Pasta', 'grains', 'pasta', 'g', 350, 25, 53, 2, 11, 0.008, 365, true),
('Zucchini Noodles (fresh)', 'grains', 'pasta_alternative', 'g', 17, 1.2, 3.1, 0.3, 1, 0.010, 3, true),
('Shirataki Noodles', 'grains', 'pasta_alternative', 'g', 9, 0, 3, 0, 3, 0.008, 30, true),
('Rice Noodles', 'grains', 'pasta', 'g', 360, 3.4, 84, 0.6, 1.6, 0.004, 365, true),
('Soba Noodles', 'grains', 'pasta', 'g', 336, 14, 74, 0.7, 0, 0.006, 365, true),
('Udon Noodles', 'grains', 'pasta', 'g', 337, 8.5, 74, 0.5, 2.5, 0.005, 365, true),
('Egg Noodles', 'grains', 'pasta', 'g', 384, 14, 71, 5, 3.3, 0.004, 365, true),
('Orzo', 'grains', 'pasta', 'g', 371, 13, 75, 1.5, 3.2, 0.004, 365, true),
('Couscous', 'grains', 'pasta', 'g', 376, 13, 77, 0.6, 5, 0.004, 365, true),

-- Bread
('Whole Wheat Bread', 'grains', 'bread', 'slice', 81, 4, 15, 1, 2, 0.15, 7, true),
('Ezekiel Bread', 'grains', 'bread', 'slice', 80, 4, 15, 0.5, 3, 0.20, 7, true),
('Sourdough Bread', 'grains', 'bread', 'slice', 93, 4, 18, 0.5, 1, 0.18, 5, true),
('Pita Bread (whole wheat)', 'grains', 'bread', 'piece', 170, 6, 35, 1.5, 5, 0.30, 7, true),
('Tortilla (whole wheat)', 'grains', 'bread', 'piece', 120, 3.5, 20, 3, 3, 0.25, 14, true),
('Tortilla (corn)', 'grains', 'bread', 'piece', 52, 1.4, 11, 0.7, 1.5, 0.15, 14, true),
('English Muffin (whole wheat)', 'grains', 'bread', 'piece', 127, 5, 26, 1, 4.4, 0.30, 7, true),
('Bagel (whole wheat)', 'grains', 'bread', 'piece', 250, 10, 49, 1.5, 4, 0.50, 5, true),

-- Ancient Grains
('Quinoa', 'grains', 'ancient', 'g', 120, 4.4, 21, 1.9, 2.8, 0.006, 180, true),
('Farro', 'grains', 'ancient', 'g', 340, 14, 72, 2.5, 7, 0.006, 180, true),
('Bulgur Wheat', 'grains', 'ancient', 'g', 342, 12, 76, 1.3, 18, 0.004, 180, true),
('Barley', 'grains', 'ancient', 'g', 354, 12, 73, 2.3, 17, 0.003, 180, true),
('Freekeh', 'grains', 'ancient', 'g', 350, 14, 72, 2.5, 16, 0.008, 180, false),
('Millet', 'grains', 'ancient', 'g', 378, 11, 73, 4.2, 8.5, 0.004, 180, true),
('Amaranth', 'grains', 'ancient', 'g', 371, 14, 65, 7, 7, 0.006, 180, false),
('Buckwheat', 'grains', 'ancient', 'g', 343, 13, 72, 3.4, 10, 0.005, 180, true),
('Teff', 'grains', 'ancient', 'g', 367, 13, 73, 2.4, 8, 0.008, 180, false),
('Spelt', 'grains', 'ancient', 'g', 338, 15, 70, 2.4, 11, 0.006, 180, false),
('Kamut', 'grains', 'ancient', 'g', 337, 15, 70, 2.2, 11, 0.008, 180, false),

-- Oats
('Rolled Oats', 'grains', 'oats', 'g', 389, 17, 66, 7, 11, 0.004, 365, true),
('Steel Cut Oats', 'grains', 'oats', 'g', 379, 13, 68, 6, 10, 0.005, 365, true),
('Instant Oats', 'grains', 'oats', 'g', 367, 12, 68, 6, 9, 0.004, 365, true),
('Oat Bran', 'grains', 'oats', 'g', 246, 17, 66, 7, 15, 0.006, 180, true),

-- Other Grains
('Cornmeal', 'grains', 'corn', 'g', 370, 8.5, 77, 3.6, 7.3, 0.003, 180, true),
('Polenta', 'grains', 'corn', 'g', 370, 8, 79, 1.1, 5, 0.004, 180, true),
('Wheat Germ', 'grains', 'wheat', 'g', 360, 23, 52, 10, 13, 0.008, 90, true),
('Wheat Bran', 'grains', 'wheat', 'g', 216, 16, 65, 4.3, 43, 0.005, 180, true);

-- ============================================
-- DAIRY (35 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Milk
('Milk (skim)', 'dairy', 'milk', 'ml', 34, 3.4, 5, 0.1, 0, 0.003, 7, true),
('Milk (1%)', 'dairy', 'milk', 'ml', 42, 3.4, 5, 1, 0, 0.003, 7, true),
('Milk (2%)', 'dairy', 'milk', 'ml', 50, 3.3, 5, 2, 0, 0.003, 7, true),
('Milk (whole)', 'dairy', 'milk', 'ml', 61, 3.2, 4.8, 3.3, 0, 0.003, 7, true),
('Almond Milk (unsweetened)', 'dairy', 'milk_alternative', 'ml', 13, 0.4, 0.3, 1.1, 0.2, 0.004, 10, true),
('Oat Milk (unsweetened)', 'dairy', 'milk_alternative', 'ml', 42, 1, 7, 1.5, 0.8, 0.005, 10, true),
('Soy Milk (unsweetened)', 'dairy', 'milk_alternative', 'ml', 33, 2.9, 1.2, 1.8, 0.4, 0.004, 10, true),
('Coconut Milk (canned)', 'dairy', 'milk_alternative', 'ml', 197, 2.3, 6, 21, 2.2, 0.005, 365, true),
('Coconut Milk (carton)', 'dairy', 'milk_alternative', 'ml', 45, 0.2, 2, 4.5, 0, 0.004, 10, true),

-- Yogurt
('Plain Yogurt (low-fat)', 'dairy', 'yogurt', 'g', 63, 5.3, 7.7, 1.6, 0, 0.006, 14, true),
('Plain Yogurt (whole)', 'dairy', 'yogurt', 'g', 97, 9, 4, 5, 0, 0.006, 14, true),
('Kefir (plain)', 'dairy', 'yogurt', 'ml', 67, 3.3, 4.5, 3.5, 0, 0.008, 14, true),

-- Cheese
('Cheddar Cheese', 'dairy', 'cheese', 'g', 403, 25, 1.3, 33, 0, 0.012, 30, true),
('Mozzarella (part-skim)', 'dairy', 'cheese', 'g', 280, 28, 3.1, 17, 0, 0.010, 21, true),
('Mozzarella (fresh)', 'dairy', 'cheese', 'g', 280, 22, 2.2, 22, 0, 0.015, 7, true),
('Parmesan Cheese', 'dairy', 'cheese', 'g', 431, 38, 4.1, 29, 0, 0.025, 60, true),
('Feta Cheese', 'dairy', 'cheese', 'g', 264, 14, 4.1, 21, 0, 0.015, 30, true),
('Ricotta (part-skim)', 'dairy', 'cheese', 'g', 138, 11, 5.1, 8, 0, 0.010, 14, true),
('Cream Cheese (light)', 'dairy', 'cheese', 'g', 201, 8, 5, 17, 0, 0.012, 21, true),
('Goat Cheese', 'dairy', 'cheese', 'g', 364, 22, 0.1, 30, 0, 0.020, 21, true),
('Swiss Cheese', 'dairy', 'cheese', 'g', 380, 27, 5.4, 28, 0, 0.015, 30, true),
('Provolone Cheese', 'dairy', 'cheese', 'g', 351, 26, 2.1, 27, 0, 0.012, 30, true),
('Blue Cheese', 'dairy', 'cheese', 'g', 353, 21, 2.3, 29, 0, 0.018, 30, false),
('Brie Cheese', 'dairy', 'cheese', 'g', 334, 21, 0.5, 28, 0, 0.020, 14, false),
('Colby Jack Cheese', 'dairy', 'cheese', 'g', 393, 24, 2.4, 32, 0, 0.012, 30, true),
('Pepper Jack Cheese', 'dairy', 'cheese', 'g', 393, 25, 1, 32, 0, 0.012, 30, true),
('String Cheese', 'dairy', 'cheese', 'g', 280, 28, 3.1, 17, 0, 0.015, 30, true),

-- Butter & Cream
('Butter (unsalted)', 'dairy', 'butter', 'g', 717, 0.9, 0.1, 81, 0, 0.012, 60, true),
('Butter (salted)', 'dairy', 'butter', 'g', 717, 0.9, 0.1, 81, 0, 0.012, 60, true),
('Ghee', 'dairy', 'butter', 'g', 876, 0, 0, 99, 0, 0.020, 180, true),
('Heavy Cream', 'dairy', 'cream', 'ml', 340, 2.1, 2.8, 36, 0, 0.012, 10, true),
('Half and Half', 'dairy', 'cream', 'ml', 130, 3, 4.3, 12, 0, 0.008, 10, true),
('Sour Cream', 'dairy', 'cream', 'g', 193, 2.4, 4.6, 19, 0, 0.008, 21, true),
('Sour Cream (light)', 'dairy', 'cream', 'g', 136, 3.5, 6, 10, 0, 0.008, 21, true),
('Cream Cheese', 'dairy', 'cream', 'g', 342, 6, 4, 34, 0, 0.012, 21, true);

-- ============================================
-- FATS & OILS (25 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Olive Oil (extra virgin)', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.015, 365, true),
('Olive Oil (light)', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.012, 365, true),
('Coconut Oil', 'fats_oils', 'oil', 'ml', 862, 0, 0, 100, 0, 0.012, 365, true),
('Avocado Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.020, 365, true),
('Sesame Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.015, 180, true),
('Sesame Oil (toasted)', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.018, 180, true),
('Canola Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.008, 365, true),
('Vegetable Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.006, 365, true),
('Grapeseed Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.012, 180, true),
('Flaxseed Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.025, 60, false),
('Walnut Oil', 'fats_oils', 'oil', 'ml', 884, 0, 0, 100, 0, 0.025, 90, false),
('MCT Oil', 'fats_oils', 'oil', 'ml', 831, 0, 0, 100, 0, 0.040, 365, false),
('Cooking Spray (olive oil)', 'fats_oils', 'spray', 'spray', 0, 0, 0, 0, 0, 0.02, 365, true),
('Cooking Spray (coconut)', 'fats_oils', 'spray', 'spray', 0, 0, 0, 0, 0, 0.02, 365, true),
('Mayonnaise', 'fats_oils', 'condiment', 'g', 680, 1, 0.6, 75, 0, 0.008, 60, true),
('Mayonnaise (light)', 'fats_oils', 'condiment', 'g', 231, 0.5, 5, 23, 0, 0.008, 60, true),
('Mayonnaise (avocado oil)', 'fats_oils', 'condiment', 'g', 680, 1, 0.6, 75, 0, 0.012, 60, true),
('Tahini', 'fats_oils', 'paste', 'g', 595, 17, 21, 54, 9, 0.015, 180, true),
('Peanut Butter (natural)', 'fats_oils', 'nut_butter', 'g', 588, 25, 20, 50, 6, 0.010, 90, true),
('Almond Butter', 'fats_oils', 'nut_butter', 'g', 614, 21, 19, 56, 10, 0.018, 90, true),
('Cashew Butter', 'fats_oils', 'nut_butter', 'g', 587, 18, 28, 49, 2, 0.020, 90, true),
('Sunflower Seed Butter', 'fats_oils', 'nut_butter', 'g', 617, 21, 19, 55, 6, 0.015, 90, true),
('Pumpkin Seed Butter', 'fats_oils', 'nut_butter', 'g', 559, 30, 14, 47, 6, 0.020, 90, false),
('Coconut Butter', 'fats_oils', 'nut_butter', 'g', 660, 6, 23, 65, 17, 0.018, 180, false),
('Peanut Butter Powder', 'fats_oils', 'powder', 'g', 380, 50, 25, 8, 6, 0.025, 365, true);

-- ============================================
-- LEGUMES (30 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Black Beans (canned)', 'legumes', 'beans', 'g', 91, 6.1, 16, 0.4, 5.5, 0.003, 365, true),
('Black Beans (dried)', 'legumes', 'beans', 'g', 341, 21, 62, 1.4, 16, 0.004, 365, true),
('Kidney Beans (canned)', 'legumes', 'beans', 'g', 105, 7, 18, 0.4, 6.3, 0.003, 365, true),
('Kidney Beans (dried)', 'legumes', 'beans', 'g', 333, 24, 60, 0.8, 25, 0.004, 365, true),
('Chickpeas (canned)', 'legumes', 'beans', 'g', 139, 7.3, 22, 2.4, 6, 0.003, 365, true),
('Chickpeas (dried)', 'legumes', 'beans', 'g', 364, 19, 61, 6, 17, 0.004, 365, true),
('Lentils (dried)', 'legumes', 'lentils', 'g', 352, 25, 63, 1.1, 11, 0.004, 365, true),
('Lentils (canned)', 'legumes', 'lentils', 'g', 100, 8, 17, 0.4, 5, 0.004, 365, true),
('Red Lentils', 'legumes', 'lentils', 'g', 358, 24, 63, 1.3, 11, 0.005, 365, true),
('Green Lentils', 'legumes', 'lentils', 'g', 352, 25, 63, 1.1, 11, 0.004, 365, true),
('Black Lentils (Beluga)', 'legumes', 'lentils', 'g', 352, 26, 60, 1, 18, 0.008, 365, false),
('Split Peas (yellow)', 'legumes', 'peas', 'g', 341, 25, 60, 1.2, 25, 0.004, 365, true),
('Split Peas (green)', 'legumes', 'peas', 'g', 341, 25, 60, 1.2, 25, 0.004, 365, true),
('Navy Beans (canned)', 'legumes', 'beans', 'g', 140, 8, 26, 0.6, 10, 0.003, 365, true),
('White Beans (canned)', 'legumes', 'beans', 'g', 139, 9.7, 25, 0.4, 6, 0.003, 365, true),
('Great Northern Beans', 'legumes', 'beans', 'g', 339, 21, 63, 1.1, 17, 0.004, 365, true),
('Cannellini Beans', 'legumes', 'beans', 'g', 333, 23, 60, 0.9, 25, 0.004, 365, true),
('Pinto Beans (canned)', 'legumes', 'beans', 'g', 91, 5.4, 16, 0.3, 4.3, 0.003, 365, true),
('Pinto Beans (dried)', 'legumes', 'beans', 'g', 347, 21, 63, 1.2, 16, 0.004, 365, true),
('Lima Beans (frozen)', 'legumes', 'beans', 'g', 113, 7, 20, 0.4, 5, 0.004, 180, true),
('Black-eyed Peas', 'legumes', 'peas', 'g', 116, 8, 21, 0.5, 4, 0.004, 365, true),
('Refried Beans', 'legumes', 'beans', 'g', 91, 5.4, 15, 1.2, 5, 0.004, 365, true),
('Refried Beans (fat-free)', 'legumes', 'beans', 'g', 75, 5, 14, 0, 5, 0.004, 365, true),
('Hummus', 'legumes', 'prepared', 'g', 166, 7.9, 14, 10, 6, 0.012, 10, true),
('Baked Beans', 'legumes', 'prepared', 'g', 94, 5, 18, 0.5, 4, 0.004, 365, true),
('Falafel Mix', 'legumes', 'prepared', 'g', 333, 13, 53, 7, 0, 0.008, 180, true),
('Mung Beans', 'legumes', 'beans', 'g', 347, 24, 63, 1.2, 16, 0.006, 365, false),
('Adzuki Beans', 'legumes', 'beans', 'g', 329, 20, 63, 0.5, 13, 0.006, 365, false),
('Soybeans (dried)', 'legumes', 'beans', 'g', 446, 36, 30, 20, 9, 0.006, 365, true),
('Lupini Beans', 'legumes', 'beans', 'g', 119, 16, 10, 3, 5, 0.010, 14, false);

-- ============================================
-- NUTS & SEEDS (30 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Almonds (raw)', 'nuts_seeds', 'nuts', 'g', 579, 21, 22, 50, 12, 0.015, 180, true),
('Almonds (roasted)', 'nuts_seeds', 'nuts', 'g', 607, 21, 19, 55, 11, 0.015, 180, true),
('Almonds (sliced)', 'nuts_seeds', 'nuts', 'g', 579, 21, 22, 50, 12, 0.018, 180, true),
('Walnuts', 'nuts_seeds', 'nuts', 'g', 654, 15, 14, 65, 7, 0.018, 180, true),
('Cashews (raw)', 'nuts_seeds', 'nuts', 'g', 553, 18, 30, 44, 3, 0.018, 180, true),
('Cashews (roasted)', 'nuts_seeds', 'nuts', 'g', 574, 17, 32, 46, 3, 0.018, 180, true),
('Pecans', 'nuts_seeds', 'nuts', 'g', 691, 9, 14, 72, 10, 0.020, 180, true),
('Pistachios', 'nuts_seeds', 'nuts', 'g', 560, 20, 28, 45, 10, 0.025, 180, true),
('Macadamia Nuts', 'nuts_seeds', 'nuts', 'g', 718, 8, 14, 76, 9, 0.035, 180, false),
('Hazelnuts', 'nuts_seeds', 'nuts', 'g', 628, 15, 17, 61, 10, 0.020, 180, true),
('Brazil Nuts', 'nuts_seeds', 'nuts', 'g', 659, 14, 12, 67, 8, 0.025, 180, false),
('Pine Nuts', 'nuts_seeds', 'nuts', 'g', 673, 14, 13, 68, 4, 0.045, 60, true),
('Peanuts (raw)', 'nuts_seeds', 'nuts', 'g', 567, 26, 16, 49, 9, 0.008, 180, true),
('Peanuts (roasted)', 'nuts_seeds', 'nuts', 'g', 599, 26, 21, 52, 8, 0.008, 180, true),
('Mixed Nuts (unsalted)', 'nuts_seeds', 'nuts', 'g', 607, 20, 21, 54, 7, 0.020, 180, true),

-- Seeds
('Chia Seeds', 'nuts_seeds', 'seeds', 'g', 486, 17, 42, 31, 34, 0.025, 365, true),
('Flax Seeds', 'nuts_seeds', 'seeds', 'g', 534, 18, 29, 42, 27, 0.012, 365, true),
('Flax Seeds (ground)', 'nuts_seeds', 'seeds', 'g', 534, 18, 29, 42, 27, 0.015, 90, true),
('Hemp Seeds', 'nuts_seeds', 'seeds', 'g', 553, 32, 9, 49, 4, 0.030, 365, true),
('Pumpkin Seeds (pepitas)', 'nuts_seeds', 'seeds', 'g', 559, 30, 11, 49, 6, 0.018, 180, true),
('Sunflower Seeds', 'nuts_seeds', 'seeds', 'g', 584, 21, 20, 51, 9, 0.012, 180, true),
('Sesame Seeds', 'nuts_seeds', 'seeds', 'g', 573, 18, 23, 50, 12, 0.012, 180, true),
('Poppy Seeds', 'nuts_seeds', 'seeds', 'g', 525, 18, 28, 42, 20, 0.015, 180, false),
('Sunflower Seeds (roasted)', 'nuts_seeds', 'seeds', 'g', 619, 21, 24, 53, 9, 0.012, 180, true),
('Pumpkin Seeds (roasted)', 'nuts_seeds', 'seeds', 'g', 574, 30, 15, 49, 6, 0.018, 180, true),
('Coconut Flakes (unsweetened)', 'nuts_seeds', 'coconut', 'g', 660, 6, 24, 65, 16, 0.015, 180, true),
('Coconut (shredded, sweetened)', 'nuts_seeds', 'coconut', 'g', 466, 3, 47, 33, 4, 0.012, 180, true),
('Almond Flour', 'nuts_seeds', 'flour', 'g', 571, 21, 19, 50, 10, 0.020, 180, true),
('Coconut Flour', 'nuts_seeds', 'flour', 'g', 443, 19, 60, 14, 41, 0.015, 365, true),
('Ground Flaxseed', 'nuts_seeds', 'flour', 'g', 534, 18, 29, 42, 27, 0.015, 90, true);

-- ============================================
-- SPICES & HERBS (50 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
-- Fresh Herbs
('Basil (fresh)', 'spices_herbs', 'fresh_herb', 'g', 23, 3.2, 2.7, 0.6, 1.6, 0.040, 7, true),
('Cilantro (fresh)', 'spices_herbs', 'fresh_herb', 'g', 23, 2.1, 3.7, 0.5, 2.8, 0.030, 7, true),
('Parsley (fresh)', 'spices_herbs', 'fresh_herb', 'g', 36, 3, 6.3, 0.8, 3.3, 0.030, 10, true),
('Mint (fresh)', 'spices_herbs', 'fresh_herb', 'g', 44, 3.3, 8.4, 0.7, 6.8, 0.035, 7, true),
('Rosemary (fresh)', 'spices_herbs', 'fresh_herb', 'g', 131, 3.3, 21, 5.9, 14, 0.040, 14, true),
('Thyme (fresh)', 'spices_herbs', 'fresh_herb', 'g', 101, 5.6, 24, 1.7, 14, 0.040, 14, true),
('Oregano (fresh)', 'spices_herbs', 'fresh_herb', 'g', 265, 9, 69, 4.3, 43, 0.040, 10, true),
('Dill (fresh)', 'spices_herbs', 'fresh_herb', 'g', 43, 3.5, 7, 1.1, 2.1, 0.035, 7, true),
('Chives (fresh)', 'spices_herbs', 'fresh_herb', 'g', 30, 3.3, 4.4, 0.7, 2.5, 0.035, 7, true),
('Sage (fresh)', 'spices_herbs', 'fresh_herb', 'g', 315, 11, 61, 13, 40, 0.040, 10, true),
('Tarragon (fresh)', 'spices_herbs', 'fresh_herb', 'g', 295, 23, 50, 7, 7, 0.050, 7, false),
('Lemongrass', 'spices_herbs', 'fresh_herb', 'g', 99, 1.8, 25, 0.5, 0, 0.012, 14, true),
('Ginger (fresh)', 'spices_herbs', 'fresh_herb', 'g', 80, 1.8, 18, 0.8, 2, 0.008, 21, true),

-- Dried Herbs & Spices
('Garlic Powder', 'spices_herbs', 'dried_spice', 'g', 331, 17, 73, 0.7, 9, 0.020, 365, true),
('Onion Powder', 'spices_herbs', 'dried_spice', 'g', 341, 10, 79, 1, 15, 0.018, 365, true),
('Cumin (ground)', 'spices_herbs', 'dried_spice', 'g', 375, 18, 44, 22, 11, 0.025, 365, true),
('Paprika', 'spices_herbs', 'dried_spice', 'g', 282, 14, 54, 13, 35, 0.020, 365, true),
('Paprika (smoked)', 'spices_herbs', 'dried_spice', 'g', 282, 14, 54, 13, 35, 0.025, 365, true),
('Chili Powder', 'spices_herbs', 'dried_spice', 'g', 282, 12, 50, 14, 35, 0.020, 365, true),
('Cayenne Pepper', 'spices_herbs', 'dried_spice', 'g', 318, 12, 57, 17, 27, 0.025, 365, true),
('Red Pepper Flakes', 'spices_herbs', 'dried_spice', 'g', 318, 12, 57, 17, 27, 0.020, 365, true),
('Black Pepper', 'spices_herbs', 'dried_spice', 'g', 251, 10, 64, 3.3, 25, 0.025, 365, true),
('White Pepper', 'spices_herbs', 'dried_spice', 'g', 296, 10, 69, 2.1, 26, 0.030, 365, true),
('Cinnamon (ground)', 'spices_herbs', 'dried_spice', 'g', 247, 4, 81, 1.2, 53, 0.020, 365, true),
('Nutmeg', 'spices_herbs', 'dried_spice', 'g', 525, 6, 49, 36, 21, 0.030, 365, true),
('Ginger (ground)', 'spices_herbs', 'dried_spice', 'g', 335, 9, 72, 4.2, 14, 0.025, 365, true),
('Turmeric (ground)', 'spices_herbs', 'dried_spice', 'g', 312, 10, 67, 3.2, 23, 0.025, 365, true),
('Coriander (ground)', 'spices_herbs', 'dried_spice', 'g', 298, 12, 55, 18, 42, 0.020, 365, true),
('Oregano (dried)', 'spices_herbs', 'dried_herb', 'g', 265, 9, 69, 4.3, 43, 0.020, 365, true),
('Basil (dried)', 'spices_herbs', 'dried_herb', 'g', 233, 23, 48, 4, 38, 0.020, 365, true),
('Thyme (dried)', 'spices_herbs', 'dried_herb', 'g', 276, 9, 64, 7.4, 37, 0.020, 365, true),
('Rosemary (dried)', 'spices_herbs', 'dried_herb', 'g', 331, 5, 64, 15, 43, 0.020, 365, true),
('Bay Leaves', 'spices_herbs', 'dried_herb', 'g', 313, 8, 75, 8.4, 26, 0.025, 365, true),
('Italian Seasoning', 'spices_herbs', 'blend', 'g', 260, 9, 55, 6, 35, 0.018, 365, true),
('Herbs de Provence', 'spices_herbs', 'blend', 'g', 280, 8, 60, 7, 30, 0.025, 365, true),
('Curry Powder', 'spices_herbs', 'blend', 'g', 325, 14, 58, 14, 33, 0.020, 365, true),
('Garam Masala', 'spices_herbs', 'blend', 'g', 379, 14, 59, 15, 53, 0.025, 365, true),
('Taco Seasoning', 'spices_herbs', 'blend', 'g', 293, 8, 56, 9, 17, 0.015, 365, true),
('Everything Bagel Seasoning', 'spices_herbs', 'blend', 'g', 350, 12, 40, 18, 8, 0.020, 365, true),
('Mustard (ground)', 'spices_herbs', 'dried_spice', 'g', 508, 26, 28, 36, 12, 0.020, 365, true),
('Allspice', 'spices_herbs', 'dried_spice', 'g', 263, 6, 73, 9, 22, 0.025, 365, true),
('Cloves (ground)', 'spices_herbs', 'dried_spice', 'g', 274, 6, 66, 13, 34, 0.030, 365, true),
('Cardamom', 'spices_herbs', 'dried_spice', 'g', 311, 11, 68, 7, 28, 0.050, 365, true),
('Fennel Seeds', 'spices_herbs', 'dried_spice', 'g', 345, 16, 52, 15, 40, 0.025, 365, true),
('Cumin Seeds', 'spices_herbs', 'dried_spice', 'g', 375, 18, 44, 22, 11, 0.020, 365, true),
('Saffron', 'spices_herbs', 'dried_spice', 'g', 310, 11, 65, 6, 4, 0.500, 365, false),
('Vanilla Extract', 'spices_herbs', 'extract', 'ml', 288, 0.1, 13, 0.1, 0, 0.150, 365, true),
('Almond Extract', 'spices_herbs', 'extract', 'ml', 239, 0, 0, 0, 0, 0.100, 365, true),
('Salt (table)', 'spices_herbs', 'seasoning', 'g', 0, 0, 0, 0, 0, 0.002, 365, true),
('Salt (kosher)', 'spices_herbs', 'seasoning', 'g', 0, 0, 0, 0, 0, 0.003, 365, true);

-- ============================================
-- CONDIMENTS (40 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Soy Sauce (low sodium)', 'condiments', 'sauce', 'ml', 53, 8, 5, 0, 0.8, 0.008, 365, true),
('Soy Sauce (regular)', 'condiments', 'sauce', 'ml', 53, 8, 5, 0, 0.8, 0.006, 365, true),
('Coconut Aminos', 'condiments', 'sauce', 'ml', 20, 0, 5, 0, 0, 0.020, 365, true),
('Fish Sauce', 'condiments', 'sauce', 'ml', 35, 5, 4, 0, 0, 0.012, 365, true),
('Worcestershire Sauce', 'condiments', 'sauce', 'ml', 78, 0, 19, 0, 0, 0.010, 365, true),
('Hot Sauce (Tabasco)', 'condiments', 'sauce', 'ml', 12, 1, 1, 0.4, 0.5, 0.008, 365, true),
('Hot Sauce (Sriracha)', 'condiments', 'sauce', 'ml', 93, 2, 19, 1, 2, 0.008, 365, true),
('Hot Sauce (Frank''s)', 'condiments', 'sauce', 'ml', 0, 0, 0, 0, 0, 0.008, 365, true),
('BBQ Sauce', 'condiments', 'sauce', 'ml', 172, 0.8, 41, 0.6, 0.9, 0.008, 90, true),
('BBQ Sauce (sugar-free)', 'condiments', 'sauce', 'ml', 40, 0, 10, 0, 0, 0.012, 90, true),
('Teriyaki Sauce', 'condiments', 'sauce', 'ml', 89, 6, 16, 0, 0.1, 0.010, 365, true),
('Hoisin Sauce', 'condiments', 'sauce', 'ml', 220, 3, 44, 3, 2, 0.012, 365, true),
('Oyster Sauce', 'condiments', 'sauce', 'ml', 51, 1.4, 11, 0.3, 0, 0.010, 365, true),
('Salsa (fresh)', 'condiments', 'sauce', 'ml', 36, 2, 7, 0.2, 1.5, 0.008, 14, true),
('Salsa (jarred)', 'condiments', 'sauce', 'ml', 36, 2, 7, 0.2, 1.5, 0.006, 30, true),
('Pico de Gallo', 'condiments', 'sauce', 'ml', 20, 1, 4, 0.2, 1, 0.012, 5, true),
('Marinara Sauce', 'condiments', 'sauce', 'ml', 51, 2, 8, 1.5, 2, 0.006, 10, true),
('Pesto (basil)', 'condiments', 'sauce', 'ml', 383, 5, 5, 38, 2, 0.025, 14, true),
('Chimichurri', 'condiments', 'sauce', 'ml', 350, 2, 4, 37, 2, 0.030, 7, true),
('Guacamole', 'condiments', 'dip', 'g', 157, 2, 8, 14, 6, 0.015, 3, true),

-- Vinegars
('Balsamic Vinegar', 'condiments', 'vinegar', 'ml', 88, 0.5, 17, 0, 0, 0.015, 365, true),
('Apple Cider Vinegar', 'condiments', 'vinegar', 'ml', 21, 0, 0.9, 0, 0, 0.008, 365, true),
('Red Wine Vinegar', 'condiments', 'vinegar', 'ml', 19, 0, 0.3, 0, 0, 0.008, 365, true),
('White Wine Vinegar', 'condiments', 'vinegar', 'ml', 21, 0, 0.4, 0, 0, 0.008, 365, true),
('Rice Vinegar', 'condiments', 'vinegar', 'ml', 18, 0, 0.5, 0, 0, 0.008, 365, true),
('Sherry Vinegar', 'condiments', 'vinegar', 'ml', 41, 0.1, 7, 0, 0, 0.012, 365, false),

-- Mustards
('Dijon Mustard', 'condiments', 'mustard', 'g', 66, 4, 5, 3.3, 3.5, 0.010, 365, true),
('Yellow Mustard', 'condiments', 'mustard', 'g', 60, 4, 5, 3, 3.3, 0.006, 365, true),
('Whole Grain Mustard', 'condiments', 'mustard', 'g', 93, 6, 7, 5, 2, 0.012, 365, true),
('Honey Mustard', 'condiments', 'mustard', 'g', 250, 2, 30, 14, 1, 0.010, 365, true),

-- Other Condiments
('Ketchup', 'condiments', 'sauce', 'g', 101, 1.2, 26, 0.1, 0.3, 0.005, 365, true),
('Ketchup (no sugar added)', 'condiments', 'sauce', 'g', 40, 1, 9, 0, 0, 0.008, 365, true),
('Relish (dill)', 'condiments', 'pickle', 'g', 30, 0.5, 6, 0.4, 1, 0.008, 365, true),
('Pickles (dill)', 'condiments', 'pickle', 'g', 11, 0.3, 2.3, 0.2, 1.2, 0.006, 365, true),
('Pickled Jalapeños', 'condiments', 'pickle', 'g', 28, 0.9, 5.9, 0.4, 2.6, 0.008, 365, true),
('Capers', 'condiments', 'pickle', 'g', 23, 2.4, 4.9, 0.9, 3.2, 0.020, 365, true),
('Horseradish', 'condiments', 'sauce', 'g', 48, 1.2, 11, 0.7, 3.3, 0.015, 90, true),
('Harissa', 'condiments', 'paste', 'g', 80, 2, 8, 5, 3, 0.025, 90, false),
('Miso Paste', 'condiments', 'paste', 'g', 199, 12, 26, 6, 5, 0.020, 365, true),
('Chili Garlic Sauce', 'condiments', 'sauce', 'g', 60, 1, 12, 1, 1, 0.010, 365, true);

-- ============================================
-- BEVERAGES (10 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Chicken Broth (low sodium)', 'beverages', 'broth', 'ml', 5, 1, 0.3, 0, 0, 0.004, 14, true),
('Beef Broth (low sodium)', 'beverages', 'broth', 'ml', 8, 1.1, 0.4, 0.3, 0, 0.004, 14, true),
('Vegetable Broth', 'beverages', 'broth', 'ml', 6, 0.2, 1.2, 0, 0, 0.004, 14, true),
('Bone Broth (chicken)', 'beverages', 'broth', 'ml', 15, 2.5, 1, 0.2, 0, 0.015, 7, true),
('Bone Broth (beef)', 'beverages', 'broth', 'ml', 17, 3, 1, 0.2, 0, 0.015, 7, true),
('Coffee (brewed)', 'beverages', 'coffee', 'ml', 2, 0.3, 0, 0, 0, 0.010, 1, true),
('Green Tea (brewed)', 'beverages', 'tea', 'ml', 1, 0, 0.2, 0, 0, 0.008, 1, true),
('Coconut Water', 'beverages', 'juice', 'ml', 19, 0.7, 3.7, 0.2, 1.1, 0.008, 7, true),
('Lemon Juice', 'beverages', 'juice', 'ml', 22, 0.4, 6.9, 0.2, 0.3, 0.012, 21, true),
('Lime Juice', 'beverages', 'juice', 'ml', 25, 0.4, 8.4, 0.1, 0.4, 0.012, 21, true);

-- ============================================
-- OTHER/MISCELLANEOUS (20 items)
-- ============================================
INSERT INTO public.ingredients (name, category, subcategory, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, avg_price_per_unit, fridge_life_days, is_common) VALUES
('Honey', 'other', 'sweetener', 'g', 304, 0.3, 82, 0, 0.2, 0.015, 365, true),
('Maple Syrup (pure)', 'other', 'sweetener', 'g', 260, 0, 67, 0.1, 0, 0.025, 365, true),
('Stevia', 'other', 'sweetener', 'g', 0, 0, 0, 0, 0, 0.100, 365, true),
('Monk Fruit Sweetener', 'other', 'sweetener', 'g', 0, 0, 4, 0, 0, 0.080, 365, true),
('Agave Nectar', 'other', 'sweetener', 'g', 310, 0, 76, 0.5, 0.2, 0.020, 365, true),
('Coconut Sugar', 'other', 'sweetener', 'g', 375, 1, 100, 0, 0, 0.020, 365, true),
('Dark Chocolate (70%+)', 'other', 'treat', 'g', 598, 8, 46, 43, 11, 0.025, 365, true),
('Cocoa Powder (unsweetened)', 'other', 'baking', 'g', 228, 20, 58, 14, 33, 0.020, 365, true),
('Baking Powder', 'other', 'baking', 'g', 53, 0, 28, 0, 0, 0.010, 365, true),
('Baking Soda', 'other', 'baking', 'g', 0, 0, 0, 0, 0, 0.005, 365, true),
('Nutritional Yeast', 'other', 'supplement', 'g', 325, 50, 36, 4, 25, 0.030, 365, true),
('Apple Sauce (unsweetened)', 'other', 'fruit_product', 'g', 42, 0.2, 11, 0.1, 1.1, 0.006, 14, true),
('Canned Pumpkin Puree', 'other', 'vegetable_product', 'g', 34, 1.1, 8.1, 0.3, 2.9, 0.006, 365, true),
('Panko Breadcrumbs', 'other', 'coating', 'g', 395, 10, 72, 5, 3, 0.008, 180, true),
('Breadcrumbs (whole wheat)', 'other', 'coating', 'g', 395, 13, 72, 5, 7, 0.008, 180, true),
('Arrowroot Powder', 'other', 'thickener', 'g', 357, 0.3, 88, 0.1, 3.4, 0.015, 365, false),
('Cornstarch', 'other', 'thickener', 'g', 381, 0.3, 91, 0.1, 0.9, 0.005, 365, true),
('Gelatin (unflavored)', 'other', 'thickener', 'g', 335, 86, 0, 0, 0, 0.025, 365, true),
('Agar Agar', 'other', 'thickener', 'g', 26, 0.5, 7, 0, 8, 0.030, 365, false),
('Psyllium Husk', 'other', 'fiber', 'g', 375, 0, 88, 0, 79, 0.025, 365, false);

-- Verify count
SELECT COUNT(*) as total_ingredients FROM public.ingredients;

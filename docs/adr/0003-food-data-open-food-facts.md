# Food nutritional data sourced from Open Food Facts API

The Food Module needs nutritional data (calories, protein, carbs, fat) per food item. We use the Open Food Facts API because it is free, requires no API key, has a massive global product catalogue, and is open source. Users search by food name to find items; a manual entry path exists for foods not in the database.

## Considered Options

- **USDA FoodData Central** — also free, but US-centric and less useful for European products.
- **Nutritionix** — richer API but requires a paid plan for meaningful usage.
- **Manual entry only** — no dependency, but too tedious to sustain daily logging.

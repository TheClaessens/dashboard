# Dashboard

A personal dashboard for Thomas — a single place to glance at and manage todos, health metrics, calendar events, food intake, and any future concerns.

## Language

**Module**:
A self-contained concern area (e.g. Todos, Health, Food, Calendar) that has both a Widget on the Dashboard and its own detail page.
_Avoid_: Section, Feature, Panel, Widget (for the area itself)

**Dashboard**:
The main overview page showing a Widget from each active Module at a glance.
_Avoid_: Home, Overview, Landing

**Widget**:
The compact, glanceable summary of a Module shown on the Dashboard. Links to that Module's detail page.
_Avoid_: Card, Tile, Panel (for this concept)

**Owned Module**:
A Module where data is entered and stored in this app (e.g. Food, Todos).
_Avoid_: Local module, internal module

**Aggregated Module**:
A Module where data is pulled from an external service (e.g. Health metrics from a wearable or external API).
_Avoid_: External module, synced module

**Meal**:
A logged eating occasion (e.g. Breakfast, Lunch) tied to a specific date, containing one or more Food Items.
_Avoid_: Entry, log entry, food log

**Food Item**:
A specific food within a Meal, with a quantity and nutritional values (calories, protein, carbs, fat).
_Avoid_: Ingredient, food entry, food log item

**Saved Meal**:
A reusable Meal definition that can be re-logged quickly without re-entering every Food Item.
_Avoid_: Meal template, preset meal, favourite meal

**Todo**:
A task with a title, a status (open or done), an optional due date, and an optional List.
_Avoid_: Task, item, card

**List**:
A named grouping that organises Todos. A Todo belongs to at most one List.
_Avoid_: Project, group, label, tag, category

## Relationships

- The **Dashboard** contains one **Widget** per active **Module**
- Each **Module** has exactly one **Widget** and one detail page
- An **Owned Module** stores its data in the app's database
- An **Aggregated Module** fetches its data from an external service at read time (or via a sync job)
- A **List** contains zero or more **Todos**; a **Todo** belongs to at most one **List**
- A **Meal** contains one or more **Food Items**
- A **Saved Meal** is a reusable definition that can produce a new **Meal** when re-logged

## Example dialogue

> **Dev:** "Should the Todos Widget show all open todos?"
> **Thomas:** "No — just the most urgent few. The full list lives on the Todos Module detail page."

> **Dev:** "When I log breakfast, is each food a Meal or a Food Item?"
> **Thomas:** "Breakfast is the Meal. Oatmeal and banana are the Food Items inside it."

> **Dev:** "Should the Health Widget show my last activity or my training load?"
> **Thomas:** "Training load — CTL/ATL/TSB. Last activity can live on the Health detail page."

## Flagged ambiguities

_(none yet)_

import { JSX } from "solid-js";

export type MockCategory = {
  categoryName: string;
  categoryTitle: string;
  maxDiscountPercent: number;
};

export const MOCK_CATEGORIES: MockCategory[] = [
  { categoryName: "grocery", categoryTitle: "Grocery", maxDiscountPercent: 20 },
  { categoryName: "electronics", categoryTitle: "Electronics", maxDiscountPercent: 15 },
  { categoryName: "travel", categoryTitle: "Travel & Stay", maxDiscountPercent: 30 },
  { categoryName: "fashion", categoryTitle: "Fashion", maxDiscountPercent: 25 },
  { categoryName: "food", categoryTitle: "Food & Dining", maxDiscountPercent: 18 },
  { categoryName: "health", categoryTitle: "Health", maxDiscountPercent: 12 },
];

// ─── Category SVG icons (stroke-based, inherit currentColor) ─────────────────

function CartIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function PhoneIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function PlaneIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2a.5.5 0 0 0-.3.8l.6.6 6.1 3.7-2.1 2.1a.5.5 0 0 0 .1.8l2.4 1.2 1.2 2.4a.5.5 0 0 0 .8.1l2.1-2.1 3.7 6.1.6.6a.5.5 0 0 0 .8-.3Z" />
    </svg>
  );
}

function ShirtIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23Z" />
    </svg>
  );
}

function PizzaIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
    </svg>
  );
}

function HeartPulseIcon(p: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class={p.class}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

type IconComponent = (p: { class?: string }) => JSX.Element;

export const categoryIconMap: Record<string, IconComponent> = {
  grocery: CartIcon,
  electronics: PhoneIcon,
  travel: PlaneIcon,
  fashion: ShirtIcon,
  food: PizzaIcon,
  health: HeartPulseIcon,
};

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  grocery: "🛒",
  electronics: "📱",
  travel: "✈️",
  fashion: "👗",
  food: "🍕",
  health: "💊",
  "new brands": "✨",
  "hot deals": "🔥",
  entertainment: "🎬",
  beauty: "💄",
  sports: "⚽",
  home: "🏠",
  kids: "🧸",
  books: "📚",
  gaming: "🎮",
};

export function categoryEmoji(name: string): string {
  return CATEGORY_EMOJI_MAP[name.toLowerCase()] ?? "🎁";
}

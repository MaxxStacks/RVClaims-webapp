// server/db/seedPDI.ts — Seed default PDI checklist templates
// Covers travel_trailer / fifth_wheel unit types

import { db } from "../db";
import { pdiTemplates } from "@shared/schema";

type TemplateItem = {
  unitType: string;
  section: string;
  itemName: string;
  sortOrder: number;
  isDefault: boolean;
};

const TRAVEL_TRAILER_TEMPLATES: Omit<TemplateItem, "unitType">[] = [
  // EXTERIOR (section: exterior)
  { section: "exterior", itemName: "Roof condition", sortOrder: 1, isDefault: true },
  { section: "exterior", itemName: "Sidewall condition (left)", sortOrder: 2, isDefault: true },
  { section: "exterior", itemName: "Sidewall condition (right)", sortOrder: 3, isDefault: true },
  { section: "exterior", itemName: "Front cap", sortOrder: 4, isDefault: true },
  { section: "exterior", itemName: "Rear wall", sortOrder: 5, isDefault: true },
  { section: "exterior", itemName: "Window seals and operation", sortOrder: 6, isDefault: true },
  { section: "exterior", itemName: "Entry door(s)", sortOrder: 7, isDefault: true },
  { section: "exterior", itemName: "Awning operation", sortOrder: 8, isDefault: true },
  { section: "exterior", itemName: "Hitch/Pin box", sortOrder: 9, isDefault: true },
  { section: "exterior", itemName: "Landing gear/jacks", sortOrder: 10, isDefault: true },
  { section: "exterior", itemName: "Tires and wheels", sortOrder: 11, isDefault: true },
  { section: "exterior", itemName: "Exterior lights and decals", sortOrder: 12, isDefault: true },

  // INTERIOR (section: interior)
  { section: "interior", itemName: "Ceiling (no water stains)", sortOrder: 1, isDefault: true },
  { section: "interior", itemName: "Walls and trim", sortOrder: 2, isDefault: true },
  { section: "interior", itemName: "Flooring condition", sortOrder: 3, isDefault: true },
  { section: "interior", itemName: "Countertops", sortOrder: 4, isDefault: true },
  { section: "interior", itemName: "Cabinet doors and drawers", sortOrder: 5, isDefault: true },
  { section: "interior", itemName: "Furniture and upholstery", sortOrder: 6, isDefault: true },
  { section: "interior", itemName: "Window coverings", sortOrder: 7, isDefault: true },
  { section: "interior", itemName: "Interior lighting", sortOrder: 8, isDefault: true },
  { section: "interior", itemName: "Smoke and CO detectors", sortOrder: 9, isDefault: true },
  { section: "interior", itemName: "Thermostat operation", sortOrder: 10, isDefault: true },

  // PLUMBING (section: plumbing)
  { section: "plumbing", itemName: "Fresh water system test", sortOrder: 1, isDefault: true },
  { section: "plumbing", itemName: "Grey tank drain", sortOrder: 2, isDefault: true },
  { section: "plumbing", itemName: "Black tank drain", sortOrder: 3, isDefault: true },
  { section: "plumbing", itemName: "Water heater operation", sortOrder: 4, isDefault: true },
  { section: "plumbing", itemName: "Faucets (kitchen and bath)", sortOrder: 5, isDefault: true },
  { section: "plumbing", itemName: "Toilet operation", sortOrder: 6, isDefault: true },
  { section: "plumbing", itemName: "Shower head and drain", sortOrder: 7, isDefault: true },
  { section: "plumbing", itemName: "Winterization ports accessible", sortOrder: 8, isDefault: true },

  // ELECTRICAL (section: electrical)
  { section: "electrical", itemName: "Shore power connection", sortOrder: 1, isDefault: true },
  { section: "electrical", itemName: "Converter/charger operation", sortOrder: 2, isDefault: true },
  { section: "electrical", itemName: "Battery condition", sortOrder: 3, isDefault: true },
  { section: "electrical", itemName: "All outlets tested (GFCI)", sortOrder: 4, isDefault: true },
  { section: "electrical", itemName: "Light switches", sortOrder: 5, isDefault: true },
  { section: "electrical", itemName: "Breaker panel labeled", sortOrder: 6, isDefault: true },
  { section: "electrical", itemName: "Solar panel (if equipped)", sortOrder: 7, isDefault: true },
  { section: "electrical", itemName: "Generator (if equipped)", sortOrder: 8, isDefault: true },

  // APPLIANCES (section: appliances)
  { section: "appliances", itemName: "Refrigerator (propane and electric)", sortOrder: 1, isDefault: true },
  { section: "appliances", itemName: "Stove/oven ignition", sortOrder: 2, isDefault: true },
  { section: "appliances", itemName: "Microwave", sortOrder: 3, isDefault: true },
  { section: "appliances", itemName: "Air conditioner", sortOrder: 4, isDefault: true },
  { section: "appliances", itemName: "Furnace", sortOrder: 5, isDefault: true },
  { section: "appliances", itemName: "Washer/dryer (if equipped)", sortOrder: 6, isDefault: true },

  // SLIDE-OUTS (section: slide_outs)
  { section: "slide_outs", itemName: "Slide operation (extend/retract)", sortOrder: 1, isDefault: true },
  { section: "slide_outs", itemName: "Slide seals condition", sortOrder: 2, isDefault: true },
  { section: "slide_outs", itemName: "Slide alignment", sortOrder: 3, isDefault: true },
  { section: "slide_outs", itemName: "Slide motor/mechanism", sortOrder: 4, isDefault: true },

  // PROPANE (section: propane)
  { section: "propane", itemName: "Tank condition and fill level", sortOrder: 1, isDefault: true },
  { section: "propane", itemName: "Regulator and connections", sortOrder: 2, isDefault: true },
  { section: "propane", itemName: "Propane lines (no leaks)", sortOrder: 3, isDefault: true },
  { section: "propane", itemName: "Leak test completed", sortOrder: 4, isDefault: true },
];

export async function seedPDI(): Promise<void> {
  console.log("  Seeding PDI templates...");

  // Check if already seeded
  const existing = await db.select().from(pdiTemplates).limit(1);
  if (existing.length > 0) {
    console.log("  PDI templates already seeded");
    return;
  }

  const items: TemplateItem[] = [
    ...TRAVEL_TRAILER_TEMPLATES.map((t) => ({ ...t, unitType: "travel_trailer" })),
    ...TRAVEL_TRAILER_TEMPLATES.map((t) => ({ ...t, unitType: "fifth_wheel" })),
  ];

  await db.insert(pdiTemplates).values(items);
  console.log(`  PDI templates seeded: ${items.length} items (travel_trailer + fifth_wheel)`);
}

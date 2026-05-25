// server/routes/frc-codes-v6.ts — FRC code library (/api/v6/frc-codes and /api/frc-codes)
// Static library — DB table not yet created. Serves from in-memory data.

import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const FRC_CODE_LIBRARY: Record<string, Array<{code: string; description: string; category: string; laborHours: number; manufacturer: string}>> = {
  Jayco: [
    { code: 'JC-WAR-1042', description: 'Delamination, Sidewall', category: 'Structural', laborHours: 2.5, manufacturer: 'Jayco' },
    { code: 'JC-WAR-2018', description: 'Water Leak, Roof Vent', category: 'Plumbing', laborHours: 1.5, manufacturer: 'Jayco' },
    { code: 'JC-WAR-3055', description: 'Slide-Out Seal, Replace', category: 'Exterior', laborHours: 1.0, manufacturer: 'Jayco' },
    { code: 'JC-WAR-4012', description: 'Cabinet Door, Hinge', category: 'Interior', laborHours: 0.5, manufacturer: 'Jayco' },
    { code: 'JC-WAR-5001', description: 'Furnace, No Ignition', category: 'HVAC', laborHours: 2.0, manufacturer: 'Jayco' },
    { code: 'JC-WAR-6001', description: 'Fresh Water Tank, Crack', category: 'Plumbing', laborHours: 1.5, manufacturer: 'Jayco' },
    { code: 'JC-DAF-1001', description: 'Roof Inspection, DAF', category: 'Structural', laborHours: 1.0, manufacturer: 'Jayco' },
    { code: 'JC-PDI-1001', description: 'Full PDI Inspection', category: 'General', laborHours: 2.0, manufacturer: 'Jayco' },
  ],
  'Forest River': [
    { code: 'FR-WAR-1001', description: 'Roof Seam, Re-seal', category: 'Structural', laborHours: 2.0, manufacturer: 'Forest River' },
    { code: 'FR-WAR-2005', description: 'Shower Drain Leak', category: 'Plumbing', laborHours: 1.0, manufacturer: 'Forest River' },
    { code: 'FR-WAR-3012', description: 'Awning, Retract Failure', category: 'Exterior', laborHours: 1.5, manufacturer: 'Forest River' },
    { code: 'FR-WAR-4008', description: 'Slide-Out Motor Replace', category: 'Electrical', laborHours: 3.0, manufacturer: 'Forest River' },
    { code: 'FR-WAR-5001', description: 'Hot Water Heater, No Heat', category: 'Plumbing', laborHours: 1.5, manufacturer: 'Forest River' },
  ],
  Heartland: [
    { code: 'HL-WAR-1010', description: 'Floor Delamination', category: 'Structural', laborHours: 3.0, manufacturer: 'Heartland' },
    { code: 'HL-WAR-2002', description: 'City Water Inlet Leak', category: 'Plumbing', laborHours: 0.5, manufacturer: 'Heartland' },
    { code: 'HL-WAR-3001', description: 'Slide-Out Topper Tear', category: 'Exterior', laborHours: 1.0, manufacturer: 'Heartland' },
    { code: 'HL-WAR-4001', description: 'A/C Compressor Fail', category: 'HVAC', laborHours: 2.5, manufacturer: 'Heartland' },
  ],
  Keystone: [
    { code: 'KS-WAR-1005', description: 'Sidewall Puncture Repair', category: 'Structural', laborHours: 2.0, manufacturer: 'Keystone' },
    { code: 'KS-WAR-2010', description: 'Toilet Valve Replace', category: 'Plumbing', laborHours: 0.5, manufacturer: 'Keystone' },
    { code: 'KS-WAR-3008', description: 'Entry Door Latch', category: 'Exterior', laborHours: 0.5, manufacturer: 'Keystone' },
    { code: 'KS-WAR-4003', description: 'Leveling Jack, Manual', category: 'Electrical', laborHours: 1.5, manufacturer: 'Keystone' },
  ],
  'Columbia NW': [
    { code: 'CN-WAR-1001', description: 'Wall Seam Separation', category: 'Structural', laborHours: 2.5, manufacturer: 'Columbia NW' },
    { code: 'CN-WAR-2001', description: 'Fresh Tank Fitting Leak', category: 'Plumbing', laborHours: 1.0, manufacturer: 'Columbia NW' },
    { code: 'CN-WAR-3001', description: 'Slide-Out Wiper Seal', category: 'Exterior', laborHours: 0.5, manufacturer: 'Columbia NW' },
  ],
  'Midwest Auto': [
    { code: 'MA-WAR-1001', description: 'Frame Weld Crack', category: 'Structural', laborHours: 3.0, manufacturer: 'Midwest Auto' },
    { code: 'MA-WAR-2001', description: 'Propane Regulator Fail', category: 'Plumbing', laborHours: 1.0, manufacturer: 'Midwest Auto' },
  ],
};

// GET /api/v6/frc-codes?manufacturer=Jayco&search=water&category=Plumbing
router.get("/", (req: Request, res: Response) => {
  const { manufacturer, search, category } = req.query as Record<string, string>;

  let codes: typeof FRC_CODE_LIBRARY[string] = [];

  if (manufacturer && FRC_CODE_LIBRARY[manufacturer]) {
    codes = FRC_CODE_LIBRARY[manufacturer];
  } else if (!manufacturer) {
    // Return all codes if no manufacturer filter
    codes = Object.values(FRC_CODE_LIBRARY).flat();
  } else {
    // Unknown manufacturer — return empty
    return res.json({ frcCodes: [] });
  }

  // Apply search filter
  if (search) {
    const s = search.toLowerCase();
    codes = codes.filter(c =>
      c.code.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s)
    );
  }

  // Apply category filter
  if (category) {
    codes = codes.filter(c => c.category === category);
  }

  res.json({ frcCodes: codes });
});

// POST /api/v6/frc-codes — add custom code (operator only)
router.post("/", (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Operator admin role required" });
  }
  const { code, description, category, manufacturer, laborHours } = req.body;
  if (!code || !description || !manufacturer) {
    return res.status(400).json({ error: "code, description, manufacturer required" });
  }

  const newCode = { code, description, category: category || 'General', laborHours: parseFloat(laborHours) || 1.0, manufacturer };
  if (!FRC_CODE_LIBRARY[manufacturer]) FRC_CODE_LIBRARY[manufacturer] = [];
  FRC_CODE_LIBRARY[manufacturer].push(newCode);

  res.status(201).json({ frcCode: newCode });
});

export default router;

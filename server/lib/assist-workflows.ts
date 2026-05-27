// server/lib/assist-workflows.ts — Guided workflow definitions for DS360 Assist

export interface WorkflowStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  instruction: string;
  inputType: "text" | "select" | "multi-select" | "photo" | "confirm" | "none";
  inputLabel?: string;
  options?: string[];
  validation?: { required: boolean; pattern?: string; minLength?: number };
  fieldKey: string; // key to store this step's input under
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  triggerPhrases: string[];
  steps: WorkflowStep[];
  onCompleteEndpoint: string;
}

// ==================== WORKFLOW DEFINITIONS ====================

const createUnitWorkflow: WorkflowDefinition = {
  id: "create-unit",
  name: "Create New Unit",
  triggerPhrases: [
    "add a unit",
    "add new unit",
    "create a unit",
    "create new unit",
    "new unit",
    "add unit",
    "add an rv",
    "add a new rv",
  ],
  steps: [
    {
      stepNumber: 1,
      totalSteps: 4,
      title: "Enter VIN",
      instruction:
        "Let's add a new unit. Please enter the **17-character VIN** for this unit.\n\nThe VIN is found on the dashboard, door jamb, or registration documents.",
      inputType: "text",
      inputLabel: "VIN Number",
      fieldKey: "vin",
      validation: { required: true, pattern: "^[A-HJ-NPR-Z0-9]{17}$", minLength: 17 },
    },
    {
      stepNumber: 2,
      totalSteps: 4,
      title: "Year, Make & Model",
      instruction:
        "Enter the **Year, Make, and Model** for this unit.\n\nFor example: `2024 Forest River Rockwood`\n\nType it in any format — I'll parse it for you.",
      inputType: "text",
      inputLabel: "Year, Make & Model",
      fieldKey: "yearMakeModel",
      validation: { required: true, minLength: 3 },
    },
    {
      stepNumber: 3,
      totalSteps: 4,
      title: "Stock Number",
      instruction:
        "Enter your internal **Stock Number** for this unit (optional).\n\nThis is your dealership's inventory tracking number. Type `skip` to leave it blank.",
      inputType: "text",
      inputLabel: "Stock Number (or skip)",
      fieldKey: "stockNumber",
      validation: { required: false },
    },
    {
      stepNumber: 4,
      totalSteps: 4,
      title: "Confirm & Save",
      instruction: "Ready to save this unit to your inventory?",
      inputType: "confirm",
      inputLabel: "Create Unit",
      fieldKey: "confirm",
      validation: { required: true },
    },
  ],
  onCompleteEndpoint: "/api/units",
};

const createClientWorkflow: WorkflowDefinition = {
  id: "create-client",
  name: "Create New Client",
  triggerPhrases: [
    "add a client",
    "add new client",
    "create a client",
    "create new client",
    "new client",
    "add a customer",
    "new customer",
    "create a customer",
  ],
  steps: [
    {
      stepNumber: 1,
      totalSteps: 5,
      title: "First Name",
      instruction: "Let's create a new client record. What is the client's **first name**?",
      inputType: "text",
      inputLabel: "First Name",
      fieldKey: "firstName",
      validation: { required: true, minLength: 1 },
    },
    {
      stepNumber: 2,
      totalSteps: 5,
      title: "Last Name",
      instruction: "What is the client's **last name**?",
      inputType: "text",
      inputLabel: "Last Name",
      fieldKey: "lastName",
      validation: { required: true, minLength: 1 },
    },
    {
      stepNumber: 3,
      totalSteps: 5,
      title: "Email Address",
      instruction:
        "What is the client's **email address**? (Type `skip` to leave blank)",
      inputType: "text",
      inputLabel: "Email Address",
      fieldKey: "email",
      validation: { required: false },
    },
    {
      stepNumber: 4,
      totalSteps: 5,
      title: "Phone Number",
      instruction:
        "What is the client's **phone number**? (Type `skip` to leave blank)",
      inputType: "text",
      inputLabel: "Phone Number",
      fieldKey: "phone",
      validation: { required: false },
    },
    {
      stepNumber: 5,
      totalSteps: 5,
      title: "Confirm & Save",
      instruction: "Ready to save this client to your records?",
      inputType: "confirm",
      inputLabel: "Create Client",
      fieldKey: "confirm",
      validation: { required: true },
    },
  ],
  onCompleteEndpoint: "/api/units",
};

const fileClaimWorkflow: WorkflowDefinition = {
  id: "file-claim",
  name: "File a Claim",
  triggerPhrases: [
    "file a claim",
    "create a claim",
    "start a claim",
    "new claim",
    "submit a claim",
    "open a claim",
    "file claim",
    "create claim",
  ],
  steps: [
    {
      stepNumber: 1,
      totalSteps: 5,
      title: "Unit VIN",
      instruction:
        "Let's file a new claim. Enter the **VIN** of the unit this claim is for.\n\nOr type the **Stock Number** if you don't have the VIN handy.",
      inputType: "text",
      inputLabel: "VIN or Stock Number",
      fieldKey: "unitIdentifier",
      validation: { required: true, minLength: 3 },
    },
    {
      stepNumber: 2,
      totalSteps: 5,
      title: "Claim Type",
      instruction:
        "What **type of claim** is this?\n\n- **DAF** — Dealer Authorization Form (unit arrives at lot)\n- **PDI** — Pre-Delivery Inspection (before customer delivery)\n- **Warranty** — Customer reports issue during warranty period\n- **Extended Warranty** — After OEM warranty, covered by extension\n- **Insurance** — Collision, weather, theft, or liability",
      inputType: "select",
      inputLabel: "Select Claim Type",
      fieldKey: "claimType",
      options: ["DAF", "PDI", "Warranty", "Extended Warranty", "Insurance"],
      validation: { required: true },
    },
    {
      stepNumber: 3,
      totalSteps: 5,
      title: "Issue Description",
      instruction:
        "Describe the issue in detail using the **3C format**:\n\n**Complaint** — What did the customer report?\n**Cause** — What caused the issue?\n**Correction** — What was done to fix it?\n\nType a clear description and our team will suggest the correct FRC codes.",
      inputType: "text",
      inputLabel: "3C Description",
      fieldKey: "description",
      validation: { required: true, minLength: 20 },
    },
    {
      stepNumber: 4,
      totalSteps: 5,
      title: "Photos Reminder",
      instruction:
        "📸 **Photos are required for every FRC line.**\n\nAfter submitting, you'll need to upload:\n- Close-up of the damage/defect\n- Context shot showing location on the unit\n- Any relevant invoices or documentation\n\nPhoto quality directly impacts your approval rate. Once submitted, go to your Claims page to upload photos.\n\nType **continue** to proceed.",
      inputType: "text",
      inputLabel: 'Type "continue" to proceed',
      fieldKey: "photoAck",
      validation: { required: true },
    },
    {
      stepNumber: 5,
      totalSteps: 5,
      title: "Confirm & Submit",
      instruction: "Ready to submit this claim to the DS360 team for processing?",
      inputType: "confirm",
      inputLabel: "Submit Claim",
      fieldKey: "confirm",
      validation: { required: true },
    },
  ],
  onCompleteEndpoint: "/api/claims",
};

const addStaffWorkflow: WorkflowDefinition = {
  id: "add-staff",
  name: "Add Staff Member",
  triggerPhrases: [
    "add a staff",
    "add staff",
    "invite staff",
    "add an employee",
    "invite an employee",
    "new staff",
    "add team member",
    "invite team member",
    "add user",
    "invite user",
  ],
  steps: [
    {
      stepNumber: 1,
      totalSteps: 3,
      title: "Staff Email Address",
      instruction:
        "Let's invite a new staff member. What is their **email address**?\n\nThey'll receive an invitation email to join your DS360 workspace.",
      inputType: "text",
      inputLabel: "Email Address",
      fieldKey: "email",
      validation: { required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
    },
    {
      stepNumber: 2,
      totalSteps: 3,
      title: "Staff Role",
      instruction:
        "What role should this staff member have?\n\n- **Dealer Staff** — Can create claims, upload photos, view units and claim statuses. Cannot access billing or staff management.",
      inputType: "select",
      inputLabel: "Select Role",
      fieldKey: "role",
      options: ["dealer_staff"],
      validation: { required: true },
    },
    {
      stepNumber: 3,
      totalSteps: 3,
      title: "Confirm & Send Invite",
      instruction: "Ready to send the invitation email?",
      inputType: "confirm",
      inputLabel: "Send Invitation",
      fieldKey: "confirm",
      validation: { required: true },
    },
  ],
  onCompleteEndpoint: "/api/users/invite",
};

export const ALL_WORKFLOWS: WorkflowDefinition[] = [
  createUnitWorkflow,
  createClientWorkflow,
  fileClaimWorkflow,
  addStaffWorkflow,
];

// ==================== TRIGGER DETECTION ====================

export function detectWorkflow(message: string): WorkflowDefinition | null {
  const lower = message.toLowerCase().trim();

  // Check cancel words first
  if (
    ["cancel", "stop", "nevermind", "never mind", "quit", "exit", "abort"].some((w) =>
      lower.includes(w)
    )
  ) {
    return null;
  }

  for (const wf of ALL_WORKFLOWS) {
    for (const phrase of wf.triggerPhrases) {
      if (lower.includes(phrase)) return wf;
    }
  }
  return null;
}

export function isCancelMessage(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return ["cancel", "stop", "nevermind", "never mind", "quit", "exit", "abort"].some((w) =>
    lower.includes(w)
  );
}

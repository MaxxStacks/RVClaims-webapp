---
title: Role Permissions Guide
slug: permissions-guide
category: troubleshooting
subcategory: access
tags: ["permissions", "roles", "access", "dealer owner", "dealer staff", "billing", "staff management"]
roles_visible: ["dealer_owner", "dealer_staff"]
---

# Role Permissions Guide

DealerSuite360 uses two roles for dealership accounts: **Dealer Owner** and **Dealer Staff**. This guide explains exactly what each role can and cannot access.

## Dealer Owner

The Dealer Owner is the primary account holder. There is one Dealer Owner per dealership. This is the role assigned when the account is first created and approved.

### What Dealer Owner Can Do

**Claims & Units**
- Create, edit, and submit claims of all types (DAF, PDI, Warranty, Extended Warranty, Insurance)
- Add and manage units in the dealership inventory
- Upload photos and documents to claims
- View all claims across the dealership

**Staff Management**
- Invite staff members to the dealership account
- Assign and change staff roles
- Deactivate staff accounts
- Resend invitation emails

**Billing & Financial**
- View and download all invoices
- Manage subscription plan (Plan A or Plan B)
- Top up the DS360 Wallet
- Configure auto top-up settings
- Update payment methods via Stripe
- View transaction history and billing history

**Settings & Account**
- Manage dealership profile (name, address, contact info)
- Configure branding (logo, colors)
- Set up the customer portal
- Manage custom domain settings
- View and manage all modules

---

## Dealer Staff

Dealer Staff accounts are created by the Dealer Owner and are intended for technicians, service advisors, and other dealership team members who need to work with claims but should not have administrative access.

### What Dealer Staff Can Do

**Claims & Units**
- Create, edit, and submit claims of all types
- Add and manage units in the dealership inventory
- Upload photos and documents to claims
- View all claims across the dealership

### What Dealer Staff Cannot Do

| Feature | Reason |
|---------|--------|
| Billing & Invoices | Financial data restricted to Dealer Owner |
| Subscription Management | Contract decisions belong to account owner |
| Wallet Top-Up | Payment authority restricted to Dealer Owner |
| Staff Invitations | Account administration restricted to Dealer Owner |
| Staff Deactivation | Account administration restricted to Dealer Owner |
| Branding & Domain | Account configuration restricted to Dealer Owner |
| Module Activation | Subscription decisions restricted to Dealer Owner |

---

## Common Permission Questions

**"My staff member says they can't see the billing page."**
This is expected behavior. Billing is visible only to the Dealer Owner. There is no way to grant a staff member billing access — this is by design.

**"Can I have two Dealer Owners?"**
No. There is one Dealer Owner per dealership account. If you need to transfer ownership, contact your Account Manager.

**"My staff member needs to manage other staff accounts."**
This is not currently supported. Staff management is a Dealer Owner function. If a staff member needs to onboard new teammates, the Dealer Owner must do this.

**"A staff member accidentally created a claim they shouldn't have."**
Contact your operator team via DS360 Assist. They can help archive or void claims that were submitted in error.

---

## Operator Roles

If your account is operated by the DealerSuite360 team (which it is — this is a fully managed service), your claims are reviewed and submitted by either an **Operator Admin** or **Operator Staff**. You do not control operator accounts. Any questions about operator access should go through your Account Manager.

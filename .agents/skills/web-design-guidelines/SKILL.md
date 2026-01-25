---
name: web-design-guidelines
description: Review files for compliance with Vercel's Web Interface Guidelines
---

# Web Interface Guidelines

## Purpose
Ensure all UI code complies with the official Vercel Web Interface Guidelines before finalizing any changes.

## How to Use
1. **Fetch Guidelines:**
   To get the latest rules, read the following URL:
   `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

2. **Audit Process:**
   - Read the fetched guidelines.
   - Review the target files (components, pages, styles).
   - Check for compliance (Spacing, Typography, Accessibility, Layout).
   - If violations are found, fix them immediately.

## Quick Check
- **Spacing:** Are you using `gap-4` instead of `margin`?
- **Hierarchy:** Is the `<h1>` unique? Are headings semantic?
- **Interactive:** Do buttons have `cursor-pointer`?
- **Loading:** Are `skeletons` used instead of `spinners` for initial load?

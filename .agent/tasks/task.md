# Fal.AI Model Integration

## Phase 1: Core Refactor ✅
- [x] Update `lib/api-services.ts` with new Fal.AI endpoints
  - [x] Add Kling 2.5 Pro T2V/I2V
  - [x] Upgrade LTX to LTX-2 19B with resolution params
  - [x] Add Minimax Hailuo support
- [x] Update `app/api/generate/route.ts` model validation
- [x] Update `components/ControlPanel.tsx` model selector
- [x] Update `lib/pho-points/index.ts` costs (handled in route.ts)
- [x] Update `types/index.ts` model definitions

## Phase 2: Quality Tier (Deferred)
- [ ] Add model quality badges in UI
- [ ] Implement tier-gating

## Phase 3: Premium Models (Future)
- [ ] Add Veo 3.1
- [ ] Add Sora 2

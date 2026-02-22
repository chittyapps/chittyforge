# ChittyForge Charter

## Classification
- **Canonical URI**: `chittycanon://core/services/chittyforge`
- **Tier**: 3 (Operational)
- **Organization**: chittyapps
- **Domain**: chittyforge.chitty.cc

## Mission

Development and deployment tools for the ChittyApps ecosystem. Provides build, test, and deployment infrastructure.

## Scope

### IS Responsible For
- Build tooling, deployment automation, development infrastructure, CI/CD support

### IS NOT Responsible For
- Identity generation (ChittyID)
- Token provisioning (ChittyAuth)

## Dependencies

| Type | Service | Purpose |
|------|---------|---------|
| Upstream | ChittyAuth | Authentication |

## API Contract

**Base URL**: https://chittyforge.chitty.cc

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Service health |

## Ownership

| Role | Owner |
|------|-------|
| Service Owner | chittyapps |

## Compliance

- [ ] Registered in ChittyRegister
- [ ] Health endpoint operational at /health
- [ ] CLAUDE.md present
- [ ] CHARTER.md present
- [ ] CHITTY.md present

---
*Charter Version: 1.0.0 | Last Updated: 2026-02-21*
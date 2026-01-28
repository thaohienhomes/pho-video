---
name: qa-test-planner
description: QA test planning skill for creating comprehensive test cases and regression suites.
---

# QA Test Planner Skill

## Test Categories

### Functional Tests
| Priority | Area | Description |
|----------|------|-------------|
| P0 | Authentication | Login, logout, session |
| P0 | Core Features | Main value proposition |
| P1 | Navigation | All screen transitions |
| P1 | Forms | Validation, submission |
| P2 | Edge Cases | Empty states, errors |
| P2 | Settings | Preferences, toggles |

### Non-Functional Tests
- **Performance**: Load time, animations
- **Usability**: Accessibility, gestures
- **Compatibility**: OS versions, devices
- **Network**: Offline, slow connection
- **Security**: Data handling, auth tokens

## Test Case Template

```markdown
### TC-001: User Login with Valid Credentials

**Priority:** P0
**Module:** Authentication
**Preconditions:** 
- App installed
- User has valid account

**Steps:**
1. Launch app
2. Tap "Sign In"
3. Enter valid email
4. Enter valid password
5. Tap "Login" button

**Expected Result:**
- User sees home screen
- Profile icon shows avatar
- Credits displayed correctly

**Edge Cases:**
- Network timeout during login
- Invalid credentials
- Account locked
```

## Regression Test Suite

### Critical Path (Smoke Test)
Run on every build:
- [ ] App launches without crash
- [ ] User can login
- [ ] Main feature works (e.g., generate video)
- [ ] User can logout

### Daily Regression
- [ ] All navigation paths
- [ ] Form validations
- [ ] API error handling
- [ ] Credit transactions

### Weekly Full Regression
- [ ] All test cases
- [ ] Cross-device testing
- [ ] Network condition tests
- [ ] Accessibility audit

## Bug Report Template

```markdown
### BUG: [Brief Description]

**Severity:** Critical/High/Medium/Low
**Platform:** iOS 17.2 / Android 14
**Device:** iPhone 15 Pro / Pixel 8
**Build:** v1.2.3 (45)

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected:** What should happen
**Actual:** What actually happens

**Screenshots/Video:** [Attach]
**Logs:** [Relevant console output]

**Workaround:** [If any]
```

## Testing Checklist by Feature

### Video Generation Feature
- [ ] Text-to-Video generates correctly
- [ ] Image-to-Video accepts valid images
- [ ] Progress indicator shows accurately
- [ ] Cancel generation works
- [ ] Result displays correctly
- [ ] Download/share functions work
- [ ] Credits deducted correctly
- [ ] Error messages are helpful

### Profile/Settings
- [ ] Profile loads user data
- [ ] Avatar upload works
- [ ] Settings persist after restart
- [ ] Logout clears sensitive data
- [ ] Language switch works
- [ ] Notification preferences save

## Device Matrix

| Priority | iOS | Android |
|----------|-----|---------|
| High | iPhone 15 Pro | Pixel 8 |
| High | iPhone 13 | Samsung S23 |
| Medium | iPhone SE | Pixel 6a |
| Low | iPad Pro | Samsung Tab |

---
name: e2e-testing-patterns
description: End-to-end testing patterns for mobile apps using Detox and Maestro.
---

# E2E Testing Patterns Skill

## Testing Tools

| Tool | Best For | Setup Complexity |
|------|----------|------------------|
| **Maestro** | Quick UI tests, no code | Low |
| **Detox** | Comprehensive, CI/CD | High |
| **Appium** | Cross-platform, legacy | High |

## Maestro (Recommended)

### Installation
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Simple Test
```yaml
# tests/login.yaml
appId: com.phovideo.app
---
- launchApp
- assertVisible: "Welcome"
- tapOn: "Sign In"
- inputText:
    id: "email-input"
    text: "test@example.com"
- inputText:
    id: "password-input"
    text: "password123"
- tapOn: "Login"
- assertVisible: "Home"
```

### Run Tests
```bash
maestro test tests/login.yaml
maestro test tests/ --format junit
```

## Detox Setup

### Install
```bash
npm install -D detox
npx detox init
```

### Configuration
```js
// .detoxrc.js
module.exports = {
  testRunner: {
    args: { $0: 'jest', config: 'e2e/jest.config.js' },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PhoVideo.app',
      build: 'xcodebuild -workspace ios/PhoVideo.xcworkspace -scheme PhoVideo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
  },
};
```

### Test Example
```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Home'))).toBeVisible();
  });
});
```

## Best Practices

### Test IDs
```typescript
// Always add testID for E2E targeting
<TouchableOpacity testID="submit-button" onPress={handleSubmit}>
  <Text>Submit</Text>
</TouchableOpacity>
```

### Stable Selectors
```typescript
// ❌ Bad: Brittle selectors
by.text('Submit')

// ✅ Good: Stable test IDs
by.id('submit-button')
```

### Wait Strategies
```typescript
// Wait for element
await waitFor(element(by.id('loading'))).not.toBeVisible().withTimeout(5000);

// Wait for animation
await device.disableSynchronization();
await delay(500);
await device.enableSynchronization();
```

## CI Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    maestro test tests/ --format junit --output results.xml
    
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: results.xml
```

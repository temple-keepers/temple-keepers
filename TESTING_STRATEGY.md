# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for Temple Keepers, a faith-based wellness platform. Our testing approach ensures high quality, accessibility, security, and performance across all features.

## Testing Pyramid

### 1. Unit Tests (70%)
- **Purpose**: Test individual functions, components, and utilities in isolation
- **Tools**: Vitest, React Testing Library, Jest DOM
- **Coverage**: Aim for 80%+ code coverage
- **Location**: `src/**/*.test.{js,jsx}`

### 2. Integration Tests (20%)
- **Purpose**: Test component interactions and API integrations
- **Tools**: Vitest, React Testing Library, MSW (Mock Service Worker)
- **Focus**: User flows, data flow between components
- **Location**: `src/**/*.integration.test.{js,jsx}`

### 3. End-to-End Tests (10%)
- **Purpose**: Test complete user journeys and critical paths
- **Tools**: Playwright
- **Focus**: Authentication, core features, cross-browser compatibility
- **Location**: `tests/e2e/**/*.spec.js`

## Testing Categories

### Functional Testing

#### Unit Tests
- ✅ Component rendering
- ✅ Event handling
- ✅ State management
- ✅ Utility functions
- ✅ Custom hooks
- ✅ Context providers

#### Integration Tests
- API integration with Supabase
- Authentication flows
- Data fetching and caching
- Form submissions
- Real-time updates

#### End-to-End Tests
- User registration and login
- Profile management
- Habit tracking
- Recipe management
- Community features

### Non-Functional Testing

#### Performance Testing
- **Tools**: Lighthouse, Web Vitals, Custom Performance Script
- **Metrics**: 
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Cumulative Layout Shift (CLS) < 0.1
  - Total Blocking Time (TBT) < 300ms
- **Load Testing**: 50+ concurrent users
- **Bundle Analysis**: Size optimization

#### Accessibility Testing
- **Tools**: Axe-core, Playwright Accessibility, Custom Accessibility Script
- **Standards**: WCAG 2.1 AA compliance
- **Coverage**:
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast
  - Semantic HTML
  - ARIA attributes

#### Security Testing
- **Tools**: npm audit, Custom Security Script
- **Focus**:
  - Dependency vulnerabilities
  - Input validation
  - Authentication security
  - Security headers
  - XSS/CSRF prevention

## Test Configuration

### Vitest Configuration
```javascript
// vitest.config.js
- Environment: jsdom
- Coverage: v8 provider
- Thresholds: 80% for branches, functions, lines, statements
- Setup: Global test utilities and mocks
```

### Playwright Configuration
```javascript
// playwright.config.js
- Browsers: Chromium, Firefox, WebKit
- Mobile: Chrome, Safari
- Features: Screenshots, videos, traces on failure
- Parallel execution with retry on failure
```

## Test Scripts

### Development
- `npm run test` - Run unit tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate coverage report

### CI/CD
- `npm run test:run` - Run all unit tests once
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run complete test suite

### Auditing
- `npm run test:security` - Security vulnerability scan
- `npm run test:performance` - Performance audit with Lighthouse
- `npm run test:accessibility` - Accessibility compliance check

## Test Data Management

### Mocks and Fixtures
- **Supabase Client**: Mocked for consistent testing
- **User Data**: Standardized test users (normal, admin)
- **API Responses**: Realistic mock data
- **Environment Variables**: Test-specific configuration

### Test Database
- Isolated test environment
- Seed data for consistent state
- Cleanup between test runs

## Continuous Integration

### GitHub Actions Workflow
```yaml
- Unit Tests: Run on every PR
- E2E Tests: Run on main branch and releases
- Security Audit: Daily scheduled run
- Performance Audit: Weekly scheduled run
- Accessibility Audit: On every deployment
```

### Quality Gates
- **Code Coverage**: Minimum 80%
- **Security Score**: Minimum 85/100
- **Performance Score**: Minimum 90/100
- **Accessibility Score**: Minimum 95/100

## Test Writing Guidelines

### Unit Tests
```javascript
// Example structure
describe('ComponentName', () => {
  it('should render with correct props', () => {
    // Arrange, Act, Assert
  })
  
  it('should handle user interactions', async () => {
    // Use userEvent for interactions
    // Test state changes and side effects
  })
})
```

### Integration Tests
```javascript
// Test realistic user scenarios
describe('User Authentication Flow', () => {
  it('should login user and redirect to dashboard', async () => {
    // Mock API responses
    // Test complete flow
    // Verify final state
  })
})
```

### E2E Tests
```javascript
// Test critical user paths
test('User can create and complete a habit', async ({ page }) => {
  // Navigate through real UI
  // Perform actual user actions
  // Verify end-to-end functionality
})
```

## Accessibility Testing Details

### Manual Testing Checklist
- [ ] Keyboard navigation (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] Zoom to 200% without horizontal scrolling
- [ ] Focus indicators visible
- [ ] Color is not the only way to convey information

### Automated Accessibility Tests
- **Axe-core**: Comprehensive rule-based testing
- **Color Contrast**: WCAG AA compliance (4.5:1 for normal text)
- **Keyboard Navigation**: Tab order and focus management
- **Semantic HTML**: Proper use of landmarks and headings
- **ARIA**: Appropriate labels and roles

## Performance Testing Details

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Optimization
- Code splitting by route
- Lazy loading for non-critical components
- Tree shaking for unused code
- Image optimization (WebP, responsive images)

### Load Testing
- Concurrent user simulation
- API endpoint stress testing
- Database performance under load
- Memory leak detection

## Security Testing Details

### Input Validation
- SQL injection prevention
- XSS attack prevention
- CSRF protection
- Input sanitization

### Authentication Security
- Password strength requirements
- Rate limiting for login attempts
- Session management
- JWT token validation

### Infrastructure Security
- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)
- Dependency vulnerability scanning
- API security testing

## Reporting and Metrics

### Test Reports
- Coverage reports with line-by-line details
- Performance reports with Core Web Vitals
- Accessibility reports with WCAG compliance
- Security audit reports with vulnerability details

### Dashboards
- Test execution trends
- Code coverage over time
- Performance metrics tracking
- Accessibility compliance status

## Maintenance

### Test Review Process
- Regular test review in code reviews
- Quarterly test strategy assessment
- Annual tool and framework updates
- Continuous improvement based on metrics

### Test Data Cleanup
- Automated cleanup of test artifacts
- Regular database maintenance
- Log file management
- Report archival

## Getting Started

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Full test suite
npm run test:all

# Audit tests
npm run test:security
npm run test:performance
npm run test:accessibility
```

### Writing Your First Test
1. Create test file alongside the component
2. Follow the naming convention: `ComponentName.test.jsx`
3. Use the test utilities from `src/test/utils.jsx`
4. Follow the AAA pattern: Arrange, Act, Assert
5. Add test to CI pipeline if needed

## Best Practices

### Test Independence
- Each test should be able to run independently
- No shared state between tests
- Proper setup and teardown

### Test Readability
- Clear, descriptive test names
- Arrange-Act-Assert pattern
- Minimal test code duplication

### Test Maintainability
- Keep tests simple and focused
- Use page object model for E2E tests
- Regular refactoring of test code

### Performance
- Parallel test execution
- Efficient test data setup
- Minimize test runtime
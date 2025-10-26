# Contributing to CodeCollab

Thank you for your interest in contributing to CodeCollab! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/codecollab.git
cd codecollab

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Changes

Follow our coding standards:

#### Code Style

- Use TypeScript strict mode
- Follow ESLint and Prettier rules
- Write self-documenting code
- Add comments for complex logic only

#### Component Guidelines

```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  // Implementation
}

// ❌ Bad
export function Button(props: any) {
  // Implementation
}
```

#### Naming Conventions

- Components: PascalCase (`Button.tsx`)
- Hooks: camelCase with "use" prefix (`useDebounce.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`User`, `AuthResponse`)

### 3. Write Tests

All new code must include tests:

```typescript
// Component test
describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Testing Requirements:**
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for complex flows
- E2E tests for critical user journeys
- Maintain 80%+ code coverage

### 4. Run Quality Checks

Before committing:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test

# Coverage
npm run test:coverage
```

### 5. Commit Changes

Follow conventional commit format:

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve cursor position sync issue"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for Button component"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build/tooling changes

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

**PR Title:** Clear, descriptive title
**Description:**
- What changes were made
- Why these changes were needed
- How to test the changes
- Screenshots (if UI changes)
- Related issues (#123)

**PR Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

## Code Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Code coverage maintained/improved
5. Documentation updated if needed

### Addressing Review Comments

- Respond to all comments
- Make requested changes
- Push new commits
- Re-request review when ready

## Accessibility Guidelines

All UI components must:

- Use semantic HTML
- Include ARIA attributes where needed
- Support keyboard navigation
- Have proper focus indicators
- Meet WCAG 2.1 AA standards
- Work with screen readers

Example:

```typescript
<button
  onClick={handleClick}
  aria-label="Close modal"
  aria-pressed={isPressed}
>
  {children}
</button>
```

## Performance Guidelines

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement code splitting for large features
- Optimize images and assets
- Keep bundle size under 200KB initial load

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Sanitize HTML content
- Use parameterized queries
- Follow OWASP best practices

## Documentation

Update documentation when:

- Adding new features
- Changing API contracts
- Modifying architecture
- Adding dependencies

Required documentation:
- JSDoc comments for public APIs
- README updates for new features
- Architecture docs for design changes

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an Issue
- **Security:** Email security@codecollab.io
- **Chat:** Join our Discord server

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub insights

Thank you for contributing to CodeCollab! 🎉

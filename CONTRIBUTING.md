# Contributing to Demo Video Automation

Thank you for your interest in contributing to Demo Video Automation! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/demo-video-automation/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with the "enhancement" label
3. Provide:
   - Use case and motivation
   - Proposed solution
   - Alternative solutions considered

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit with clear messages
7. Push to your fork
8. Create a Pull Request

#### PR Guidelines

- Keep PRs focused and small
- Update documentation as needed
- Add tests for new features
- Ensure CI passes
- Respond to review feedback promptly

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/demo-video-automation.git
cd demo-video-automation

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run the demo app
cd demo-app
npm install
npm run dev
```

## Project Structure

```
├── src/
│   ├── analyzers/      # Code analysis modules
│   ├── generators/     # Documentation generators
│   ├── executors/      # Playwright execution
│   └── types.ts        # TypeScript definitions
├── demo-app/           # Example application
├── tests/              # Test files
└── docs/               # Documentation
```

## Testing

- Write unit tests for new features
- Include integration tests for complex flows
- Test edge cases and error handling

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=analyzer
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to public APIs
- Include examples for new features
- Update configuration documentation

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a GitHub release
4. Publish to npm

## Questions?

- Open a discussion in [GitHub Discussions](https://github.com/yourusername/demo-video-automation/discussions)
- Join our community chat (coming soon)
- Email: maintainers@demo-video-automation.dev

Thank you for contributing!
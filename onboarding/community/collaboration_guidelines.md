# Collaboration Guidelines

Guidelines for contributing to the Syntheverse project and collaborating with the community.

---

## Contribution Types

### 1. Code Contributions

#### Pull Request Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/AiwonA1/Syntheverse-.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clear, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm run test
   npm run compile
   ```

5. **Commit with Clear Messages**
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Code Standards

- **Solidity:** Follow Solidity style guide
- **JavaScript:** Use ES6+, follow existing patterns
- **Python:** Follow PEP 8 for AI integration code
- **Documentation:** Update relevant docs with changes

#### Testing Requirements

- All new code must include tests
- Tests must pass before PR submission
- Maintain or improve test coverage

---

### 2. Research Contributions

#### Submitting Discoveries

1. **Prepare Your Discovery**
   - Ensure novelty (non-redundant)
   - Maximize coherence and density
   - Align with HHF principles

2. **Test Locally First**
   ```bash
   npm run test:multiple
   ```

3. **Document Your Discovery**
   - Explain the contribution
   - Provide context and references
   - Include validation results

4. **Share in Community**
   - Post in GitHub Discussions (Showcase)
   - Include discovery ID and scores
   - Share insights and learnings

#### Research Standards

- **Novelty:** Must be non-redundant
- **Coherence:** Structural consistency required
- **Density:** Substantial informational content
- **Documentation:** Clear explanation of contribution

---

### 3. Documentation Contributions

#### Documentation Types

- **Tutorials:** Step-by-step guides
- **API Documentation:** Function and contract references
- **Examples:** Code examples and use cases
- **Guides:** Comprehensive how-to documents

#### Documentation Standards

- **Clarity:** Write for your audience
- **Completeness:** Cover all relevant aspects
- **Examples:** Include practical examples
- **Updates:** Keep documentation current

#### Documentation Locations

- `README.md` - Main project overview
- `docs/` - Research papers
- `onboarding/` - Cadet onboarding materials
- `blockchain/README.md` - Technical documentation
- `TEST_ENVIRONMENT_GUIDE.md` - Test environment guide

---

## Collaboration Etiquette

### Communication

#### Be Clear and Concise
- Use clear language
- Provide context
- Include relevant details

#### Be Respectful
- Treat all members with respect
- Welcome diverse perspectives
- Provide constructive feedback

#### Be Responsive
- Respond to questions promptly
- Acknowledge contributions
- Follow up on discussions

### Issue Reporting

#### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- System information
- Relevant code/logs

#### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if applicable)
- Benefits to the community

---

## Code Review Process

### For Contributors

1. **Prepare Your PR**
   - Ensure all tests pass
   - Update documentation
   - Write clear commit messages

2. **Respond to Feedback**
   - Address review comments
   - Make requested changes
   - Engage in discussion

3. **Be Patient**
   - Reviews take time
   - Maintainers are volunteers
   - Be open to suggestions

### For Reviewers

1. **Be Constructive**
   - Provide helpful feedback
   - Suggest improvements
   - Explain reasoning

2. **Be Timely**
   - Review PRs promptly
   - Respond to questions
   - Provide clear decisions

3. **Be Respectful**
   - Appreciate contributions
   - Provide positive feedback
   - Guide improvements

---

## Intellectual Property

### License

All contributions are licensed under the MIT License (see [LICENSE.md](../LICENSE.md)).

### Attribution

Contributors will be:
- Credited in commit history
- Listed in CONTRIBUTORS.md (if applicable)
- Acknowledged in release notes

### Research Papers

Research papers maintain their original authorship and are shared under the MIT License.

---

## Development Workflow

### Branch Strategy

- **main:** Stable, production-ready code
- **feature/:** New features
- **bugfix/:** Bug fixes
- **docs/:** Documentation updates

### Commit Messages

Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring

### Testing

Before submitting:
```bash
# Run all tests
npm run test

# Compile contracts
npm run compile

# Lint code (if configured)
npm run lint
```

---

## Recognition

### Contributors

Contributors are recognized through:
- GitHub contributor list
- Commit history
- Release notes
- Community acknowledgments

### Discovery Contributors

Discoveries are:
- Recorded on-chain
- Rewarded with SYNTH tokens
- Documented in test reports
- Shared in community showcases

---

## Getting Started

### First Contribution

1. **Read This Guide** - Understand the process
2. **Find an Issue** - Look for "good first issue" labels
3. **Ask Questions** - Use GitHub Discussions
4. **Make Changes** - Follow the guidelines
5. **Submit PR** - Create your pull request

### Mentorship

New contributors can:
- Ask questions in GitHub Discussions
- Request code reviews
- Seek guidance from maintainers
- Learn from existing code

---

## Questions?

If you have questions about contributing:

1. **Check Documentation** - Review relevant guides
2. **Search Discussions** - Look for similar questions
3. **Ask in Discussions** - Post in GitHub Discussions
4. **Contact Maintainers** - Reach out directly if needed

---

## Code of Conduct

All contributors must follow the project's Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on community benefit

---

**Thank you for contributing to the Syntheverse! Your contributions help expand the Awarenessverse.**


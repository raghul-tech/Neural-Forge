# 🤝 Contributing to Neural Forge

Thank you for your interest in contributing to Neural Forge! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be patient and understanding
- Keep discussions professional and friendly

## Getting Started

### Prerequisites

- **Git** - Version control system
- **Modern web browser** - Chrome, Firefox, Safari, or Edge
- **Text editor** - VS Code, Sublime Text, or similar

### No Server Required!

**Neural Forge runs entirely in your browser** - no local server needed!

```bash
# Just clone and open!
git clone https://github.com/raghul-tech/Neural-Forge.git
cd Neural-Forge

# Double-click index.html - that's it!
open index.html   # On Mac
start index.html  # On Windows
```

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/raghul-tech/Neural-Forge.git
   cd Neural-Forge
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/raghul-tech/Neural-Forge.git
   ```

## Development Setup

### Local Development (No Server!)

Simply open `index.html` in your browser:

| Method | Instructions |
|--------|--------------|
| **Double-click** | Find `index.html` in file explorer and double-click |
| **Drag & drop** | Drag `index.html` into your browser window |
| **Command line** | `open index.html` (Mac) / `start index.html` (Windows) |

**No Python, no Node.js, no PHP needed!** The game uses vanilla HTML/CSS/JS.

### Why No Server Needed?

- **Pure HTML5, CSS3, and JavaScript**
- **No backend dependencies**
- **All assets are local**
- **Uses browser's localStorage for saves**
- **Web Audio API works without server**


## Coding Standards

### JavaScript Guidelines

- **Use modern ES6+ syntax** when appropriate
- **CamelCase** for variables and functions
- **PascalCase** for classes
- **UPPER_SNAKE_CASE** for constants
- **Add JSDoc comments** for functions and classes

```javascript
// Good example
class NeuralNetwork {
    constructor() {
        this.maxNeurons = 100;
    }
    
    /**
     * Processes input data through the network
     * @param {Array} inputData - Input values to process
     * @returns {Array} Processed output values
     */
    processInput(inputData) {
        // Implementation
    }
}
```

### CSS Guidelines

- **Use BEM methodology** for class names
- **Mobile-first responsive design**
- **CSS variables** for consistent theming
- **Minimize specificity** where possible

```css
/* Good example */
.game-container {
    --primary-color: #00ffcc;
    --secondary-color: #ff00ff;
}

.machine-card {
    padding: 1rem;
    border: 2px solid var(--primary-color);
}

.machine-card--active {
    background-color: rgba(0, 255, 204, 0.1);
}
```

### HTML Guidelines

- **Semantic HTML5** elements
- **Accessible markup** with ARIA labels
- **Proper heading hierarchy**
- **Alt text** for images

```html
<!-- Good example -->
<main class="game-container">
    <header class="header">
        <h1>Neural Forge</h1>
    </header>
    
    <section class="game-panel" aria-label="Game board">
        <canvas id="gameCanvas" aria-label="Neural network grid"></canvas>
    </section>
</main>
```

## Pull Request Process

### Branch Naming

Use descriptive branch names:

- `feature/new-machine-type`
- `bugfix/score-calculation`
- `docs/update-readme`
- `ui/improve-responsive-design`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(game): add mutator machine type
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
```

### Pull Request Template

When creating a PR, include:

1. **Description** - What changes were made and why
2. **Testing** - How the changes were tested
3. **Screenshots** - For UI changes (if applicable)
4. **Breaking Changes** - Any breaking changes (if applicable)

### Review Process

1. **Self-review** - Ensure code follows guidelines
2. **Automated checks** - All CI/CD checks must pass
3. **Peer review** - At least one maintainer review
4. **Approval** - Maintainer approval required for merge

## Testing Guidelines

### How to Test (No Server Needed!)

1. **Open `index.html` in your browser**
2. **Test the features listed below**
3. **Check console for errors** (F12 -> Console tab)

### Manual Testing Checklist

#### Game functionality - All game mechanics work correctly
- [ ] Place machines (left click on grid)
- [ ] Remove machines (right click)
- [ ] Select different machine types
- [ ] Evolve loop button works
- [ ] Score increases over time
- [ ] Resources decrease/increase correctly

#### Camera controls
- [ ] Drag to pan the grid
- [ ] Camera stays within bounds

#### UI responsiveness
- [ ] Works on different screen sizes
- [ ] Buttons are clickable
- [ ] Stats update correctly

#### Game states
- [ ] Win condition triggers at 1000 score
- [ ] Loss condition at loop 15
- [ ] Reset button works
- [ ] Save/load works after refresh

#### Audio
- [ ] Sound plays after first click
- [ ] Different sounds for different actions

### Testing Scenarios

| Scenario | How to Test |
|----------|-------------|
| **Basic gameplay** | Build SENSOR -> PROCESSOR -> ACTUATOR -> EVOLVE |
| **Win condition** | Reach 1000 score (use auto-build to speed up) |
| **Loss condition** | Reach loop 15 with score < 1000 |
| **Save/load** | Play, refresh page, game state persists |
| **Camera pan** | Click and drag on empty grid area |

## Documentation

### Code Documentation

- **JSDoc comments** for all public functions and classes
- **Inline comments** for complex logic
- **README updates** for new features

### User Documentation

- **Game instructions** - Clear and concise (in HELP modal)
- **Feature explanations** - Help users understand new features
- **Troubleshooting** - Common issues and solutions

## Reporting Issues

### Bug Reports

When reporting bugs, include:

| Information | Why It's Important |
|-------------|-------------------|
| **Browser & version** | Chrome 120, Firefox 115, etc. |
| **OS** | Windows 11, macOS Sonoma, etc. |
| **Steps to reproduce** | Exact clicks to trigger the bug |
| **Expected behavior** | What should happen |
| **Actual behavior** | What actually happens |
| **Console errors** | Press F12 -> Console tab |

### Feature Requests

Include:

- **Problem statement** - What problem needs solving
- **Proposed solution** - How the feature should work
- **Alternatives considered** - Other approaches explored

## Contribution Areas

### Code Contributions

| Area | Difficulty | Description |
|------|------------|-------------|
| **New machine types** | Medium | Add new machines with unique abilities |
| **UI improvements** | Easy | Better visual feedback, animations |
| **Performance** | Hard | Optimize rendering, reduce lag |
| **Accessibility** | Easy | Add ARIA labels, keyboard shortcuts |

### Non-Code Contributions

| Area | Description |
|------|-------------|
| **Documentation** | Improve guides and tutorials |
| **Bug reports** | Help identify and fix issues |
| **Feature ideas** | Suggest new gameplay mechanics |
| **Testing** | Test on different browsers/devices |
| **Feedback** | Share your experience playing |

## Recognition

Contributors will be recognized in:

- **README.md** - Contributor list
- **Game credits** - In-game acknowledgment
- **Release notes** - Mention in changelog

## Getting Help

- **GitHub Issues** - For bug reports and feature requests
- **Discussions** - For general questions and ideas
- **Browser console** - Check for errors (F12)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Quick Start for Contributors

```bash
# 1. Clone the repository
git clone https://github.com/raghul-tech/Neural-Forge.git
cd Neural-Forge

# 2. Open the game (no server needed!)
open index.html   # Mac
start index.html  # Windows
double-click      # Any OS

# 3. Make your changes
# Edit files in your text editor

# 4. Test by refreshing the browser
# Press F5 or Cmd+R

# 5. Commit and push
git add .
git commit -m "your changes"
git push origin your-branch-name
```

---

Thank you for contributing to Neural Forge! Your help makes this project better for everyone. 🎮✨

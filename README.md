# ResumeFlow - Professional Resume Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Create stunning professional resumes with our modern drag & drop Resume Builder. Features real-time preview, dark mode, PDF export, and more.

![ResumeFlow Banner](ResumeFlow%20_%20Professional%20Resume%20Builder.pdf)

## ✨ Features

- **🎨 Real-time Preview** - See your changes instantly as you edit
- **🌓 Dark/Light Mode** - Toggle between themes for comfortable editing
- **📄 PDF Export** - Save your resume as a professional PDF document
- **📥 Import/Export** - Save and load your resume data in JSON format
- **🎯 Drag & Drop** - Reorder sections with intuitive drag and drop
- **🎨 Custom Colors** - Choose your accent color to match your style
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **⚡ Fast & Lightweight** - No backend required, runs entirely in your browser

## 🚀 Quick Start

1. Open `index.html` in your web browser
2. Fill in your personal information, experience, education, and skills
3. Customize the theme and accent color
4. Preview your resume in real-time
5. Export as PDF or save as JSON for later editing

## 📁 Project Structure

```
ResumeFlow/
├── index.html          # Main application file
├── css/                # Stylesheets
│   ├── 01-tokens.css   # Design tokens (colors, fonts, spacing)
│   ├── 02-base.css     # Base styles and resets
│   ├── 03-layout.css   # Layout components
│   ├── 04-controls.css # UI controls
│   ├── 05-forms.css    # Form styles
│   ├── 06-components.css # Reusable components
│   ├── 07-lists.css    # List styles
│   ├── 08-resume.css   # Resume-specific styles
│   ├── 09-animations.css # Animations
│   └── 10-responsive.css # Responsive breakpoints
├── js/                 # JavaScript modules
│   ├── 01-config.js    # Configuration settings
│   ├── 02-utils.js     # Utility functions
│   ├── 03-templates.js # HTML templates
│   ├── 04-store.js     # State management
│   ├── 05-app-core.js  # Core application logic
│   ├── 06-app-render.js # Rendering functions
│   ├── 07-app-handlers.js # Event handlers
│   ├── 08-app-drag.js  # Drag and drop functionality
│   ├── 09-app-io.js    # Import/export operations
│   └── 10-bootstrap.js # Application initialization
├── Example.json        # Sample resume data
└── LICENSE             # MIT License
```

## 🛠️ Usage

### Editor Controls

| Button | Action |
|--------|--------|
| 📤 Upload | Import a previously saved resume (JSON) |
| 📥 Download | Export your resume data as JSON |
| 🎨 Color Picker | Change the accent color |
| 🌙 Moon/Sun | Toggle dark/light mode |
| 🖨️ Print | Save as PDF using browser's print dialog |

### View Modes

- **Editor Mode** - Full editing interface with forms and controls
- **Preview Mode** - Clean preview of your resume without editing controls

## 📝 Data Format

Resume data is stored in JSON format with the following structure:

```json
{
  "settings": {
    "theme": "light",
    "accentColor": "#6366f1"
  },
  "personal": {
    "name": "Your Name",
    "role": "Your Title",
    "email": "your@email.com",
    "phone": "+1 (555) 123-4567",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/yourprofile",
    "website": "https://yourwebsite.com"
  },
  "summary": "Professional summary...",
  "skills": {
    "tech": "Technical skills...",
    "soft": "Soft skills..."
  },
  "exp": [...],
  "edu": [...],
  "proj": [...]
}
```

See `Example.json` for a complete example.

## 🔧 Configuration

Edit `js/01-config.js` to customize:

- `STORAGE_KEY` - LocalStorage key for saving data
- `SAVE_DELAY` - Debounce delay for auto-save (ms)
- `MAX_HISTORY` - Undo/redo history limit
- `A4_WIDTH_PX` / `A4_HEIGHT_PX` - Resume dimensions
- `TOAST_DURATION` - Notification display time (ms)

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Modern browsers with ES6+ support required.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)

---

Made with ❤️ by Lion 

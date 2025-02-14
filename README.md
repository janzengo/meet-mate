# MeetMate - Google Meet Link Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Chrome](https://img.shields.io/badge/chrome-compatible-green.svg) ![Edge](https://img.shields.io/badge/edge-compatible-green.svg)

MeetMate is a lightweight browser extension that helps you save, organize, and quickly access your Google Meet links.

## Features
- Save and manage Google Meet links with custom names
- One-click access to meetings
- Secure, local storage (no data tracking or external servers)

## Installation

### Users
1. Install from the Chrome Web Store or Edge Add-ons store (links coming soon)
2. Click "Add to Browser"

### Developers
1. Clone the repo:
   ```bash
   git clone https://github.com/janzengo/meet-mate.git
   ```
2. Open `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project folder

## Usage

### Quick Demo
<video width="100%" controls>
  <source src="assets/videos/meetmate-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Step-by-Step Guide
1. Click the MeetMate extension icon
2. Add new meetings by entering a name and pasting the link
3. Click a saved link to join, copy, or delete with confirmation

## Technical Details
- Works on Chrome and Edge
- Requires `storage` permission for saving links
- Uses `tabs` permission to open meetings

## Contributing
1. Fork the repo and create a feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```
2. Make changes and commit:
   ```bash
   git commit -m 'Added new feature'
   ```
3. Push and open a pull request

## Privacy
- No tracking or data collection
- All data stays in your browser

Thank you!

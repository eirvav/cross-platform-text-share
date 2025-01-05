# Local Text & Image Share

A simple web application that allows you to share text and images between devices on your local network. Perfect for quickly transferring content between your phone and computer without the need for external services.

## Features

- **Text Sharing**
  - One-click paste functionality optimized for mobile devices
  - Copy text directly to clipboard on desktop
  - Real-time sync between devices
  
- **Image Sharing**
  - Upload images up to 5MB
  - Download images on mobile devices
  - Copy images directly to clipboard on desktop
  
- **User Experience**
  - Intuitive mode switching of text and image sharing modes, with tooltips and clear labels
  - Real-time sync: Updates sync automatically between devices every 5 seconds
  - Dark/Light mode support
  - Mobile-optimized interface
  - Cross-platform compatibility
  
- **Technical Features**
  - Local network operation
  - No external services required
  - Built with Next.js App Router
  - Modern clipboard API with fallbacks
  - Responsive design

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Access the application:
   - On your computer: Open [http://localhost:3000](http://localhost:3000)
   - On other devices: Open `http://[your-computer-ip]:3000` 
     (e.g., `http://192.168.1.100:3000`)

## Usage

### Text Sharing
1. Click the clipboard icon to switch to text mode
2. Click the paste area to paste text from your clipboard
3. Text will automatically sync to all connected devices
4. Click 'Copy' to copy text on other devices

### Image Sharing
1. Click the image icon to switch to image mode
2. Click to upload an image (max 5MB)
3. On mobile: Click 'Download' to save the image
4. On desktop: Click 'Copy' to copy image to clipboard

## Built With

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon system
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## Development

To build for production:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Notes

- Images are limited to 5MB to ensure smooth operation
- Content is stored in memory and cleared when the server restarts
- All sharing happens over your local network - no data leaves your network
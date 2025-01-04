# Local Text Share

A simple web application that allows you to share text between devices on your local network. Perfect for quickly transferring text between your phone and computer without the need for external services.

## Features

- **Instant Paste**: One-click paste functionality optimized for mobile devices
- **Real-time Sync**: Text updates sync automatically between devices every second
- **Local Network**: Works on any device connected to the same network
- **Cross-Platform**: Compatible with desktop and mobile browsers
- **No Setup Required**: Just run the server and open the URL on your devices
- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


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

1. Open the application on your devices
2. Click the paste area to paste text from your clipboard
3. The text will automatically appear on all connected devices
4. Click to paste new text at any time

## Built With

- [Next.js](https://nextjs.org/) - The React framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Development

To build for production:


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
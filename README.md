# Check Your Meter

A modern web application that helps users identify if they have an RTS (Radio Teleswitch Service) meter that needs replacement.

## About RTS Meters

RTS meters are being phased out across the UK. If your property has an RTS meter, it will need to be replaced by your energy supplier before service disruption occurs. This application uses AI vision technology to analyze photos of electricity meters and determine if they are RTS meters.

## Features

- **AI-Powered Analysis**: Uses OpenAI's vision models to analyze meter images
- **Image Enhancement**: Automatically enhances low-quality images to improve analysis accuracy
- **Clear Results**: Provides detailed analysis with certainty scores and reasoning
- **Mobile-Friendly**: Take photos directly from your mobile device or upload existing images
- **Urgent Warnings**: Clear instructions for users with RTS meters to contact their suppliers

## Setup for Development

### Prerequisites

- Node.js 18+ and npm
- An OpenAI API key with access to the o4-mini model

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/CheckYourMeter.git
   cd CheckYourMeter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

This application is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel
2. Add your `OPENAI_API_KEY` as an environment variable in the Vercel project settings
3. Deploy the application

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Animation**: Framer Motion
- **AI**: OpenAI Vision API (o4-mini model)
- **Image Processing**: Client-side Canvas API for image enhancement

## Security

- API keys are managed securely through environment variables
- No user data is stored or transmitted except to OpenAI for analysis
- All image processing is done client-side or securely on the server

## License

MIT License

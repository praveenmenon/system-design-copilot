# System Design Copilot

A web-based whiteboard application that generates system architecture diagrams from natural language prompts using AI.

## Features

- **Natural Language Input**: Describe your system in plain English
- **AI-Powered Generation**: Uses OpenAI GPT-4 or Anthropic Claude to generate diagrams
- **Interactive Canvas**: Drag and reposition components on the canvas
- **Multiple Templates**: Pre-built templates for common system architectures
- **Export Functionality**: Export diagrams as PNG images
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd system-design-copilot
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   # OR
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_AI_PROVIDER=openai  # or 'anthropic'
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Usage

1. Enter a system design prompt (e.g., "Design a scalable chat application")
2. Click "Generate Diagram" 
3. The AI will generate a visual diagram with components and connections
4. Drag components to reposition them
5. Export your diagram as PNG

## Example Prompts

- "Design a scalable chat application"
- "Design a URL shortener like bit.ly"
- "Design a social media feed system"
- "Design an e-commerce platform"
- "Design a video streaming service"

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Canvas**: Konva.js for interactive diagrams
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude
- **Styling**: CSS with responsive design
- **Deployment**: Ready for Vercel/Netlify

## Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

## Project Structure

```
src/
├── components/
│   ├── PromptInput.tsx      # Input form component
│   ├── DiagramCanvas.tsx    # Interactive canvas
│   └── *.css               # Component styles
├── services/
│   ├── aiDiagramGenerator.ts    # AI service integration
│   └── mockDiagramGenerator.ts  # Fallback mock data
├── App.tsx                 # Main application
└── types/                  # TypeScript interfaces
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

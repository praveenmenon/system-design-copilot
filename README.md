# System Design Copilot

A web-based whiteboard application that generates system architecture diagrams from natural language prompts using AI.

## Features

- **Natural Language Input**: Describe your system in plain English
- **AI-Powered Generation**: Uses OpenAI GPT-4 or Anthropic Claude to generate diagrams
- **Enhanced Visual Design**: 
  - Databases rendered as ellipses for better visual distinction
  - Cache systems displayed as diamonds
  - Bidirectional arrows for two-way data flows
  - Smart connection points (right-to-left instead of top-to-bottom)
  - Request/response labels on arrows for better clarity
- **Interactive Canvas**: Drag and reposition components on the canvas
- **Comprehensive Analysis**: 
  - Detailed database schema design with PKs, FKs, and indexes
  - NoSQL schema with partition/sort keys, GSIs, and LSIs
  - Capacity planning with storage calculations and growth projections
  - Multi-year scaling estimates with redundancy factors
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

- "Design a scalable chat application with real-time messaging"
- "Design a URL shortener like bit.ly with analytics"
- "Design a social media feed system with personalization"
- "Design an e-commerce platform with inventory management"
- "Design a video streaming service with content delivery"
- "Design a microservices architecture for a fintech platform"
- "Create a system for processing millions of IoT sensor readings"

## Enhanced Analysis Features

The AI now provides:

- **Database Schema Design**: Complete table structures with primary keys, foreign keys, and indexes
- **NoSQL Design**: Partition keys, sort keys, GSIs, and LSIs for DynamoDB-style databases  
- **Capacity Planning**: Realistic storage calculations (e.g., "100M records × 1KB = 100GB/year")
- **Growth Projections**: 1-5 year scaling estimates with redundancy and index overhead
- **Connection Labels**: Clear request/response flow descriptions on arrows
- **Visual Clarity**: Database ellipses, cache diamonds, and bidirectional arrows

## Large Blobs Pattern

The Large Blobs pattern handles massive file uploads by bypassing application servers with presigned URLs, storing metadata separately from blob storage, and serving downloads through a CDN.

Example pattern output:

```json
{
  "patterns": [
    {
      "id": "large-blobs",
      "scope": "Direct-to-object storage uploads with metadata stored separately from binary blobs.",
      "majorFunctionalRequirements": [
        "Generate presigned upload URL",
        "Direct client upload/download to blob storage",
        "Metadata service persists file records & lifecycle"
      ]
    }
  ]
}
```

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Canvas**: Excalidraw for interactive diagrams with enhanced shapes
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude with detailed system analysis
- **Visual Components**: 
  - Rectangles for services and servers
  - Ellipses for databases (SQL/NoSQL)
  - Diamonds for cache systems
  - Smart arrow routing and labeling
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
│   ├── PromptInput.tsx           # Input form component
│   ├── ExcalidrawCanvas.tsx      # Enhanced interactive canvas with shape rendering
│   ├── SystemAnalysisPanel.tsx   # Detailed system analysis display
│   └── *.css                    # Component styles
├── services/
│   ├── aiDiagramGenerator.ts     # Enhanced AI service with detailed schema analysis
│   └── mockDiagramGenerator.ts   # Fallback mock data
├── App.tsx                      # Main application
└── types/
    └── diagram.ts               # TypeScript interfaces for enhanced data structures
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

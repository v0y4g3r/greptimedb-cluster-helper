# GreptimeDB Deploy Helper (Vue.js)

An interactive Vue.js web application to **design and generate deployment commands** for a GreptimeDB cluster.

## Features

- **Visual drag-and-drop interface** for designing your cluster topology
- **Component management**: Add etcd, metasrv, datanode, and frontend nodes
- **Machine management**: Add multiple physical machines with custom configurations
- **Configuration generation**: Generate bash commands and TOML config files
- **Syntax highlighting** for generated bash commands
- **Copy-to-clipboard** functionality for each configuration block

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Highlight.js** for syntax highlighting
- **Vanilla CSS** with modern styling

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd greptimedb-deploy-helper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Usage

1. **Add Physical Machines**: Click the "Add Physical Machine" button to add machines to your cluster topology.

2. **Configure Machines**: For each machine, specify:
   - Host IP address
   - GreptimeDB home directory

3. **Drag and Drop Components**: Drag components from the sidebar to machines:
   - etcd: Configuration store
   - metasrv: Metadata server
   - datanode: Data storage node
   - frontend: Query frontend

4. **Generate Configuration**: Click "Generate Config Files & Commands" to create deployment scripts.

5. **Copy Commands**: Each generated block can be copied to clipboard with the "Copy This Block" button.

## Architecture

The application is structured as follows:

```
src/
├── components/        # Vue components
│   ├── App.vue       # Main application component
│   ├── Sidebar.vue   # Component palette
│   ├── MachinesArea.vue # Container for machine cards
│   ├── MachineCard.vue # Individual machine configuration
│   ├── MachineComponent.vue # Component instances on machines
│   ├── GenerationArea.vue # Configuration output
│   └── MessageDisplay.vue # Notification component
├── styles/           # CSS files
│   └── main.css     # Application styles
├── types/           # TypeScript type definitions
│   └── index.ts     # Type definitions
├── utils/           # Utility functions
│   └── configGenerator.ts # Configuration generation logic
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Project Configuration

This project uses modern frontend development tools:

- **Vite**: Fast build tool and dev server
- **TypeScript**: Static type checking
- **ESLint**: Code linting
- **Vue TSC**: Vue-specific type checking

## License

[Add your license here]
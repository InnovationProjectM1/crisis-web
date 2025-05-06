# crisis-web

crisis-web is a web component of Crisis application built with React, TypeScript, and Tailwind CSS.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed, then clone the repository and install the dependencies:

```bash
git clone https://github.com/InnovationProjectM1/crisis-web.git
cd crisis-web
npm install
```

## Usage

### Development server

To start the development server:

```bash
npm run dev
```

This will start the Vite development server and open your application in the browser.

### Building & Preview for production

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### Linting and formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run prettier

# Check formatting with Prettier
npm run prettier:check
```

## Environment Configuration

This project uses environment variables for configuration. Create a `.env.development.local` file in the root directory for local development settings:

```bash
# Create .env.development.local file
touch .env.development.local  # For Unix/Mac
# OR
echo. > .env.development.local  # For Windows PowerShell
```

### Environment Files

The project supports different environment files:

- `.env`: Default environment variables for all environments
- `.env.local`: Local overrides for all environments (not committed to git)
- `.env.development`: Development environment variables
- `.env.development.local`: Local overrides for development (not committed to git)

Example `.env.development.local` configuration:

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Crisis Web (Development)
```

**Note**: All environment variables used with Vite must be prefixed with `VITE_` to be exposed to your application.

## Contributing

Please read our [contribution guidelines](https://github.com/InnovationProjectM1/crisis-web/blob/master/CONTRIBUTING.md) before submitting a pull request.

## License

[MIT](https://github.com/InnovationProjectM1/crisis-web/blob/master/LICENSE)

# Étape 1 : Build de l'app
FROM node:20-alpine AS builder
WORKDIR /app

# Copie uniquement les fichiers nécessaires au build
COPY package.json package-lock.json ./
RUN npm ci

# Puis copie le reste du code
COPY . .

# Build l'application Next.js
RUN npm run build

# Étape 2 : Image finale, plus légère
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copie uniquement les fichiers nécessaires au runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Par défaut, Next écoute sur le port 3000
EXPOSE 3000

# Lancer Next.js en mode production
CMD ["npx", "next", "start"]

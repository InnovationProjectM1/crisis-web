# Utiliser l'image Node.js alpine
FROM node:16-alpine

# Définir le répertoire de travail dans le container
WORKDIR /app

# Copier les fichiers nécessaires depuis le répertoire local du projet
COPY .next/standalone .next/standalone
COPY public public
COPY .next/static .next/static

# Exposer le port 3000 pour l'application
EXPOSE 3000

RUN cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/

CMD ["node", ".next/standalone/server.js"]

FROM node:23-alpine


COPY  /.next/standalone /.next/standalone
COPY  /public /public
COPY  .next/static .next/static

EXPOSE 3000

CMD ["node", "server.js"]

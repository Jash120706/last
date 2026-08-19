# =====================================================
# STAGE 1: Build React Client
# =====================================================

FROM node:22 AS client-build

WORKDIR /app

COPY client/package*.json ./client/

RUN cd client && npm install

COPY client ./client

RUN cd client && npm run build


# =====================================================
# STAGE 2: Production Server
# =====================================================

FROM node:22-slim

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install production dependencies
RUN cd server && npm install --omit=dev

# Copy server source
COPY server ./server

# Copy React production build
COPY --from=client-build /app/client/dist ./client/dist

# =====================================================
# ENVIRONMENT
# =====================================================

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# =====================================================
# START SERVER
# =====================================================

WORKDIR /app/server

CMD ["node", "server.js"]

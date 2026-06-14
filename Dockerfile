# ========================
# Stage 1: Build
# ========================
FROM node:20-alpine AS builder

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app
RUN yarn build

# ========================
# Stage 2: Production
# ========================
FROM node:20-alpine AS production

# Install OpenSSL (required by Prisma at runtime)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install ALL dependencies (not just production)
# because @nestjs/config and others are in devDependencies
RUN yarn install --frozen-lockfile && yarn cache clean

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy prisma schema (needed for migrations at runtime)
COPY prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]
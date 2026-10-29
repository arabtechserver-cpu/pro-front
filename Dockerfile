FROM node:22-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Build Next.js
ARG NEXT_PUBLIC_API_URL="https://arabtechproserver.tech"
ARG NEXT_PUBLIC_SITE_URL="https://arabtechproserver.tech"
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID="BAAbEQaWk1wH9kFIGVcnl3bBqttl4pQAzD_bnhnYtI25cmXaUTI-M78p7c7nS7gm7tkA9K8OJs-rViTBrw"
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID="540676912586-vifo9ogu2gjud3d00efv1khd9r7tcajb.apps.googleusercontent.com"
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAEjTl6tGMYdu0R-z"
ARG NEXT_PUBLIC_HERO_VIDEO_URL="https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Step 2. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-semi-space-size=2"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

FROM node:lts-alpine as builder
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN npm run build
FROM httpd:alpine

# Copy built React app to Apache's public directory
COPY --from=builder /app/build/ /usr/local/apache2/htdocs/

# Expose default Apache port
EXPOSE 80


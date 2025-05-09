# -------- Stage 1: Build React App --------
    FROM node:lts-alpine as builder
    ENV NODE_ENV=production
    
    WORKDIR /usr/src/app
    
    # Install dependencies
    COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
    RUN npm install --production --silent
    
    # Copy the full app and build it with increased memory
    COPY . .
    RUN NODE_OPTIONS="--max-old-space-size=6144" npm run build
    
    # -------- Stage 2: Serve with Apache --------
    FROM httpd:alpine
    
    # Copy the React build to Apache htdocs
    COPY --from=builder /usr/src/app/build/ /usr/local/apache2/htdocs/
    
    # Expose Apache port
    EXPOSE 80
    
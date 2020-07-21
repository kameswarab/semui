### STAGE 1: Build ###
FROM mumchrep01:8082/node:12.13.1-alpine AS build
RUN npm config set proxy http://mumchrep01:8081 && \
    npm config set https-proxy http://mumchrep01:8081 && \
	npm config set registry=http://mumchrep01:8081/repository/npm-group/
	
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
### STAGE 2: Run ###
FROM mumchrep01:8082/nginx:alpine
COPY --from=build /usr/src/app/build/www /usr/share/nginx/html
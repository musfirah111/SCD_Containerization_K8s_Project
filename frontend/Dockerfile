FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

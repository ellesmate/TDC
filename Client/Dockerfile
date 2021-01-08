# FROM node:alpine as build
# WORKDIR /app

# RUN npm install -g @angular/cli

# COPY ./package.json .
# RUN npm install
# COPY . .
# RUN ng build --prod

# FROM nginx as runtime
# RUN rm /usr/share/nginx/html/index.html
# COPY --from=build /app/dist /usr/share/nginx/html
# RUN mv /usr/share/nginx/html/teux-deux-clone/index.html /usr/share/nginx/html/teux-deux-clone/index1.html
# COPY /usr/share/nginx/html/teux-deux-clone /usr/share/nginx/html

FROM node:12.7-alpine as build
WORKDIR /app

RUN npm install -g @angular/cli

COPY package.json ./
RUN npm install
COPY . .
# RUN npm run build --prod
RUN ng build --prod

FROM nginx:1.17.1-alpine as prod-stage
COPY --from=build /app/dist/teux-deux-clone /usr/share/nginx/html
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# FROM node:alpine as builder

# WORKDIR /app
# COPY package.json package-lock.json ./
# ENV CI=1
# RUN npm ci

# COPY . .
# RUN npm run build -- --prod --output-path=/dist

# # 2. Deploy our Angular app to NGINX
# FROM nginx:alpine

# ## Replace the default nginx index page with our Angular app
# RUN rm -rf /usr/share/nginx/html/*
# COPY --from=builder /dist /usr/share/nginx/html

# COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

# ENTRYPOINT ["nginx", "-g", "daemon off;"]
FROM node:8-alpine as builder
WORKDIR /app
COPY devops/web/package.json .
COPY src ./src
COPY devops/web/.babelrc .
COPY devops/web/config-web.js ./config.js
RUN npm install
COPY webpack.config.js .
RUN npm run build

FROM nginx
COPY --from=builder /app/build/* /usr/share/nginx/html/ui/
# redirect the root domain to /ui
COPY devops/web/index.html /usr/share/nginx/html/
COPY devops/web/default.conf /etc/nginx/conf.d/
EXPOSE 80

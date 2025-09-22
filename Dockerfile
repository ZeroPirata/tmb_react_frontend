FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ⚡ As variáveis REACT_APP_* precisam estar no ambiente aqui
ARG REACT_APP_SIGNALR_HUB_URL
ARG REACT_APP_HEALTH_URL
ARG REACT_APP_TBM_API_URL
ENV REACT_APP_SIGNALR_HUB_URL=$REACT_APP_SIGNALR_HUB_URL
ENV REACT_APP_HEALTH_URL=$REACT_APP_HEALTH_URL
ENV REACT_APP_TBM_API_URL=$REACT_APP_TBM_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS final

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

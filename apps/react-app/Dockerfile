# syntax=docker/dockerfile:1
FROM nginx:alpine
ENV CLOUDINARY_URL=''
ENV CLOUDINARY_API_KEY=''
ENV API_URL=''
ENV RTC_URL=''
ENV WS_URL=''
WORKDIR /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY /apps/react-app/dist .
COPY --chmod=0755 /apps/react-app/*.sh /opt/
RUN rm -rf /etc/nginx/nginx.conf
COPY /apps/react-app/docker/nginx.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
CMD [ "nginx", "-g", "daemon off;" ]
ENTRYPOINT ["/opt/entrypoint.sh"]
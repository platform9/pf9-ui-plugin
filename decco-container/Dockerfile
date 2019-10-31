FROM nginx
MAINTAINER leb@platform9.com

RUN apt -y update
RUN apt -y install openssl ca-certificates

# Copy all the RPM files into the container
RUN mkdir -p /usr/share/nginx/html
COPY publicfiles /usr/share/nginx/html/

# configure nginx and confd
COPY conf/nginx /etc/nginx/
COPY conf/confd /etc/confd/

WORKDIR /root
COPY init-region .
COPY start.sh .
RUN chmod 755 init-region
COPY consul /bin
COPY confd /bin

CMD /root/start.sh

EXPOSE 8080

LABEL com.platform9.image-type=du
ARG VERSION
LABEL com.platform9.pf9_version=${VERSION}
ARG BUILD_ID
LABEL com.platform9.build=${BUILD_ID}
LABEL com.platform9.version="${VERSION}-${BUILD_ID}"
ARG BRANCH
LABEL com.platform9.branch=${BRANCH}
ARG APP_METADATA
LABEL com.platform9.app_metadata=${APP_METADATA}

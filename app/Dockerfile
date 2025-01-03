FROM --platform=linux/amd64 node:22

# Create app directory
WORKDIR /usr/src/app

COPY . .

#RUN npm install -g npm@latest
#RUN npm install --prefix=app

EXPOSE 3000

ENTRYPOINT ["/usr/src/app/script.sh"]

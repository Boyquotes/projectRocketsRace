FROM --platform=linux/amd64 node:22

# Create app directory
WORKDIR /usr/src/app

COPY . .

#RUN npm install -g npm@latest
#RUN npm install --prefix=dashboard
# If you are building your code for production
# RUN npm ci --only=production


EXPOSE 3000

#CMD ["tail", "-f", "/dev/null"]
#WORKDIR /usr/src/app/dashboard
#ENTRYPOINT ["/bin/bash", "/usr/src/app/entrypoint.sh"]
#CMD ["npm", "start-dashboard"]
#CMD node --watch socket-server.js

ENTRYPOINT ["/usr/src/app/script.sh"]

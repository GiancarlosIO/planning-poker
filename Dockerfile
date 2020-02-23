# The instructions for the first stage
# using multi stages https://docs.docker.com/develop/develop-images/multistage-build/
FROM node:12.16.1-alpine3.9 as builder

# docker build --build-arg	 NODE_ENV=production
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN apk --no-cache add python make g++
RUN apk add --update --no-cache postgresql-client
RUN apk add --update --no-cache --virtual .tmp-build-deps \
      gcc libc-dev linux-headers postgresql-dev

# Copy your package.json and package-lock.json before you copy your code into the container.
# Docker will cache installed node_modules as a separate layer, then, if you change your app code and execute the build command,
# the node_modules will not be installed again if you did not change package.json#========================= FRONTEND ========================================#
#========================= BACKEND ========================================#
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm install

#========================= FRONTEND ========================================#
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm install
RUN npm run build

# The instructions for second stage
FROM node:12.16.1-alpine3.9

# In some articles you will see that people do mkdir /app and then set it as workdir,
# but this is not best practice. Use a pre-existing folder/usr/src/app that is better suited for this.
# - setup the frontend -#
WORKDIR /usr/src/app/frontend
COPY --from=builder /usr/src/app/frontend/node_modules node_modules
COPY frontend .

WORKDIR /usr/src/app/backend
COPY --from=builder /usr/src/app/backend/node_modules node_modules
COPY backend .

# EXPOSE 4000

CMD ["npm", "run", "start:prod"]


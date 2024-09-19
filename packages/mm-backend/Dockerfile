# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install app dependencies
RUN npm i -g pnpm
RUN npm i -g @nestjs/cli
RUN pnpm install

# Creates a "dist" folder with the production build
WORKDIR /usr/src/app/packages/mm-backend
RUN pnpm build


# Start the server using the production build
WORKDIR /usr/src/app
CMD [ "node", "dist/src/main.js" ]

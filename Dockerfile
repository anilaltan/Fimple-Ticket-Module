FROM node:16-alpine

RUN addgroup --g 2000 fimple \
  && adduser \
  --uid 1001 \
  --ingroup fimple \
  --disabled-password \
  --home /app \
  --gecos '' app \
  && chown -R app:fimple /app 

USER app
WORKDIR /app
COPY --chown=app:fimple . .

ARG CURRENT_VERSION="dev"
ARG COMMIT_ID="dev"

ENV CURRENT_VERSION=${CURRENT_VERSION}
ENV COMMIT_ID=${COMMIT_ID}
ENV WEB_DOMAIN=__WEB_DOMAIN__

RUN echo ${CURRENT_VERSION}
RUN echo ${COMMIT_ID}

RUN sed -i -r "s/CURRENT_VERSION=\"dev\"/CURRENT_VERSION=\"${CURRENT_VERSION}\"/g" /app/.env
RUN sed -i -r "s/COMMIT_ID=\"dev\"/COMMIT_ID=\"${COMMIT_ID}\"/g" /app/.env
RUN sed -i -r "s/WEB_DOMAIN=\"https:\/\/dev.fimple.co.uk\"/WEB_DOMAIN=\"${WEB_DOMAIN}\"/g" /app/.env
RUN cat /app/.env

# RUN apk add g++ make py3-pip

RUN yarn install --legacy-peer-deps

# RUN REACT_APP_PROXY_DOMAIN=__REACT_APP_PROXY_DOMAIN__ \
#     REACT_APP_TENANT_KEY=__REACT_APP_TENANT_KEY__ \
#     REACT_APP_KEYCLOAK_DOMAIN=__REACT_APP_KEYCLOAK_DOMAIN__ \
#     REACT_APP_N8N_HOST_URL=__REACT_APP_N8N_HOST_URL__ \
#     yarn build
RUN yarn build
# RUN if [[ "$CURRENT_VERSION" =~ "^dev" ]]; then echo "build" && yarn build ; else echo "build:release" &&yarn build:release ; fi

# RUN yarn global add http-server
#RUN yarn clean:node
# RUN mv component/storybook-static component/dist


EXPOSE 8080

USER app
RUN yarn add http-server -W
CMD chmod +x ./entrypoint.sh; sync; ./entrypoint.sh; sync; yarn http-server ${MODULENAME}/dist -p 8080

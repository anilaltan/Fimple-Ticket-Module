# Fimple Web Project

v1

## _Simple and Composable Financial Platform With the “Financial Function As A Service” Principle_

## Prerequisites

- node version ^17.9.0
- yarn version ^1.22.18
- nvm version ^0.39.1 optional for managing node version

## Start and Run

In root directory,

```
`yarn` -- Install dependencies
`yarn start` -- Starts the Container(host) and all Micro Frontends with lerna
```

Navigate to _http://localhost:50000_ to start the container

## Manuel Installation

```
`yarn` -- Install dependencies
`cd saga` -- container micro frontend directory
`npm start` --  Starts the container micro frontend
```

_Web Docerizetion in local_

```
`docker build -t fi-web-base  -f Dockerfile .` -- create fi-web-base image
`docker-compose -f docker-compose.yaml up` -- build and run web docker containers
```

_Storybook Docerizetion in local_

```
`docker build -t fi-storybook-web  -f component/Dockerfile .` -- create fi-storybook-web image
`docker-compose -f docker-compose.storybook.yaml up` -- build and run storybook container
```

## Projects

| Name       | Port  |
| ---------- | ----- |
| dashboard  | 50002 |
| metadata   | 50005 |
| loan       | 50006 |
| customer   | 50007 |
| accounting | 50008 |
| deposit    | 50009 |
| saga       | 50010 |
| component  | 50011 |
| catalog    | 50012 |
| fx         | 50013 |

## New Module Creation

```shell
yarn generate-module mymodule
```

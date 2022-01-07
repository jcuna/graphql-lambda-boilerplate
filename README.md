# GraphQL for AWS Lambda Boilerplate code

[![build](https://github.com/jcuna/graphql-lambda-boilerplate/actions/workflows/tests.yml/badge.svg)](https://github.com/jcuna/graphql-lambda-boilerplate/actions/workflows/tests.yml)
[![coverage](https://byob.yarr.is/jcuna/graphql-lambda-boilerplate/coverage/main/graphql-lambda-boilerplate/coverage.json)](https://github.com/jcuna/graphql-lambda-boilerplate/actions/workflows/tests.yml)


Use this repo to get started on developing a GraphQL API that can be easily developed locally, and ready to be deployed to AWS Lambda Behind ApiGateway.
ApiGateway's V1 payload is not supported, so ensure that ApiGateway's payload is set to V2.
Containes two generic examples to create entities and resolvers as well as tests.

Stack:
1. Typescript/Node
2. TypeORM
4. ApolloServer
6. GraphiQL browser IDE
5. Jest test framework
3. PostgreSQL 13.4 For RDS compatibility
7. Docker for dev environment
8. Bash/zsh for dev environment

*This project requires you to download Docker v18 and up for out of the box local development.
Everything is abstracted out so you can be up and running with simple commands.*

*Dev environment has full support for Linux and MacOS. Windows will not work out of the box*

A local database is automatically setup and env variables to access it will be provided via the following variables
```node
process.env.PG_HOST
process.env.PG_ROOT_USER
process.env.PG_ROOT_PASSWORD
process.env.PG_DATABASE
```

### Commands for running and testing application

| **command**          | **description**                                                                      |
|  ------------------  |-----------------------------------------------------                                 |
| `./service help`       | get a list of all available commands                                                 |
| `./service`            | Runs the main handler with watch                                                     |
| `./service shell`      | Logs you into the app environment where you can run multiple npm commands and tests  |
| `./service stop`       | Stops and removes dependencies                                                       |
| `./service test`       | Runs tests                                                                           |
| `./service test-cov`   | Runs test with coverage                                                              |
| `./service stop`       | Stops and removes dependencies                                                       |

### NPM Commands

#### in case you want to run all npm commands yourself, you can run `./service shell` instead and manually execute them

* npm run start <> starts the development server in files watch mode
* npm run watch <> watches for files with dev server down
* npm run build <> builds and exits
* npm run test <> runs tests
* npm run test -- --coverage <> runs tests with coverage
* npm run lint <> tries to automatically fix any eslint errors

* TypeOrm, Type GraphQL and Jest documentation
    * typegrapql: https://typegraphql.com/docs/getting-started.html
    * typeorm: https://typeorm.io/#/
    * testing: https://jestjs.io/docs/getting-started
* GraphiQL interactive GraphQL interface provided by: https://github.com/graphql/graphiql

Edit `src/.eslintrc.js` for different code quality checks and style


### GitHub Action
There's a GitHub action that runs tests and test coverage and publishes results to a badge.
You'll have to change the `PATH` variable in `.github/workflows/tests.yml` to your own forked repo
After you fork this repo, You'll also have to update the README file and point your badges to the appropriate paths.
*Custom badge feature provided by https://github.com/RubbaBoy/BYOB* 


# Gotchas
1. First time you run `./service`, it will take a while to load up as it needs to download and build docker images as well as install node_modules
2. To run tests alongside the watch/server running, open a second terminal tab, do `./servive test` or `./service test-cov`
3. Use Chrome for GraphQL IDE, portainer, and Traefik UIs.
4. Follow directions printed on terminal upon running `./service` commands
5. If you want to see test coverage on your browser, run `./service test-cov` then navigate to `src/tests/coverage/lcov-report` and open index.html on browser

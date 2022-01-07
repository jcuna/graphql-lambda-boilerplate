const http = require('http')
const lambda = require('../src/out/handler.js')
const fs = require('fs')

const server = http.createServer((request, response) => {
    let headers = {'Content-Type': 'application/json'}
    if (request.method === 'POST') {
        let body = ''
        request.on('data', (data) => {
            body += data
        })
        request.on('end', () => {
            const d = new Date()
            lambda.handler({
                ...event,
                routeKey: `${request.method} ${request.url}`,
                headers: {...request.headers},
                body: Buffer.from(body).toString('base64'),
                requestContext: {
                    ...event.requestContext,
                    identify: {...event.requestContext.identity, sourceIp: request.connection.remoteAddress}
                }
            }).then(handler_response => {
                response.writeHead(handler_response.statusCode, {...headers, ...handler_response.headers})
                response.end(handler_response.body)
            }).catch(e => {
                console.error(e)
                response.writeHead(500, headers)
                response.end(JSON.stringify({error: e.message, trace: e.stack}))
            })
        })
    } else {
        let code = 200
        headers = {'Content-Type': 'text/html'}
        fs.readFile(__dirname + '/graphiql.html', 'utf-8', (err, data) => {
            if (err) {
                console.error(err)
                code = 500
                data = err.message
            }
            response.writeHead(code, headers)
            response.end(data)
        })
    }
})

const port = 3000
const host = '0.0.0.0'
server.listen(port, host)
console.log(`GraphiQL Interactive IDE at ${process.env.ENDPOINT}`)
console.log(`Portainer is at ${process.env.PORTAINER}`)
console.log(`Traefik is at ${process.env.TRAEFIK}`)
console.log('Ctrl+C to stop dev server')
console.log('Run dev server manually with `npm run start`')

const event = {
    version: "2.0",
    routeKey: "",
    rawPath: "/submit",
    rawQueryString: "",
    headers: {},
    body: "",
    isBase64Encoded: true,
    httpMethod: 'POST',
    path: '/',
    pathParameters: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    stageVariables: {},
    resource: '/',
    multiValueHeaders: {},
    requestContext: {
        http: {
            method: 'POST'
        },
        authorizer: null,
        connectedAt: 0,
        protocol: 'HTTPS',
        httpMethod: 'POST',
        path: '/',
        requestTimeEpoch: 0,
        resourceId: '1223',
        resourcePath: '/',
        accountId: '123',
        apiId: '12',
        domainName: '',
        domainPrefix: '',
        identity: {
            accessKey: '',
            accountId: '',
            apiKey: '',
            apiKeyId: '',
            caller: '',
            clientCert: null,
            cognitoAuthenticationProvider: '',
            cognitoAuthenticationType: '',
            cognitoIdentityId: '',
            cognitoIdentityPoolId: '',
            principalOrgId: '',
            sourceIp: '172.3.65.66',
            user: '',
            userArn: '',
            userAgent: 'Test/Fixture 2.0'
        },
        requestId: '',
        routeKey: 'POST ',
        stage: 'dev'
    }
}

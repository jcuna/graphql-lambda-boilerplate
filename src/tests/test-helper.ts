import {SqliteConnectionOptions} from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import {createConnection} from 'typeorm'
import {DocumentNode} from 'graphql'
import {buildSchema} from 'type-graphql'
import {ApolloServer, gql} from 'apollo-server-lambda'
import {GraphQLResponse} from 'apollo-server-types'
import {Connection} from 'typeorm/connection/Connection'

export const getConnection = async (): Promise<Connection> => {
    const options: SqliteConnectionOptions = {
        type: 'sqlite',
        synchronize: true,
        database: ':memory:',
        dropSchema: true,
        logging: false,
        entities: [__dirname + '/../entities/*.{ts,js}']
    }
    return createConnection(options)
}

export const graphqlRequest = async (query: DocumentNode, variables = {}): Promise<GraphQLResponse> => {

    const schema = await buildSchema({
        resolvers: [__dirname + '/../resolvers/*.{ts,js}'],
        emitSchemaFile: false,
    })

    const server = new ApolloServer({schema})

    return await server.executeOperation({query, variables})
}

export const newSite = async (name: string, domain: string): Promise<GraphQLResponse> => {
    const query = gql`
        mutation newSite($name: String!, $domain: String!, $clientAccount: Float!) {
            addSite (newSite: {
                name: $name,
                domain: $domain,
                client_site: true
                client_account: $clientAccount

            }) {
                id
                name
                domain
                client_site
                client_account
                created_at
                updated_at
                active
            }
        }
    `
    return await graphqlRequest(query, {name, domain, clientAccount: Math.floor(Math.random() * 10000)})
}

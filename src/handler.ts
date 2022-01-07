import 'reflect-metadata'
import {ApolloServer} from 'apollo-server-lambda'
import {buildSchema} from 'type-graphql'
import {getConnectionManager} from 'typeorm'
import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions'
import {Connection} from 'typeorm/connection/Connection'
import {APIGatewayProxyEventBase, Context} from 'aws-lambda'

const DEFAULT_CONNECTION = 'default'

const initDb = async (synchronize: boolean, migrate: boolean): Promise<Connection> => {

    const connectionManager = getConnectionManager()

    if (connectionManager.has(DEFAULT_CONNECTION)) {
        if (synchronize || migrate) {
            await connectionManager.get().close()
        } else {
            return connectionManager.get()
        }
    }
    console.log('Creating a new database connection')
    // for dev purposes, sometimes we may want to drop schema when we make drastic changes without using migrations
    // to do that, add the following line `dropSchema: true,` make one request, and remove the line.
    // KEEP IN MIND!!! the above will delete all data
    const options: PostgresConnectionOptions = {
        type: 'postgres',
        synchronize: process.env.NODE_ENV !== 'production' || synchronize,
        migrationsRun: migrate,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        username: process.env.PG_ROOT_USER,
        password: process.env.PG_ROOT_PASSWORD,
        entities: [__dirname + '/entities/*.{ts,js}']
    }
    const connection = await connectionManager.create(options)
    await connection.connect()
    console.log(`Ran migrations: ${String(migrate)}`)
    console.log(`Synchronized DB: ${String(process.env.NODE_ENV !== 'production' || synchronize)}`)
    return connection
}

export const handler = async (event: APIGatewayProxyEventBase<unknown>, context: Context): Promise<unknown> => {
    const [sync, migrate] = [event.hasOwnProperty('synchronize'), event.hasOwnProperty('migrate')]

    await initDb(sync, migrate)
    if (sync || migrate) {
        console.log('Finished console run')
        return {}
    }

    const schema = await buildSchema({
        resolvers: [__dirname + '/resolvers/*.{ts,js}'],
        emitSchemaFile: typeof process.env.LOCAL_ENV !== 'undefined'
    })

    const server = new ApolloServer({schema})
    const apollo = server.createHandler()
    return apollo(event, context, (error, result) => {
        return () => (error ? error : result)
    })
}

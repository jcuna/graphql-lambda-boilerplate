import {gql} from 'apollo-server-lambda'
import {getConnection, graphqlRequest} from './test-helper'

let connection
beforeAll(async () => {
    connection = await getConnection()
})

afterAll(() => {
    connection.close()
})

test('We can add a new site', async () => {
    const query = gql`
        mutation newSite($name: String!, $domain: String!) {
            addSite (newSite: {
                name: $name,
                domain: $domain,
                client_site: true
                client_account: 12333

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
    const resp = await graphqlRequest(query, {name: 'test site', domain: 'sub.tests.graphql'})
    expect(resp.data.addSite).toHaveProperty('id')
    expect(resp.data.addSite).toHaveProperty('name')
    expect(resp.data.addSite).toHaveProperty('domain')
    expect(resp.data.addSite).toHaveProperty('client_site')
    expect(resp.data.addSite).toHaveProperty('client_account')
    expect(resp.data.addSite).toHaveProperty('created_at')
    expect(resp.data.addSite).toHaveProperty('updated_at')
    expect(resp.data.addSite).toHaveProperty('active')

    expect(resp.data.addSite.id).not.toBeNaN()
    const d = new Date()
    expect(resp.data.addSite.created_at).toContain(d.toISOString().split('T')[0])
    expect(resp.data.addSite.updated_at).toContain(d.toISOString().split('T')[0])

    expect(resp.data.addSite.name).toEqual('test site')
    expect(resp.data.addSite.domain).toEqual('sub.tests.graphql')
    expect(resp.data.addSite.client_account).toEqual(12333)
    expect(resp.data.addSite.client_site).toBeTruthy()
    expect(resp.data.addSite.active).toBeFalsy()

    // create another site to test sites query later
    await graphqlRequest(query, {name: 'test site2', domain: 'sub2.tests.graphql'})
})

test('We cannot create a site with duplicate domain', async () => {
    const query = gql`
        mutation newSite($name: String!, $domain: String!) {
            addSite (newSite: {
                name: $name,
                domain: $domain,
                client_site: true
                client_account: 12333

            }) {
                id
            }
        }
    `
    const resp = await graphqlRequest(query, {name: 'test site', domain: 'sub.tests.graphql'})
    expect(resp.data).toBeNull()
    expect(resp.errors[0].message.toLowerCase()).toContain('unique constrain')
})

test('We can query a site with selected properties', async () => {

    const query = gql`
        query {
            site (id: 1) {
                id
                name
                domain
                client_site
                client_account
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.site).toHaveProperty('id')
    expect(resp.data.site).toHaveProperty('name')
    expect(resp.data.site).toHaveProperty('domain')
    expect(resp.data.site).toHaveProperty('client_site')
    expect(resp.data.site).toHaveProperty('client_account')

    expect(resp.data.site).not.toHaveProperty('created_at')
    expect(resp.data.site).not.toHaveProperty('updated_at')
    expect(resp.data.site).not.toHaveProperty('active')

    expect(resp.data.site.id).not.toBeNaN()

    expect(resp.data.site.name).toEqual('test site')
    expect(resp.data.site.domain).toEqual('sub.tests.graphql')
    expect(resp.data.site.client_account).toEqual(12333)
    expect(resp.data.site.client_site).toBeTruthy()
})

test('We get proper response for non existing site', async () => {

    const query = gql`
        query {
            site (id: 1000) {
                id
                name
                domain
                client_site
                client_account
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.errors[0].message).toEqual('Site not found')
})

test('We can query multiple sites', async () => {

    const query = gql`
        query {
            sites {
                id
                name
                domain
                created_at
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.sites.length).toBe(2)
    expect(resp.data.sites[0]).toHaveProperty('id')
    expect(resp.data.sites[0]).toHaveProperty('name')
    expect(resp.data.sites[0]).toHaveProperty('domain')
    expect(resp.data.sites[0]).toHaveProperty('created_at')

    expect(resp.data.sites[1]).toHaveProperty('id')
    expect(resp.data.sites[1]).toHaveProperty('name')
    expect(resp.data.sites[1]).toHaveProperty('domain')
    expect(resp.data.sites[1]).toHaveProperty('created_at')

})

test('We can query multiple sites, skip and take', async () => {

    const query = gql`
        query {
            sites(take:1) {
                id
                name
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.sites.length).toBe(1)
    expect(resp.data.sites[0]).toHaveProperty('id')
    expect(resp.data.sites[0]).toHaveProperty('name')
    expect(resp.data.sites[0].name).toEqual('test site')

    const query2 = gql`
        query {
            sites(skip:1, take: 1) {
                id
                name
            }
        }
    `
    const resp2 = await graphqlRequest(query2)
    expect(resp2.data.sites.length).toBe(1)
    expect(resp2.data.sites[0]).toHaveProperty('id')
    expect(resp2.data.sites[0]).toHaveProperty('name')
    expect(resp2.data.sites[0].name).toEqual('test site2')

})

test('We can update a site', async () => {

    const query = gql`
        mutation {
            updateSite (id: 1, data: {client_site: false, name: "A shiny new name"}) {
                id
                name
                client_site
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.updateSite).toHaveProperty('id')
    expect(resp.data.updateSite).toHaveProperty('name')
    expect(resp.data.updateSite).toHaveProperty('client_site')

    expect(resp.data.updateSite).not.toHaveProperty('domain')
    expect(resp.data.updateSite).not.toHaveProperty('client_account')
    expect(resp.data.updateSite).not.toHaveProperty('created_at')
    expect(resp.data.updateSite).not.toHaveProperty('updated_at')
    expect(resp.data.updateSite).not.toHaveProperty('active')

    expect(resp.data.updateSite.id).not.toBeNaN()
    expect(resp.data.updateSite.name).toEqual('A shiny new name')
    expect(resp.data.updateSite.client_site).toBeFalsy()
})

test('We can delete a site', async () => {

    const query = gql`
        mutation {
            removeSite (id: 1)
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.removeSite).toBeTruthy()
})

test('We cannot delete the same site twice', async () => {

    const query = gql`
        mutation {
            removeSite (id: 1)
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.removeSite).toBeFalsy()
})

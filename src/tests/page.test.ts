import {gql} from 'apollo-server-lambda'
import {getConnection, graphqlRequest, newSite} from './test-helper'

let connection
beforeAll(async () => {
    connection = await getConnection()
})

afterAll(() => {
    connection.close()
})


test('We can add a new page to a site', async () => {
    const site = await newSite('Test Site 2', 'graphql.test.none')
    const query = gql`
        mutation newPage($name: String!, $siteId: Float!) {
            addPage (newPage: {
                name: $name,
                exclude_from_sitemap: false,
                site_id: $siteId
            }) {
                id
                site_id
                name
                created_at
                updated_at
                exclude_from_sitemap
                source_page_id
                site {
                    domain
                }
            }
        }
    `
    const resp = await graphqlRequest(query, {name: 'Homepage', siteId: Number(site.data.addSite.id)})
    expect(resp.data.addPage).toHaveProperty('id')
    expect(resp.data.addPage).toHaveProperty('name')
    expect(resp.data.addPage).toHaveProperty('site_id')
    expect(resp.data.addPage).toHaveProperty('created_at')
    expect(resp.data.addPage).toHaveProperty('updated_at')
    expect(resp.data.addPage).toHaveProperty('exclude_from_sitemap')
    expect(resp.data.addPage).toHaveProperty('source_page_id')
    expect(resp.data.addPage).toHaveProperty('site')

    expect(resp.data.addPage.id).not.toBeNaN()
    const d = new Date()
    expect(resp.data.addPage.created_at).toContain(d.toISOString().split('T')[0])
    expect(resp.data.addPage.updated_at).toContain(d.toISOString().split('T')[0])

    expect(resp.data.addPage.name).toEqual('Homepage')
    expect(resp.data.addPage.site_id).toEqual(1)
    expect(resp.data.addPage.exclude_from_sitemap).toBeFalsy()
    expect(resp.data.addPage.source_page_id).toBeNull()

    expect(resp.data.addPage.site).toMatchObject({domain: 'graphql.test.none'})

    // for later testing of querying multiple pages
    await graphqlRequest(query, {name: 'Contact', siteId: Number(site.data.addSite.id)})
})

test('We cannot add a new page without a site_id', async () => {
    // noinspection GraphQLUnexpectedType
    const query = gql`
        mutation newPage($name: String!) {
            addPage (newPage: {
                name: $name,
                exclude_from_sitemap: false,
            }) {
                id
            }
        }
    `
    const resp = await graphqlRequest(query, {name: 'Homepage'})
    expect(resp.data).toBeUndefined()
    expect(resp.errors[0].message).toMatch(/site_id.*was not provided/i)

})

test('we can query a page with selected properties', async () => {
    const query = gql`
        query page {
            page(id: 1) {
                id,
                source_page_id,
                name
                site {
                    domain
                }
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.page).toHaveProperty('id')
    expect(resp.data.page).toHaveProperty('source_page_id')
    expect(resp.data.page).toHaveProperty('name')
    expect(resp.data.page).toHaveProperty('site')

    expect(resp.data.page.id).not.toBeNaN()
    expect(resp.data.page.source_page_id).toBeNull()
    expect(resp.data.page.name).toEqual('Homepage')
    expect(resp.data.page.site).toMatchObject({domain: 'graphql.test.none'})

})

test('we get proper response for non existing page', async () => {
    const query = gql`
        query page {
            page(id: 1000) {
                id,
                source_page_id,
                name
                site {
                    domain
                }
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.errors[0].message).toEqual('Page not found')

})

test('we can query multiple pages', async () => {
    const query = gql`
        query pages {
            pages(site_id: 1) {
                name
                source_page_id
                exclude_from_sitemap
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.pages.length).toBe(2)

    expect(resp.data.pages[0]).toMatchObject({
        name: 'Homepage',
        source_page_id: null,
        exclude_from_sitemap: false
    })

    expect(resp.data.pages[1]).toMatchObject({
        name: 'Contact',
        source_page_id: null,
        exclude_from_sitemap: false
    })
})

test('we can query multiple pages, skip and take', async () => {
    const query = gql`
        query pages {
            pages(site_id: 1, take: 1) {
                id
                name
            }
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.pages.length).toBe(1)

    expect(resp.data.pages[0]).toMatchObject({
        id: '1',
        name: 'Homepage',
    })

    const query2 = gql`
        query pages {
            pages(site_id: 1, skip: 1, take: 1) {
                id
                name
            }
        }
    `
    const resp2 = await graphqlRequest(query2)
    expect(resp2.data.pages.length).toBe(1)

    expect(resp2.data.pages[0]).toMatchObject({
        id: '2',
        name: 'Contact',
    })

})


test('we can update a page', async () => {
    const query = gql`
        mutation updatePage {
            updatePage(
                id: 1,
                data: {
                    exclude_from_sitemap: true, name: "Homepage II"
                }) {
                name
                source_page_id
                exclude_from_sitemap
            }
        }
    `
    const resp = await graphqlRequest(query)

    expect(resp.data.updatePage.name).toEqual('Homepage II')
    expect(resp.data.updatePage.source_page_id).toBeNull()
    expect(resp.data.updatePage.exclude_from_sitemap).toBeTruthy()
})

test('we can delete a page', async () => {
    const query = gql`
        mutation removePage {
            removePage(id: 1)
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.removePage).toBeTruthy()
})

test('we cannot delete the same page twice', async () => {
    const query = gql`
        mutation removePage {
            removePage(id: 1)
        }
    `
    const resp = await graphqlRequest(query)
    expect(resp.data.removePage).toBeFalsy()
})

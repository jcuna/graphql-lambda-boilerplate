import {Arg, Args, Mutation, Query, Resolver} from 'type-graphql'
import {Page, PagesArgs, NewPageInput, UpdatePageInput} from '../entities/page'

@Resolver(Page)
export class PageResolver {

    @Query(() => Page)
    async page(@Arg('id') id: number): Promise<Page | undefined> {
        const page = await Page.findOne({where: {id}, relations: ['site']})
        if (!page) throw new Error('Page not found')
        return page
    }

    @Query(() => [Page])
    async pages(@Arg('site_id') site_id: number, @Args() {skip, take}: PagesArgs): Promise<Page[]> {
        return Page.find({where: {site_id}, skip, take})
    }

    @Mutation(() => Page)
    async addPage(@Arg('newPage') newPageData: NewPageInput): Promise<Page | undefined> {
        const page = Page.create(newPageData)
        await page.save()
        return Page.findOne(page.id, {relations: ['site']})
    }

    @Mutation(() => Page)
    async updatePage(@Arg('id') id: number, @Arg('data') data: UpdatePageInput): Promise<Page | undefined> {
        const page = await Page.findOne({where: {id}})
        if (!page) throw new Error('Page not found')
        Object.assign(page, data)
        await page.save()
        return Page.findOne(page.id, {relations: ['site']})
    }

    @Mutation(() => Boolean)
    async removePage(@Arg('id') id: number): Promise<boolean> {
        try {
            const page = await Page.findOne({where: {id}})
            if (!page) throw new Error('Page not found')
            await page.remove()
            return true
        } catch {
            return false
        }
    }
}

import {Arg, Args, Mutation, Query, Resolver} from 'type-graphql'
import {Site, SitesArgs, NewSiteInput, UpdateSiteInput} from '../entities/site'

@Resolver(Site)
export class SiteResolver {

    @Query(() => Site)
    async site(@Arg('id') id: number): Promise<Site | undefined> {
        const site = await Site.findOne({where: {id}, relations: ['pages']})
        if (!site) throw new Error('Site not found')
        return site
    }

    @Query(() => [Site])
    async sites(@Args() {skip, take}: SitesArgs): Promise<Site[]> {
        return Site.find({skip, take})
    }

    @Mutation(() => Site)
    async addSite(@Arg('newSite') newSiteData: NewSiteInput): Promise<Site> {
        const site = Site.create(newSiteData)
        await site.save()
        return site
    }

    @Mutation(() => Site)
    async updateSite(@Arg('id') id: number, @Arg('data') data: UpdateSiteInput): Promise<Site> {
        const site = await Site.findOne({where: {id}})
        if (!site) throw new Error('Site not found')
        Object.assign(site, data)
        await site.save()
        return site
    }

    @Mutation(() => Boolean)
    async removeSite(@Arg('id') id: number): Promise<boolean> {
        try {
            const site = await Site.findOne({where: {id}})
            if (!site) throw new Error('Site not found')
            await site.remove()
            return true
        } catch {
            return false
        }
    }
}

import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne, JoinColumn
} from 'typeorm'
import {ArgsType, Field, ID, InputType, Int, ObjectType} from 'type-graphql'
import {ArrayMaxSize, Length, Max, MaxLength, Min} from 'class-validator'
import {Site} from './site'

@ObjectType()
@Entity()
export class Page extends BaseEntity {

    @PrimaryGeneratedColumn({unsigned: true})
    @Field(() => ID)
    id: number

    @Column({unsigned: true})
    @Index()
    @Field()
    site_id: number

    @Column()
    @Field()
    name: string

    @Column({nullable: true})
    @Field({nullable: true})
    source_page_id?: number

    @Column({default: false})
    @Field()
    exclude_from_sitemap: boolean

    @CreateDateColumn()
    @Field()
    created_at: Date

    @UpdateDateColumn()
    @Field()
    updated_at: Date

    @ManyToOne(() => Site, site => site.pages)
    @JoinColumn({name: 'site_id'})
    @Field(() => Site)
    site: Site
}

@InputType()
export class NewPageInput {
    @Field()
    @MaxLength(56)
    name: string

    @Field()
    site_id: number

    @Field({nullable: true})
    source_page_id?: number

    @Field({nullable: true})
    exclude_from_sitemap?: boolean
}

@InputType()
export class UpdatePageInput {
    @Field({nullable: true})
    @MaxLength(56)
    name: string

    @Field({nullable: true})
    exclude_from_sitemap: boolean
}

@ArgsType()
export class PagesArgs {

    @Field(() => Int)
    @Min(0)
    skip = 0

    @Field(() => Int)
    @Min(1)
    @Max(50)
    take = 25
}

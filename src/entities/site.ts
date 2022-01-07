import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm'
import {ArgsType, Field, ID, InputType, Int, ObjectType} from 'type-graphql'
import {Max, MaxLength, Min} from 'class-validator'
import {Page} from './page'

@ObjectType()
@Entity()
export class Site extends BaseEntity {
    @PrimaryGeneratedColumn({unsigned: true})
    @Field(() => ID)
    id: number

    @Column({unsigned: true})
    @Field()
    client_account: number

    @Column()
    @Field()
    name: string

    @Column({unique: true})
    @Field()
    domain: string

    @Column({nullable: true})
    launch_date: Date

    @Column({default: false})
    @Field()
    active: boolean

    @Column({default: false})
    @Field()
    client_site: boolean

    @CreateDateColumn()
    @Field()
    created_at: Date

    @UpdateDateColumn()
    @Field()
    updated_at: Date

    @OneToMany(() => Page, page => page.site)
    @Field(() => [Page])
    pages: [Page]
}

@InputType()
export class NewSiteInput {
    @Field()
    @MaxLength(40)
    domain: string

    @Field()
    @MaxLength(40)
    name: string

    @Field()
    client_account: number

    @Field({nullable: true})
    launch_date?: Date

    @Field({nullable: true})
    active?: boolean

    @Field()
    client_site?: boolean
}

@InputType()
export class UpdateSiteInput {
    @Field({nullable: true})
    @MaxLength(128)
    domain?: string

    @Field({nullable: true})
    @MaxLength(56)
    name?: string

    @Field({nullable: true})
    launch_date?: Date

    @Field({nullable: true})
    active?: boolean

    @Field({nullable: true})
    client_site?: boolean
}

@ArgsType()
export class SitesArgs {
    @Field(() => Int)
    @Min(0)
    skip = 0

    @Field(() => Int)
    @Min(1)
    @Max(50)
    take = 25
}

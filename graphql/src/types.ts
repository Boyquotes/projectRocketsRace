import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
  JSON: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  startRace: Race;
};


export type MutationStartRaceArgs = {
  rocket1: Scalars['ID'];
  rocket2: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  race?: Maybe<Race>;
  races: Array<Race>;
  rockets: Array<Rocket>;
};


export type QueryRaceArgs = {
  id: Scalars['ID'];
};

export type Race = {
  __typename?: 'Race';
  id: Scalars['ID'];
  rocket1: RocketProgress;
  rocket2: RocketProgress;
  winner?: Maybe<Scalars['ID']>;
};

export type Rocket = {
  __typename?: 'Rocket';
  description: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  name: Scalars['String'];
};

export type RocketProgress = {
  __typename?: 'RocketProgress';
  exploded: Scalars['Boolean'];
  id: Scalars['ID'];
  progress: Scalars['Int'];
};

export type RocketProgressEvent = {
  __typename?: 'RocketProgressEvent';
  exploded: Scalars['Boolean'];
  progress: Scalars['Int'];
  raceId: Scalars['ID'];
  rocketId: Scalars['ID'];
};

export type Subscription = {
  __typename?: 'Subscription';
  rocketProgress: RocketProgressEvent;
};


export type SubscriptionRocketProgressArgs = {
  raceId: Scalars['ID'];
  rocketId: Scalars['ID'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Race: ResolverTypeWrapper<Race>;
  Rocket: ResolverTypeWrapper<Rocket>;
  RocketProgress: ResolverTypeWrapper<RocketProgress>;
  RocketProgressEvent: ResolverTypeWrapper<RocketProgressEvent>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Mutation: {};
  Query: {};
  Race: Race;
  Rocket: Rocket;
  RocketProgress: RocketProgress;
  RocketProgressEvent: RocketProgressEvent;
  String: Scalars['String'];
  Subscription: {};
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  startRace?: Resolver<ResolversTypes['Race'], ParentType, ContextType, RequireFields<MutationStartRaceArgs, 'rocket1' | 'rocket2'>>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  race?: Resolver<Maybe<ResolversTypes['Race']>, ParentType, ContextType, RequireFields<QueryRaceArgs, 'id'>>;
  races?: Resolver<Array<ResolversTypes['Race']>, ParentType, ContextType>;
  rockets?: Resolver<Array<ResolversTypes['Rocket']>, ParentType, ContextType>;
}>;

export type RaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Race'] = ResolversParentTypes['Race']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  rocket1?: Resolver<ResolversTypes['RocketProgress'], ParentType, ContextType>;
  rocket2?: Resolver<ResolversTypes['RocketProgress'], ParentType, ContextType>;
  winner?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RocketResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rocket'] = ResolversParentTypes['Rocket']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RocketProgressResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RocketProgress'] = ResolversParentTypes['RocketProgress']> = ResolversObject<{
  exploded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RocketProgressEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RocketProgressEvent'] = ResolversParentTypes['RocketProgressEvent']> = ResolversObject<{
  exploded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  raceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  rocketId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  rocketProgress?: SubscriptionResolver<ResolversTypes['RocketProgressEvent'], "rocketProgress", ParentType, ContextType, RequireFields<SubscriptionRocketProgressArgs, 'raceId' | 'rocketId'>>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Date?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Race?: RaceResolvers<ContextType>;
  Rocket?: RocketResolvers<ContextType>;
  RocketProgress?: RocketProgressResolvers<ContextType>;
  RocketProgressEvent?: RocketProgressEventResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;


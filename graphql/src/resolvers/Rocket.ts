import { withFilter } from "graphql-subscriptions";
import {QueryResolvers} from "../types";
import { v4 as uuidv4 } from 'uuid';
import RedisDataSource from "../datasources/RedisDataSource";
import { cp } from "fs";

type RaceStatus = {
    id: string
    rocket1: {
        id: string
        progress: number
        exploded: boolean
    }
    rocket2: {
        id: string
        progress: number
        exploded: boolean
    }
}

const queryResolvers: QueryResolvers = {
    Query: {
        rockets: async (_, __, {dataSources}) => {
            return dataSources.rocket.getRockets();
        },
        race: async (_, {id}, {dataSources}) => {
            const race = await dataSources.redis.getJSON(`race:${id}`);

            if(!race) {
                return null
            }

            const winner = getWinner(race)
            return {
                ...race,
                winner
            };
        },
        races: async (_, __, { dataSources }) => {
            const races = await dataSources.redis.getAllRaces();
            return races.map(race => ({
                id: race.id,
                rocket1: {
                    id: race.rocket1.id,
                    image: race.rocket1.image,
                    progress: race.rocket1.progress,
                    exploded: race.rocket1.exploded
                },
                rocket2: {
                    id: race.rocket2.id,
                    image: race.rocket2.image,
                    progress: race.rocket2.progress,
                    exploded: race.rocket2.exploded
                },
                winner: race.winner
            }));
        },
    },
    Mutation: {
        startRace: async (_, {rocket1: rocket1Id, rocket2: rocket2Id}, {dataSources}) => {

            const rockets = await dataSources.rocket.getRockets()
            const rocket1 = rockets.find(rocket => rocket.id === rocket1Id)
            const rocket2 = rockets.find(rocket => rocket.id === rocket2Id)

            if(!rocket1 || !rocket2) {
                throw new Error('Rocket not found')
            }

            const raceId = uuidv4();
            console.log("raceId debug", raceId)
            const raceStatus: RaceStatus = {
                id: raceId,
                rocket1: {
                    id: rocket1.id,
                    progress: 0,
                    exploded: false,
                },
                rocket2: {
                    id: rocket2.id,
                    progress: 0,
                    exploded: false,
                }
            }

            race(dataSources.redis, raceStatus)

            return {
                id: raceId,
                rocket1: raceStatus.rocket1,
                rocket2: raceStatus.rocket2,
                winner: null
            }
        }
    },
    Subscription: {
        rocketProgress: {
            subscribe: withFilter(
                async function* (payload, variables, {dataSources}) {
                    const iterator = dataSources.redis.subscribe('ROCKET_PROGRESS')
                    for await (const rocket of iterator) {
                        yield {
                            rocketProgress: rocket
                        }
                    }

                },
                (payload, variables) => {
                    console.log('payload', payload)
                 return   payload.rocketProgress.raceId === variables.raceId && payload.rocketProgress.rocketId === variables.rocketId
                }
            )
        }
    }
}

const race = async (redis: RedisDataSource, raceStatus: RaceStatus) => {
    let winner = getWinner(raceStatus)
    while(!winner) {
        raceStatus = await raceProgress(redis, raceStatus)
        winner = getWinner(raceStatus)
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 1000))
    }

    redis.setJSON(`race:${raceStatus.id}`, raceStatus)
    return race;
}

const raceProgress = async (redis: RedisDataSource, race: RaceStatus) => {
    const randomExplosion = Math.floor(Math.random() * 40) + 1
    console.log("randomExplosion ", randomExplosion)
    
    race.rocket1.progress += Math.floor(Math.random() * 10) + 1
    race.rocket2.progress += Math.floor(Math.random() * 10) + 1
    console.log(race.id);
    if(randomExplosion === 1) {
        // race.rocket1.exploded = true
        race.rocket1.progress = race.rocket1.progress === 100 ? 99 : race.rocket1.progress
    } else if(randomExplosion === 2) {
        // race.rocket2.exploded = true
        race.rocket2.progress = race.rocket2.progress === 100 ? 99 : race.rocket2.progress
    }


    if(race.rocket1.progress >= 100) {
        race.rocket1.progress = 100
    }

    if(race.rocket2.progress >= 100) {
        race.rocket2.progress = 100
    }

    redis.publish('ROCKET_PROGRESS', {
        raceId: race.id,
        rocketId: race.rocket1.id,
        progress: race.rocket1.progress,
        exploded: race.rocket1.exploded
    })

    redis.publish('ROCKET_PROGRESS', {
        raceId: race.id,
        rocketId: race.rocket2.id,
        progress: race.rocket2.progress,
        exploded: race.rocket2.exploded
    })

    return race;
}

const getWinner = (race: RaceStatus) => {
    if(race.rocket1.progress === 100 && race.rocket1.exploded === false) {
        return race.rocket1.id
    }  else if(race.rocket2.progress === 100 && race.rocket2.exploded === false) {
        return race.rocket2.id
    } else if(race.rocket1.exploded) {
        return race.rocket2.id
    } else if(race.rocket2.exploded) {
        return race.rocket1.id
    }
    return null
}

const resolvers = {
    ...queryResolvers
}

export default resolvers

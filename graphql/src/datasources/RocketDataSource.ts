export default class RocketDataSource {
    getRockets() {
        return [
            { id: '1', name: 'Artemis', description: 'Artemis la fusée qui va sur la lune', image: 'http://localhost:4000/static/fusee-0.png' },
            { id: '2', name: 'Apollo', description: 'Misez sur Apollo, la fusée 2.0', image: 'http://localhost:3000/rocket1.png' },
            { id: '3', name: 'Soyuz', description: 'La fusée qui va sur la station spatiale', image: 'http://graphql/static/fusee-2.png' },
            { id: '4', name: 'Falcon', description: 'La fusée qui va sur Mars', image: 'http://graphql-node/static/fusee-3.png' },
            { id: '5', name: 'Ariane', description: 'Cocorico, une fusée Française', image: 'http://localhost:4000/static/fusee-4.png' },
        ]
    }
}

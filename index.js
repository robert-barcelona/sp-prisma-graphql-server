const resolvers = require('./resolvers')

const {GraphQLServer} = require('graphql-yoga')
const {prisma} = require('./generated/prisma-client')

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
})

server.start(() => console.log('server started and running on http://localhost:4000'))

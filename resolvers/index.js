const {prisma} = require('../generated/prisma-client')



const resolvers = {
  Query: {
    jobs: async (parent, args, ctx, info) => {
      return await prisma.jobs()
    }
  },
  Mutation: {
    addJob: async (parent, args) => {
      console.log(args)
      const job = {
        file: args.file,
        fileCrypt: args.fileCrypt,
        status: 'WAITING',
      }
      return await prisma.createJob(job)
    },
    completeJob: async (parent, { id }) => {
      return await prisma.updateJob({
        where: { id },
        data: { completed: true },
      })
    },
  },

}

module.exports = resolvers

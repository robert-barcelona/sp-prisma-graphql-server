const {prisma} = require('./generated/prisma-client')
const Jimp = require('jimp')

const MAX_JOBS = 3
const IN_PROGRESS = 'IN_PROGRESS'
const WAITING = 'WAITING'

let jobsInProgress = []
let filteredQueue = []

const setJobStatus = async (id, status) => {
  return await prisma.updateJob({
    where: {id},
    data: {status},
  })
}

const getJobs = async () => {
  const queue = await prisma.jobs()
  filteredQueue = queue.filter(job => job.status === WAITING)
  jobsInProgress = queue.filter(job => job.status === IN_PROGRESS) // in case we were interrupted earlier
}

const convertImage = async job => {
  try {
    const path = `uploads/${job.fileCrypt}`
    const file = await Jimp.read(path)
    const fileNameBase = job.fileCrypt.split('.')[0]
    const outputFileName = `output/${fileNameBase}.jpg`
    await file.quality(100).write(outputFileName)
    await setJobStatus(job.id, 'COMPLETED')
  } catch (err) {
    console.error(err);
    await setJobStatus('ERROR')
  }
}

const addJobsToQueue = async () => {
  if (jobsInProgress.length < MAX_JOBS && filteredQueue.length) {
    jobsInProgress.unshift(filteredQueue.shift())
  }
  if (jobsInProgress.length === 0) return

  const job = jobsInProgress[jobsInProgress.length - 1]

  await setJobStatus(job.id, IN_PROGRESS)
  await convertImage(job)
  jobsInProgress.pop()
}

const manageJobs = () => {
  getJobs()
  addJobsToQueue()
}

setInterval(manageJobs, 2000)

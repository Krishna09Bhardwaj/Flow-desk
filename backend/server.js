require('dotenv').config()
const app = require('./src/app')
const prisma = require('./src/config/prisma')

const PORT = process.env.PORT || 5000

prisma.$connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FlowDesk API running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studypathshala'

  // Allow overrides via env or CLI args: node create-admin.js email password name
  const [,, argEmail, argPassword, argName] = process.argv
  const email = process.env.ADMIN_EMAIL || argEmail || 'admin@studypathshala.com'
  const password = process.env.ADMIN_PASSWORD || argPassword || 'Admin@12345'
  const name = process.env.ADMIN_NAME || argName || 'Administrator'

  if (!email || !password) {
    console.error('Missing admin credentials. Provide ADMIN_EMAIL and ADMIN_PASSWORD or pass as CLI args.')
    process.exit(1)
  }

  await mongoose.connect(mongoUri)

  let user = await User.findOne({ email })
  if (user) {
    user.role = 'admin'
    if (argPassword || process.env.ADMIN_PASSWORD) {
      user.password = password // will be hashed by pre-save hook
    }
    if (argName || process.env.ADMIN_NAME) user.name = name
    await user.save()
    console.log(`Updated existing user to admin: ${email}`)
  } else {
    user = new User({ name, email, password, role: 'admin' })
    await user.save()
    console.log(`Created admin user: ${email}`)
  }

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})



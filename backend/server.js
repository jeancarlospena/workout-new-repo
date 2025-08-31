import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import { aj } from './lib/arcjet.js'
// import { sql } from './config/db.js'
import initDB from './models/models.js'
import cookieParser from 'cookie-parser'

// SERVING SERVING SERVING SERVING
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// SERVING SERVING SERVING SERVING

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;
const originUrl = process.env.DEV_ENV === 'development' ? "http://localhost:5174" : process.env.ORIGIN_URL



// MIDDLEWARES
app.use(express.json())
app.use(cors({
  origin: originUrl, // or your frontend URL
  credentials: true// allow cookies to be sent
}));
app.use(cookieParser())
// app.use(cors({ credentials: true }))
app.use(helmet())
app.use(morgan('dev')) // log the requests

// apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1 // specifies that each request consumes 1 token
    })
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          error: 'Too many requests'
        })
      } else if (decision.reason.isBot()) {
        res.status(403).json({ error: "Bot access denied" })
      } else {
        res.status(403).json({ error: 'Forbidden' })
      }
      return
    }

    // check for spoofed bots
    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      res.status(403).json({ error: 'Spoofed bot detected' })
      return
    }

    next()
  } catch (error) {
    console.log('Arject error', error)
    next(error)
  }
})


// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'ok you are here', theurl: originUrl })
// })


// SERVING FROM THE SAME SITE
// SERVING FROM THE SAME SITE
// SERVING FROM THE SAME SITE
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "./frontend/dist"))); // or "build" if CRA
console.log('==================')
console.log(__dirname)
// Catch-all route (so React Router works)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", 'index.html'));
  // res.sendFile(path.join(__dirname, "./frontend/dist/index.html"));
});


// SERVING FROM THE SAME SITE
// SERVING FROM THE SAME SITE
// SERVING FROM THE SAME SITE



// routes
app.use('/api/products', productRoutes)
app.use('/api/user', userRoutes)
app.use('/api/workout', workoutRoutes)



// server running
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is runnning on localhost:${PORT}`)
  })
})

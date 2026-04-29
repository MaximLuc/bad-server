import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import mongoSanitize from 'express-mongo-sanitize'
import { rateLimit } from 'express-rate-limit'
import { DB_ADDRESS } from './config'
import csrfProtection from './middlewares/csrf'
import errorHandler from './middlewares/error-handler'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()
const { ORIGIN_ALLOW } = process.env
const { TRUST_PROXY } = process.env

if (TRUST_PROXY) {
    const trustProxyNumber = Number(TRUST_PROXY)
    app.set(
        'trust proxy',
        Number.isNaN(trustProxyNumber) ? TRUST_PROXY : trustProxyNumber
    )
}

const rateLimitOptions = {
    standardHeaders: 'draft-8' as const,
    legacyHeaders: false,
    skip: (req: express.Request) => req.method === 'OPTIONS',
}

const apiLimiter = rateLimit({
    ...rateLimitOptions,
    windowMs: 15 * 60 * 1000,
    limit: 300,
})

const authLimiter = rateLimit({
    ...rateLimitOptions,
    windowMs: 15 * 60 * 1000,
    limit: 20,
})

const uploadLimiter = rateLimit({
    ...rateLimitOptions,
    windowMs: 15 * 60 * 1000,
    limit: 30,
})

app.use(cookieParser())

app.use(
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)

app.options(
    '*',
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)

app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
app.use('/auth/token', authLimiter)
app.use('/upload', uploadLimiter)
app.use(apiLimiter)

app.use(urlencoded({ extended: true, limit: '20kb', parameterLimit: 50 }))
app.use(json({ limit: '100kb' }))

app.use(
    mongoSanitize({
        replaceWith: '_',
    })
)

app.use(csrfProtection)

app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: '1d',
        immutable: true,
    })
)

app.use(routes)
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()

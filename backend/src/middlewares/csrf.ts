import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { CSRF_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_HEADER_NAMES = ['x-csrf-token', 'csrf-token', 'x-xsrf-token']
const CSRF_FIELD_NAME = '_csrf'

function signToken(nonce: string) {
    return crypto
        .createHmac('sha256', CSRF_TOKEN.secret)
        .update(nonce)
        .digest('base64url')
}

function safeEqual(a: string, b: string) {
    const left = Buffer.from(a)
    const right = Buffer.from(b)

    return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function generateCsrfToken() {
    const nonce = crypto.randomBytes(32).toString('base64url')

    return `${nonce}.${signToken(nonce)}`
}

export function isValidCsrfToken(token: unknown) {
    if (typeof token !== 'string') {
        return false
    }

    const [nonce, signature] = token.split('.')

    if (!nonce || !signature) {
        return false
    }

    return safeEqual(signature, signToken(nonce))
}

function getRequestToken(req: Request) {
    const headerToken = CSRF_HEADER_NAMES.map((header) => req.get(header)).find(
        Boolean
    )

    if (headerToken) {
        return headerToken
    }

    if (typeof req.body?.[CSRF_FIELD_NAME] === 'string') {
        return req.body[CSRF_FIELD_NAME]
    }

    if (typeof req.query[CSRF_FIELD_NAME] === 'string') {
        return req.query[CSRF_FIELD_NAME]
    }

    return undefined
}

export function getCsrfToken(_req: Request, res: Response) {
    const csrfToken = generateCsrfToken()

    res.cookie(CSRF_TOKEN.cookie.name, csrfToken, CSRF_TOKEN.cookie.options)
    res.status(200).json({ csrfToken })
}

export default function csrfProtection(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (SAFE_METHODS.has(req.method)) {
        return next()
    }

    const requestToken = getRequestToken(req)
    if (!isValidCsrfToken(requestToken)) {
        return next(new ForbiddenError('Invalid CSRF token'))
    }

    return next()
}

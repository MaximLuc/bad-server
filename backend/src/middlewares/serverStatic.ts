import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const rootDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        const requestPath = req.path.replace(/^[/\\]+/, '')
        const filePath = path.resolve(rootDir, requestPath)
        const relativePath = path.relative(rootDir, filePath)

        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            return next()
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }

            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}

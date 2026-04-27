import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const isFileSizeError =
        err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE'
    const statusCode = isFileSizeError
        ? 413
        : err.statusCode || err.status || 500
    const message = isFileSizeError
        ? 'File is too large'
        : statusCode === 500
          ? 'Server error'
          : err.message

    console.log(err)

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler

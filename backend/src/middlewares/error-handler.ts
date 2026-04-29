import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const isFileSizeError =
        err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE'
    const statusCode = isFileSizeError
        ? 413
        : err.statusCode || err.status || 500
    const { message: errorMessage } = err
    let message = errorMessage

    if (isFileSizeError) {
        message = 'File is too large'
    } else if (statusCode === 500) {
        message = 'Server error'
    }

    console.log(err)

    res.status(statusCode).send({ message })
}

export default errorHandler

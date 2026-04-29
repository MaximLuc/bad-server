import { isAbsolute, relative, resolve } from 'path'

const publicDir = resolve(__dirname, '../public')

export default function resolvePublicFile(fileName: string) {
    const normalizedFileName = fileName.replace(/^[/\\]+/, '')
    const filePath = resolve(publicDir, normalizedFileName)
    const relativePath = relative(publicDir, filePath)

    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        throw new Error('Invalid file path')
    }

    return filePath
}

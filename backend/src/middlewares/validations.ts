import { RequestHandler } from 'express'
import Joi from 'joi'
import { Types } from 'mongoose'
import BadRequestError from '../errors/bad-request-error'

// eslint-disable-next-line no-useless-escape
export const phoneRegExp = /^\+?\d(?:[\d\s()-]*\d)?$/

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

const imageFileNameRegExp = /^\/?[a-z0-9_-]+\/[a-f0-9-]+\.(png|jpe?g|gif|svg)$/i

type RequestSchema = {
    body?: Joi.ObjectSchema
    params?: Joi.ObjectSchema
}

const validateRequest =
    (schema: RequestSchema): RequestHandler =>
    (req, _res, next) => {
        const messages: string[] = []

        if (schema.body) {
            const { error, value } = schema.body.validate(req.body, {
                abortEarly: false,
            })

            if (error) {
                messages.push(...error.details.map((detail) => detail.message))
            } else {
                req.body = value
            }
        }

        if (schema.params) {
            const { error, value } = schema.params.validate(req.params, {
                abortEarly: false,
            })

            if (error) {
                messages.push(...error.details.map((detail) => detail.message))
            } else {
                Object.assign(req.params, value)
            }
        }

        if (messages.length > 0) {
            return next(new BadRequestError(messages.join(', ')))
        }

        return next()
    }

// валидация id
export const validateOrderBody = validateRequest({
    body: Joi.object().keys({
        items: Joi.array()
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value)) {
                        return value
                    }
                    return helpers.message({ custom: 'Невалидный id' })
                })
            )
            .min(1)
            .max(50)
            .required()
            .messages({
                'array.empty': 'Не указаны товары',
            }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required()
            .messages({
                'string.valid':
                    'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                'string.empty': 'Не указан способ оплаты',
            }),
        email: Joi.string().email().max(254).required().messages({
            'string.empty': 'Не указан email',
        }),
        phone: Joi.string().max(30).required().pattern(phoneRegExp).messages({
            'string.empty': 'Не указан телефон',
        }),
        address: Joi.string().max(300).required().messages({
            'string.empty': 'Не указан адрес',
        }),
        total: Joi.number().required().messages({
            'string.empty': 'Не указана сумма заказа',
        }),
        comment: Joi.string().max(1000).optional().allow(''),
    }),
})

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = validateRequest({
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
            'string.empty': 'Поле "title" должно быть заполнено',
        }),
        image: Joi.object().keys({
            fileName: Joi.string()
                .max(255)
                .pattern(imageFileNameRegExp)
                .required(),
            originalName: Joi.string().max(255).required(),
        }),
        category: Joi.string().max(50).required().messages({
            'string.empty': 'Поле "category" должно быть заполнено',
        }),
        description: Joi.string().max(2000).required().messages({
            'string.empty': 'Поле "description" должно быть заполнено',
        }),
        price: Joi.number().allow(null),
    }),
})

export const validateProductUpdateBody = validateRequest({
    body: Joi.object().keys({
        title: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        image: Joi.object().keys({
            fileName: Joi.string()
                .max(255)
                .pattern(imageFileNameRegExp)
                .required(),
            originalName: Joi.string().max(255).required(),
        }),
        category: Joi.string().max(50),
        description: Joi.string().max(2000),
        price: Joi.number().allow(null),
    }),
})

export const validateObjId = validateRequest({
    params: Joi.object().keys({
        productId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (Types.ObjectId.isValid(value)) {
                    return value
                }
                return helpers.message({ any: 'Невалидный id' })
            }),
    }),
})

export const validateUserBody = validateRequest({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        password: Joi.string().min(6).max(128).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
        email: Joi.string()
            .required()
            .email()
            .max(254)
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.empty': 'Поле "email" должно быть заполнено',
            }),
    }),
})

export const validateAuthentication = validateRequest({
    body: Joi.object().keys({
        email: Joi.string()
            .required()
            .email()
            .max(254)
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().max(128).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    }),
})

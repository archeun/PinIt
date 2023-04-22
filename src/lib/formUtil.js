import {validate} from "validate.js";

const validationRules = {
    'pin-url': {
        presence: {allowEmpty: false},
        url: {
            allowLocal: true,
            schemes: ['http', 'https', 'ftp'],
            message: 'is invalid. Allowed schemes: http, https and ftp. Local hostnames are also allowed'
        },
        length: {
            maximum: 2048,
            message: 'should be less than 2048 characters'
        }
    },
    'pin-title': {
        presence: {allowEmpty: false},
        length: {
            maximum: 250,
            message: 'should be less than 250 characters'
        }
    },
    'pin-description': {
        length: {
            maximum: 400,
            message: 'should be less than 400 characters'
        }
    }
}

const getValidationRulesForData = (data) => {
    const rules = {}
    Object.keys(data).forEach(key => {
        if (validationRules[key]) {
            rules[key] = validationRules[key]
        }
    })
    return rules
}

export const validateForm = (data) => {
    let errors = validate(data, getValidationRulesForData(data))
    if (!errors) {
        errors = {}
    }
    return errors
}
import { message } from './message'

const formatMessage = (): string => message

console.log(formatMessage()?.toUpperCase())

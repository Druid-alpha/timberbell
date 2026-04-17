import { ObjectId } from 'mongodb'

export function isObjectId(value: string) {
  return ObjectId.isValid(value)
}

export function toObjectId(value: string) {
  return new ObjectId(value)
}

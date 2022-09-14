import { GlobalConstants } from "../constants"

export const randomString = (maxLength?: number): string =>
  Math.random()
    .toString(36)
    .substring(2, maxLength)

export const randomLetter = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  const charactersArray = characters.split('')
  const randLetter =
    charactersArray[Math.floor(Math.random() * charactersArray.length)]
  return randLetter
}

export const generateSimpleID = (): string =>
  `${randomLetter()}${randomString(10)}`

export const getIconPath = (name: string): string =>
  `${GlobalConstants.iconBasePath}/${name || 'empty'}.svg`

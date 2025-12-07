import _ from 'lodash'

export default function parseGistContent(data: any, fileName?: string) {
  const finalFileName = fileName || _.chain(data).get('files').keys().first().value()
  const content = _.get(data, ['files', finalFileName, 'content'])
  let result
  try {
    result = JSON.parse(content)
  }
  catch (err) {
    console.warn(err)
  }

  return result
}

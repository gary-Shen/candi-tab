import _ from 'lodash';

import type { IGist } from '@/types/gist.type';

export default function parseGistContent(data: IGist) {
  const fileName = _.chain(data).get('files').keys().first().value();
  const content = _.get(data, ['files', fileName, 'content']);
  let result;
  try {
    result = JSON.parse(content);
  } catch (err) {
    console.warn(err);
  }

  return result;
}

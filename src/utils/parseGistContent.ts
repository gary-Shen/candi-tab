import _ from 'lodash';

import type { IGist } from '@/types/gist.type';

export default function parseGistContent(data: IGist, fileName: string) {
  const finalFileName = fileName || _.chain(data).get('files').keys().first().value();
  const content = _.get(data, ['files', finalFileName, 'content']);
  let result;
  try {
    result = JSON.parse(content);
  } catch (err) {
    // eslint-disable-next-line
    console.warn(err);
  }

  return result;
}

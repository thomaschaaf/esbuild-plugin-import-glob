// @ts-ignore
import * as a from './migrations/**/*';
// @ts-ignore
import c from './migrations/**/*';

try {
  const b = require('./entities/**/*');

  console.log(a);
  console.log(b);
  console.log(c);
} catch (e) {
  console.error(e);
}

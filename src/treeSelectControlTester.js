import { rankWith, scopeEndsWith } from '@jsonforms/core';

const TreeSelectControlTester = rankWith(
  3, 
  scopeEndsWith('PaysVisités')
);

export default TreeSelectControlTester;

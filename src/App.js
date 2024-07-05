import React from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import TreeSelectControl from './TreeSelectControl';
import TreeSelectControlTester from './treeSelectControlTester';
import schema from './schemas/schema.json';
import schemaui from './schemas/schemaui.json'

const renderers = [
  ...materialRenderers,
  { tester: TreeSelectControlTester, renderer: TreeSelectControl }
];


const App = () => {
  const [data, setData] = React.useState({});

  const handleChange = (state) => setData(state.data);

  return (
    <JsonForms
      schema={schema}
      uischema={schemaui}
      data={data}
      renderers={renderers}
      cells={materialCells}
      onChange={({ data }) => handleChange({ data })}
    />
  );
};

export default App;

import React from 'react';
import { Box } from 'grommet';

const MasonryLayout = props => {
  const { gap, columns, bodyWidth, children } = props;
  const columnWrapper = {};
  const result = [];
  // create columns
  for (let i = 0; i < columns; i++) {
    columnWrapper[`column${i}`] = [];
  }

  // Divide the children into columns as shown below.
  for (let i = 0; i < children.length; i++) {
    const columnIndex = i % columns;
    columnWrapper[`column${columnIndex}`].push(
      <div key={i} style={{ marginBottom: `${gap}px`, minWidth:"250px"}}>
        {children[i]}
      </div>
    );
  }

  // The next step will be wrapping the items in each column with a div and pushing it into the result array as shown below.
  for (let i = 0; i < columns; i++) {
    result.push(
      <div
        key={i}
        style={{
          marginLeft: `${i > 0 && bodyWidth > 768  ? gap : 0}px`,
          flex: 1,
          flexBasis: '100%',
        }}>
        {columnWrapper[`column${i}`]}
      </div>
    );
  }

  return (
    <Box direction="row-responsive" >
      {result}
    </Box>
  );
}

export default MasonryLayout;
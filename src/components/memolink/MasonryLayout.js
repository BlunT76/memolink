import React from 'react';
import { Box } from 'grommet';

const MasonryLayout = props => {
  const columnWrapper = {};
  const result = [];
  // create columns
  for (let i = 0; i < props.columns; i++) {
    columnWrapper[`column${i}`] = [];
  }

  // Divide the children into columns as shown below.
  for (let i = 0; i < props.children.length; i++) {
    const columnIndex = i % props.columns;
    columnWrapper[`column${columnIndex}`].push(
      <div key={i} style={{ marginBottom: `${props.gap}px`, minWidth:"250px"}}>
        {props.children[i]}
      </div>
    );
  }

  // The next step will be wrapping the items in each column with a div and pushing it into the result array as shown below.
  for (let i = 0; i < props.columns; i++) {
    result.push(
      <div
        key={i}
        style={{
          marginLeft: `${props.gap}px`, // `${i > 0 ? props.gap : 0}px`,
          flex: 1,
          flexBasis: '100%',
          // alignItems: "stretch"
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
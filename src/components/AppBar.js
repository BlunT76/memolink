import React from 'react';
import { Box } from 'grommet';

const AppBar = props => (
  <Box
    tag="header"
    direction="row"
    align="center"
    background="brand"
    elevation="medium"
    style={{ zIndex: '1', minHeight: '48px' }}
    {...props}
  />
);

export default AppBar;

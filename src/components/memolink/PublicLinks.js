import React from "react";
import { Anchor, Box } from "grommet";

const PublicLinks = (props) => {
  const { label, link } = props;
  
  return (
  <Box direction="row" justify="between" gap="xxsmall" pad='xsmall'>
    <Anchor label={label} href={link} target="_blank" rel="noopener noreferrer" textAlign="start" color="dark-1"/>
  </Box>
)};

export default PublicLinks;

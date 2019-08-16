import React from "react";
import { Anchor, Box, Button, Image } from "grommet";
import { Copy } from "grommet-icons";

const updateClipboard = (newClip) => {
  navigator.clipboard.writeText(newClip);
}

const PublicLinks = (props) => {
  const { label, link } = props;
  
  return (
  <Box direction="row" justify="between" pad='xsmall' className="linkBorder">
    <Box flex direction="row" justify="start">
      <Image
        src= {`https://www.google.com/s2/favicons?domain=${link}`}
        alt=''
        style={{width:"16", height:"16", minWidth:"16", minHeight:"16", marginRight: "4px"}}
        alignSelf="center"
      />
      <Anchor label={label} href={link} target="_blank" rel="noopener noreferrer" textAlign="start" color="dark-1"/>
    </Box>

    <Button
      plain
      icon={<Copy size='small'/>}
      onClick={() => updateClipboard(link)}
      hoverIndicator="status-ok"
    />
  </Box>
)};

export default PublicLinks;

import React from "react";
import { Anchor, Box, Button, Image } from "grommet";
import { Trash, Copy } from "grommet-icons";
import icon from './icon.png';

const updateClipboard = (newClip) => {
  navigator.clipboard.writeText(newClip);
}

const onDragStart = (event, id) => {
  event.dataTransfer.setData('id', id);
}

const Links = (props) => {
  const { label, link, id, setOpenConfirmationLink, showLinks, cat_id } = props;
  const show = showLinks.includes(cat_id) ? {display: 'none'} : {display: 'flex'};
  const iconLink = link.startsWith('http') ? `https://www.google.com/s2/favicons?domain=${link}` : icon;
  return (
  <Box
    direction="row"
    justify="between"
    pad='xsmall'
    className="linkBorder"
    style={show}
  >
    <Box flex direction="row" justify="start">
      <Image
        src={iconLink}
        alt=''
        style={{width:"16", height:"16", minWidth:"16", minHeight:"16", marginRight: "4px"}}
        alignSelf="center"
      />
      <Anchor
        label={label}
        href={link}
        style={{wordBreak: 'break-all', marginLeft: "2px", marginRight: "2px"}}
        target="_blank"
        rel="noopener noreferrer"
        textAlign="start"
        color="dark-1"
        draggable="true"
        onDragStart={ elm => onDragStart(elm, JSON.stringify({ id }))}
      />
    </Box>
    <Button
      plain
      style={{marginLeft: "4px", marginRight: "4px"}}
      icon={<Copy size='small'/>}
      onClick={() => updateClipboard(link)}
    />
    <Button
      plain
      icon={<Trash size='small' color='status-error'/>}
      onClick={() => setOpenConfirmationLink({label, id})}
    />
  </Box>
)};

export default Links;

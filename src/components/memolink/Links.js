import React, { useState} from "react";
import { Anchor, Box, Button, Heading, Layer, Text } from "grommet";
import { Trash } from "grommet-icons";

const Links = (props) => {
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const { label, link, id, deleteLink } = props;
  
  return (
  <Box direction="row" justify="between" gap="xxsmall" pad='xsmall'>
    {openConfirmation && (
      <Layer
        position="center"
        modal
        onClickOutside={() => setOpenConfirmation(false)}
        onEsc={() => setOpenConfirmation(false)}
      >
        <Box pad="medium" gap="small" width="medium">
          <Heading level={3} margin="none">
            Confirm
          </Heading>
          <Text>Are you sure you want to delete <strong>{label}</strong>?</Text>
          <Box
            as="footer"
            gap="small"
            direction="row"
            align="center"
            justify="end"
            pad={{ top: "medium", bottom: "small" }}
          >
            <Button
              label="Cancel"
              onClick={() => setOpenConfirmation(false)}
              color="dark-3"
              hoverIndicator="neutral-2"
              style={{borderRadius:"0", padding: "5px",background:"brand", boxShadow: "none", border: "0 none"}}
            />
            <Button
              label={
                <Text color="white">
                  <strong>Delete</strong>
                </Text>
              }
              style={{borderRadius:"0", color:"#F8F8F8",background:"brand", padding: "5px", boxShadow: "none", border: "0 none"}}
              hoverIndicator="neutral-2"
              onClick={() => {deleteLink(id)}}
              primary
              color="status-critical"
            />
          </Box>
        </Box>
      </Layer>
    )}
    <Anchor label={label} href={link} textAlign="start" color="dark-1"/>
    <div tooltip={`Delete ${label} ?`}>
      <Button
        plain
        icon={<Trash size='small'/>}
        onClick={() => setOpenConfirmation(true)}
        hoverIndicator="status-critical"
      />
    </div>
  </Box>
)};

export default Links;

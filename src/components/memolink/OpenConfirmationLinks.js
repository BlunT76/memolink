import { React } from 'react';
import {
  Box, Button, Heading, Layer, Text,
} from 'grommet';


const OpenConfirmationLinks = (props) => {
  // const [openConfirmation, setOpenConfirmation] = useState(false);
  const { deleteLink, close, linkToDelete } = props;
  return (
    <Box>
      <Layer
        position="center"
        modal
        onClickOutside={() => close(false)}
        onEsc={() => close(false)}
      >
        <Box pad="medium" width="medium">
          <Heading level={3} margin="none">
          Confirm
          </Heading>
          <Text>Are you sure you want to delete <strong>{linkToDelete.label}</strong>?</Text>
          <Box
            as="footer"
            direction="row"
            align="center"
            justify="end"
            pad={{ top: 'medium', bottom: 'small' }}
          >
            <Button
              label="Cancel"
            // onClick={() => setOpenConfirmation(false)}
              color="dark-3"
              hoverIndicator="neutral-2"
              style={{
                borderRadius: '0', padding: '5px', background: 'brand', boxShadow: 'none', border: '0 none',
              }}
            />
            <Button
              label={(
                <Text color="white">
                  <strong>Delete</strong>
                </Text>
              )}
              style={{
                borderRadius: '0', color: '#F8F8F8', background: 'brand', padding: '5px', boxShadow: 'none', border: '0 none',
              }}
            // hoverIndicator="neutral-2"
              onClick={() => { deleteLink(linkToDelete.id); }}
              primary
              color="status-critical"
            />
          </Box>
        </Box>
      </Layer>
    </Box>
  );
};

export default OpenConfirmationLinks;

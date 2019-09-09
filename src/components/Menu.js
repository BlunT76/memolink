import React from 'react';
import { Box, Menu } from 'grommet';
import { Menu as MenuIcon, UserSettings } from 'grommet-icons';

const IconItemsMenu = (props) => {
  const { showSettingsPage } = props;
  return (
    <Menu
      plain
      close
      size="xlarge"
      items={[
        {
          label: <Box alignSelf="center">Settings</Box>,
          onClick: () => { showSettingsPage(); },
          icon: (
            <Box pad="small">
              <UserSettings size="medium" />
            </Box>
          ),
        },
      ]}
    >
      <Box direction="row" pad="small">
        <MenuIcon />
      </Box>
    </Menu>
  );
};

export default IconItemsMenu;

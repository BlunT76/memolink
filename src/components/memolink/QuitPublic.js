import React, { Component } from 'react';
import { Logout } from 'grommet-icons';
import { Box, Button, Text } from 'grommet';
import { connect } from 'react-redux';
import { setListsData, setLinksData, setPublic } from '../../store/Actions';

const mapStateToProps = (state) => {
  const { isLogged } = state;
  return { isLogged };
};

class QuitPublic extends Component {
  quitPublicPages = () => {
    const { dispatch } = this.props;
    dispatch(setListsData([]));
    dispatch(setLinksData([]));
    dispatch(setPublic(false));
  }

  render() {
    const { bodyWidth } = this.props;
    const btnLabel = bodyWidth > 480 ? 'Quit Public Page' : '';
    return (
      <Box>
        <Box align="center" margin={{ left: 'small' }}>
          <Button hoverIndicator="neutral-2" onClick={() => this.quitPublicPages()}>
            <Box pad="small" direction="row" align="center">
              <Logout />
              <Text className="btnTextColor">{btnLabel}</Text>
            </Box>
          </Button>
        </Box>
      </Box>
    );
  }
}

export default connect(mapStateToProps)(QuitPublic);

import React, { Component } from "react";
import { Logout } from "grommet-icons";
import { Box, Button, Text } from "grommet";
import { connect } from 'react-redux';
import { setUserData } from '../store/Actions';

const mapStateToProps = (state) => {
  const { isLogged } = state;
  return { isLogged };
};

class LogoutBtn extends Component {
  logout = () => {
    const { dispatch } = this.props;
    dispatch(setUserData({
      jwt: null,
      userid: null,
      isLogged: false,
      role: 0,
    }));
    localStorage.clear();
  }

  render() {
    return (
      <Box>
        <Box align="center" margin={ {"left": "small"} }>
          <Button hoverIndicator="neutral-2" onClick={() => this.logout()}>
            <Box pad="small" direction="row" align="center" gap="xxsmall">
              <Logout />
              <Text>Logout</Text>
            </Box>
          </Button>
        </Box>
      </Box>
    );
  }
}

export default connect(mapStateToProps)(LogoutBtn);

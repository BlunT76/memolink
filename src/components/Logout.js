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
    const tmp = localStorage.getItem('showlinks');
    if (tmp !== null) {
      localStorage.clear();
      localStorage.setItem('showlinks', tmp);
      return;
    } 
    localStorage.clear();
    localStorage.setItem('showlinks', JSON.stringify([]));
  }

  render() {
    const { bodyWidth } = this.props;
    const btnLabel = bodyWidth > 480 ? 'Logout' : '';
    return (
      <Box>
        <Box align="center" margin={ {"left": "small"} }>
          <Button hoverIndicator="neutral-2" onClick={() => this.logout()}>
            <Box pad="small" direction="row" align="center" >
              <Logout />
              <Text className="btnTextColor">{btnLabel}</Text>
            </Box>
          </Button>
        </Box>
      </Box>
    );
  }
}

export default connect(mapStateToProps)(LogoutBtn);

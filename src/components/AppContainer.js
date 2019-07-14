import React, { PureComponent } from 'react';
import { Box, Heading, Grommet, ResponsiveContext } from 'grommet';
import AppBar from './AppBar';
import ListCategories from './memolink/ListCategories';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Notification from './Notification';
import Home from './Home';
import { connect } from 'react-redux';
import { setUserData, setListsData, setLinksData } from '../store/Actions';


const mapStateToProps = (state) => {
  const { user, showAlertStatus, show } = state;
  return { user, showAlertStatus, show };
};

const theme = {
  global: {
    colors: {
      brand: '#3f50b5',
      "neutral-2": "#002884",
      "accent-2": "#757ce8",
      "accent-3": "#81FCED",
      "accent-4": "#FFCA58",
    },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
};

class AppContainer extends PureComponent {
    state = {
      showSidebar: false,
      colNumber: 1,
      list: []
    }
  
  componentDidMount() {
    this.setState({colNumber: Math.floor(document.body.clientWidth /250)});
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    document.removeEventListener("resize", this.updateDimensions);
    dispatch(setUserData({ jwt: null, userid: null, isLogged: false }));
    dispatch(setListsData([]));
    dispatch(setLinksData([]));
  }


  updateDimensions = () => {
    const col = Math.floor(document.body.clientWidth /250);
    this.setState({colNumber: col > 0 ? col : 1});
  }

  render(){
    const { colNumber } = this.state;
    const { user, showAlertStatus } = this.props;
    return (
        <Grommet theme={theme} full>
          <ResponsiveContext.Consumer>
            {size => (
              <Box fill>
                <AppBar>
                  <Heading level='3' margin='none'>MemoLinks</Heading>
                  <Box direction="row" justify="end" fill>
                    {!user.isLogged && <SignIn />}
                    {!user.isLogged && <SignUp />}
                  </Box>
                </AppBar>
                <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
                  {!user.isLogged && <Home />}
                  {user.isLogged && <ListCategories colNumber={colNumber}/>}
                  {showAlertStatus.show && <Notification />}
                </Box>
              </Box>
            )}
          </ResponsiveContext.Consumer>
        </Grommet>
    );
  }
}

export default connect(mapStateToProps)(AppContainer);

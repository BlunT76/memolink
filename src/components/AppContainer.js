import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { setUserData, setListsData, setLinksData, setPublic } from '../store/Actions';
import { Box, Heading, Grommet, ResponsiveContext } from 'grommet';
import AppBar from './AppBar';
import ListCategories from './memolink/ListCategories';
import PublicListCategories from './memolink/PublicListCategories';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Logout from './Logout';
import QuitPublic from './memolink/QuitPublic';
import Notification from './Notification';
import Home from './Home';

const mapStateToProps = (state) => {
  const { user, showAlertStatus, show, publicPage, publicPageUsername } = state;
  return { user, showAlertStatus, show, publicPage, publicPageUsername };
};

const theme = {
  global: {
    colors: {
      "brand": '#1976d2',
      "neutral-2": "#004ba0",
      "accent-2": "#757ce8",
      "accent-3": "#81FCED",
      "accent-4": "#FFCA58",
      "status-critical": "#e74c3c",
      "status-error": "#e74c3c",
      "status-ok": "#27ae60",
      "dark-1": "#2c3e50",
      "light-1": "FFFFFF"
      
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
      list: [],
      public: false,
      bodyWidth: document.body.clientWidth,
    }
  
  componentDidMount() {
    this.checkJWT();
    this.setState({colNumber: Math.floor(document.body.clientWidth /250)});
    window.addEventListener("resize", this.updateDimensions);
    if (window.location.pathname.split('/')[2] === 'public') {
      this.showPublicPages();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    document.removeEventListener("resize", this.updateDimensions);
    dispatch(setUserData({ jwt: null, userid: null, isLogged: false }));
    dispatch(setListsData([]));
    dispatch(setLinksData([]));
  }

  checkJWT = async () => {
    // check if stored user.jwt is valid
    if (localStorage.getItem('date') !== null) {
      const jwtExpireAt = +localStorage.getItem('date') + 86220;
      if (jwtExpireAt > Date.now() / 1000) {
        const { dispatch } = this.props;

        const jwt = localStorage.getItem('jwt');
        const userid = localStorage.getItem('userid');
        const role = localStorage.getItem('role');
        const memolink_public = +localStorage.getItem('memolink_public');
        const memolink_public_url = localStorage.getItem('memolink_public_url');

        dispatch(setUserData({
          jwt, userid, role, isLogged: true, memolink_public, memolink_public_url
        }));
      } else {
        localStorage.clear();
      }
    }
  }

  updateDimensions = () => {
    const col = Math.floor(document.body.clientWidth /250);
    const bodyWidth = document.body.clientWidth;
    this.setState({
      colNumber: col > 0 ? col : 1,
      bodyWidth,
    });
  }

  showPublicPages = () => {
    const { dispatch } = this.props;
    dispatch(setPublic(true));
  }

  render(){
    const { colNumber, bodyWidth } = this.state;
    const { user, showAlertStatus, publicPage, publicPageUsername } = this.props;

    return (
        <Grommet theme={theme} full>
          <ResponsiveContext.Consumer>
            {size => (
              <Box fill>
                <AppBar>
                  <Box direction="row" justify="start" basis="2/3">
                  <Heading className="btnTextColor" style={{overflowWrap: 'normal', wordBreak: 'normal'}} alignSelf="center" level='3' margin='none'>{publicPage ? `Public MemoLinks ${publicPageUsername}` : 'MemoLinks'}</Heading>
                  </Box>
                  <Box direction="row" justify="end" basis="1/3">
                    {!user.isLogged && !publicPage && <SignIn bodyWidth={bodyWidth} />}
                    {!user.isLogged && !publicPage && <SignUp bodyWidth={bodyWidth} />}
                    {user.isLogged && !publicPage && <Logout bodyWidth={bodyWidth} />}
                    {publicPage && <QuitPublic bodyWidth={bodyWidth} />}
                  </Box>
                </AppBar>

                {!publicPage && <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
                  {!user.isLogged && <Home />}
                  {user.isLogged && <ListCategories bodyWidth={bodyWidth} colNumber={colNumber}/>}
                  {showAlertStatus.show && <Notification />}
                </Box>}

                {publicPage && <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
                  <PublicListCategories bodyWidth={bodyWidth} colNumber={colNumber}/>
                </Box>}
              </Box>
            )}
          </ResponsiveContext.Consumer>
        </Grommet>
    );
  }
}

export default connect(mapStateToProps)(AppContainer);

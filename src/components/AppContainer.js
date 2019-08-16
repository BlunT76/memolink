import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { setUserData, setListsData, setLinksData, setPublic, setShowLinks } from '../store/Actions';
import { Box, Button, Heading, Grommet, ResponsiveContext, Tabs, Tab, TextInput } from 'grommet';
import { Search, FormClose } from 'grommet-icons';
import AppBar from './AppBar';
import ListCategories from './memolink/ListCategories';
import PublicListCategories from './memolink/PublicListCategories';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Logout from './Logout';
// import QuitPublic from './memolink/QuitPublic';
import Notification from './Notification';
import Menu from './Menu';
import Home from './Home';
import ImportBookmarks from './options/ImportBookmarks';
import ExportBookmarks from './options/ExportBookmarks';

const mapStateToProps = (state) => {
  const { user, showAlertStatus, show, publicPage, publicPageUsername, links, showLinks } = state;
  return { user, showAlertStatus, show, publicPage, publicPageUsername, links, showLinks };
};

const publicArrayIndex = process.env.REACT_APP_INDEX_APP_CONTAINER;

const theme = {
  global: {
    colors: {
      "brand": '#1976d2',
      "neutral-2": "#004ba0",
      "accent-1": "#1976d2",
      "accent-2": "#757ce8",
      "accent-3": "#81FCED",
      "accent-4": "#f26522",
      "status-critical": "#e74c3c",
      "status-error": "#e74c3c",
      "status-ok": "#27ae60",
      "dark-1": "#2c3e50",
      "light-1": "FFFFFF",
      "focus": "#004ba0",
      
    },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
};

class AppContainer extends PureComponent {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      colNumber: 1,
      list: [],
      public: false,
      showSettings: false,
      showHome: false,
      bodyWidth: document.body.clientWidth,
      valueSearch: '',
      previousLinks: null,
      tmpShowLinks: [],
    }
  }
    
  
  componentDidMount() {
    this.checkJWT();
    this.setState({colNumber: Math.floor(document.body.clientWidth /250)});
    window.addEventListener("resize", this.updateDimensions);
    if (window.location.pathname.split('/')[publicArrayIndex] === 'public') {
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
        const tmp = localStorage.getItem('showlinks');
        localStorage.clear();
        localStorage.setItem('showlinks', tmp);
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

  showSettingsPage = () => {
    const { showSettings } = this.state;
    this.setState({showSettings: !showSettings});
  }

  showHomePage = () => {
    const { showHome } = this.state;
    this.setState({showHome: !showHome});
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value }, () => {
      //this.searchKeyword();
    });
  }

  searchKeyword = (event) => {
    if (event) {
      event.preventDefault();
    }
    const { valueSearch, previousLinks } = this.state;
    const { links, dispatch } = this.props;
    const searchString = new RegExp(valueSearch, 'i')
    if ( previousLinks === null ) {
      this.setState({previousLinks: links}, () => {
        if (valueSearch.length > 0) {
          const { previousLinks } = this.state;
          const { showLinks } = this.props;
          this.setState({tmpShowLinks: showLinks}, () => {
            dispatch(setShowLinks([]));
          })
          const result = previousLinks.filter(elm => elm.label.search(searchString) !== -1)
          dispatch(setLinksData(result))
        }
      })
    } else {
      const { tmpShowLinks } = this.state;
      dispatch(setLinksData(previousLinks));
      dispatch(setShowLinks(tmpShowLinks));
      this.setState({previousLinks: null, tmpShowLinks: []}, () => {
        this.searchKeyword();
      })
    }
  }

  resetKeyword = () => {
    const { previousLinks, tmpShowLinks } = this.state;
    const { dispatch } = this.props;
    dispatch(setShowLinks(tmpShowLinks));
    if ( previousLinks !== null ) {
      dispatch(setLinksData(previousLinks))
    }
    this.setState({previousLinks: null, valueSearch: '', tmpShowLinks: []})
  }


  render(){
    const { colNumber, bodyWidth, showSettings, showHome, valueSearch } = this.state;
    const { user, showAlertStatus, publicPage, publicPageUsername } = this.props;

    return (
        <Grommet theme={theme} full>
          <ResponsiveContext.Consumer>
            {size => (
              <Box fill>
                <AppBar>
                  <Box direction="row" justify="start" basis="1/2" style={{padding: '2px 12px'}}>
                    {user.isLogged && !publicPage && <Menu showSettingsPage={() => this.showSettingsPage()} showHomePage={() => this.showHomePage()} />}
                    <Heading className="btnTextColor" style={{overflowWrap: 'normal', wordBreak: 'normal'}} alignSelf="center" level='3' margin='none'>{publicPage ? `${publicPageUsername} Links` : 'MemoLinks'}</Heading>
                  </Box>
                  <Box direction="row" justify="end" basis="1/2" style={{padding: '2px 12px'}}>
                    {(publicPage || user.isLogged) &&
                      <Box direction='row' align="center" border height="32px" alignSelf="center" style={{paddingRight: 0, marginRight: "4px"}}>
                        <Button
                          type="submit"
                          hoverIndicator="neutral-2"
                          style={{padding: "2px"}}
                          onClick={this.resetKeyword}
                          icon={<FormClose />}
                        />
                        <form onSubmit={event => this.searchKeyword(event)}>
                        <TextInput
                          placeholder="Search"
                          size="small"
                          alignSelf="center"
                          style={{paddingLeft: "2px", fontWeight: 400, color: 'white'}}
                          plain
                          border={false}
                          value={valueSearch}
                          name="valueSearch"
                          onChange={this.handleChange}
                        />
                        </form>
                        <Button
                          type="submit"
                          hoverIndicator="neutral-2"
                          style={{padding: "2px"}}
                          onClick={this.searchKeyword}
                          icon={<Search />}
                        />
                      </Box>
                    }
                    {!user.isLogged && !publicPage && <SignIn bodyWidth={bodyWidth} />}
                    {!user.isLogged && !publicPage && <SignUp bodyWidth={bodyWidth} />}
                    {user.isLogged && !publicPage && <Logout bodyWidth={bodyWidth} />}
                    {/* {publicPage && <QuitPublic bodyWidth={bodyWidth} />} */}
                  </Box>
                </AppBar>

                {!publicPage && !showSettings &&
                  <>
                    {(!user.isLogged || showHome) && <Home />}
                    {user.isLogged && !showHome && <ListCategories bodyWidth={bodyWidth} colNumber={colNumber}/>}
                    {showAlertStatus.show && <Notification />}
                  </>
                }

                {publicPage &&
                  <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
                    <PublicListCategories bodyWidth={bodyWidth} colNumber={colNumber}/>
                  </Box>
                }
                {user.isLogged && showSettings &&
                  <Tabs fill>
                    <Tab style={{background: '#1976d2 !important'}} title="Import Bookmarks">
                      <ImportBookmarks showSettingsPage={() => this.showSettingsPage()} />
                    </Tab>
                    <Tab title="Export Bookmarks">
                      <ExportBookmarks showSettingsPage={() => this.showSettingsPage()} />
                    </Tab>
                  </Tabs>
                  
                }
              </Box>
            )}
          </ResponsiveContext.Consumer>
        </Grommet>
    );
  }
}

export default connect(mapStateToProps)(AppContainer);

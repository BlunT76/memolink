import React, { PureComponent } from "react";
import { Anchor, Box, Heading, Text } from "grommet";
import { Rss } from 'grommet-icons';
import { connect } from 'react-redux';
import { setListsData, setLinksData, setShowAlertStatus, setPublicUsername } from '../../store/Actions';
import apiGetPublicPages from '../../api/apiGetPublicPages';
import MasonryLayout from './MasonryLayout';
import PublicLinks from './PublicLinks';

const mapStateToProps = (state) => {
  const {
    user, projects, lists, links, publicPageUsername,
  } = state;
  return {
    user, projects, lists, links, publicPageUsername,
  };
};

const publicArrayIndex = process.env.REACT_APP_INDEX_GET_PUBLIC;

class PublicListCategories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPublic: true,
      msg: '',
      publicUrl: '',
    }
  }
  componentDidMount() {
    this.getCategories();
  }

  getCategories = async () => {
    const { dispatch } = this.props;
    const table = window.location.pathname.split('/')[publicArrayIndex - 1]
    const response = await apiGetPublicPages(table, window.location.pathname.split('/')[publicArrayIndex]);

    if(response && response.data.code === 404) {
      this.setState({
        isPublic: false,
        msg: response.data.message,
      });
      return null;
    }
    if (response.status === 200 && response.data.length > 0) {
      dispatch(setListsData(response.data[0]));
      dispatch(setLinksData(response.data[1]));
      dispatch(setPublicUsername(response.data[2]));
      this.setState({publicUrl: response.config.url})
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured while fetching the lists',
        show: true,
        variant: 'status-error',
      }));
    }
  }

  render() {
    const { lists, colNumber, links, bodyWidth, publicPageUsername } = this.props;
    const { isPublic, msg, publicUrl } = this.state;
    const rssUrl = publicUrl.replace(/public/, 'rss');

    return (
      <Box fill margin='small'>
        
        {publicPageUsername &&
          <Text size="small">
            <Anchor
              icon={<Rss color="accent-4"/>}
              href={rssUrl}
              style={{display: "inline"}}
            />
            Follow {publicPageUsername}'s new links with this JSON Feed
          </Text>
        }

        {!isPublic && <Heading level="2" textAlign="center" color="brand">{msg}</Heading>}
        <MasonryLayout bodyWidth={bodyWidth} columns={colNumber} gap={10}>
          {lists && lists.length > 0 && lists.map((cat,i) => 
            <Box key={`cat${i}`} pad='xsmall' border={{ side: 'all' }} elevation="small">
              <Box direction="row" justify="between">
                <Heading margin="xxsmall" level="4" textAlign="center" color="brand">{cat.title}</Heading>
              </Box>
              {links && links.length > 0 && links.map((e,i) => {
                if (e.categories_id === cat.id) {
                  return <PublicLinks key={`link${i}`} id={e.id} link={e.link} label={e.label} margin='xxsmall'/>
                }
                return null;
              })}
          </Box>
          )}
        </MasonryLayout>
      </Box>
    )
  }
};

export default connect(mapStateToProps)(PublicListCategories);
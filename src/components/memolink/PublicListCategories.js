import React, { PureComponent } from "react";
import { Box, Heading } from "grommet";
import { connect } from 'react-redux';
import { setListsData, setLinksData, setShowAlertStatus, setPublicUsername } from '../../store/Actions';
import apiGetPublicPages from '../../api/apiGetPublicPages';
import MasonryLayout from './MasonryLayout';
import PublicLinks from './PublicLinks';



const mapStateToProps = (state) => {
  const {
    user, projects, lists, selectedProjectId, links,
  } = state;
  return {
    user, projects, lists, selectedProjectId, links,
  };
};

class PublicListCategories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPublic: true,
      msg: '',
    }
  }
  componentDidMount() {
    this.getCategories();
  }

  getCategories = async () => {
    const { dispatch } = this.props;
    const response = await apiGetPublicPages(window.location.pathname.split('/')[3]);
    if(response && response.data.code === 404) {
      this.setState({
        isPublic: false,
        msg: response.data.message
      });
      return null;
    }
    if (response.status === 200 && response.data.length > 0) {
      dispatch(setListsData(response.data[0]));
      dispatch(setLinksData(response.data[1]));
      dispatch(setPublicUsername(response.data[2]));
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
    const { lists, colNumber, links, bodyWidth } = this.props;
    const { isPublic, msg } = this.state;

    return (
      <Box fill margin='small'>
        {!isPublic && <Heading level="2" textAlign="center" color="brand">{msg}</Heading>}
        <MasonryLayout bodyWidth={bodyWidth} columns={colNumber} gap={10}>
          {lists && lists.length > 0 && lists.map((cat,i) => 
            <Box key={`cat${i}`} pad='xsmall' border={{ side: 'all' }} elevation="small">
              <Box direction="row" justify="between" gap="xxsmall">
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
import React, { PureComponent } from "react";
import { Box, Button, Heading, Layer, Text } from "grommet";
import { Trash } from "grommet-icons";
import { connect } from 'react-redux';
import { setListsData, setLinksData, setShowAlertStatus } from '../../store/Actions';
import apiGet from '../../api/apiGet';
import apiPost from '../../api/apiPost';
import apiDelete from '../../api/apiDelete';
import MasonryLayout from './MasonryLayout';
import AddCategory from './AddCategory';
import Links from './Links';
import AddLink from './AddLink';


const mapStateToProps = (state) => {
  const {
    user, projects, lists, selectedProjectId, links,
  } = state;
  return {
    user, projects, lists, selectedProjectId, links,
  };
};


class ListCategories extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      openConfirmation: false,
      catId: null,
      catTitle: '',
    }
  }
  componentDidMount() {
    this.getCategories();
  }

  getCategories = async () => {
    const { dispatch, user } = this.props;
    const response = await apiGet(user.jwt, 'categories');
    if (response.status === 200 && response.data.length > 0) {
      dispatch(setListsData(response.data));
      this.getLinks();
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured while fetching the lists',
        show: true,
        variant: 'status-error',
      }));
    }
  }

  postCategories = async (event) => {
    event.preventDefault();
    const { dispatch, user, selectedProjectId } = this.props;
    const { title } = this.state;
    const data = { title, projects_id: selectedProjectId, users_id: user.userid };
    const res = await apiPost(user.jwt, 'categories', data);
    if (res.status === 200) {
      this.getCategories();
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: 'New List created',
        show: true,
        variant: 'status-ok',
      }));
    }
  }

  deleteCategories = async (catId) => {
    const { user, dispatch } = this.props;
    const res = await apiDelete(user.jwt, 'categories', catId);
    if (res.data === 1) {
      this.getCategories();
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: 'Project deleted',
        show: true,
        variant: 'status-ok',
      }));
      this.onClose();
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured while deleting a list',
        show: true,
        variant: 'status-error',
      }));
    }
  }

  getLinks = async () => {
    const { dispatch, user } = this.props;
    const response = await apiGet(user.jwt, 'links');
    if (response.status === 200 && response.data.length > 0) {
      dispatch(setLinksData(response.data));
    }
  }

  deleteLink = async (id) => {
    const { user, dispatch } = this.props;
    const res = await apiDelete(user.jwt, 'links', id);
    if (res.data === 1) {
      this.getCategories();
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: 'Link deleted',
        show: true,
        variant: 'status-ok',
      }));
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured while deleting a list',
        show: true,
        variant: 'status-error',
      }));
    }
  }

  onOpen = (id, title) => this.setState({
    openConfirmation: true,
    catId: id,
    catTitle: title,
  });

  onClose = () => this.setState({ openConfirmation: false });

  render() {
    const { lists, colNumber, links, bodyWidth } = this.props;
    const { openConfirmation, catId, catTitle } = this.state;
    return (
      <Box fill>
        {openConfirmation && (
          <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
            <Box pad="medium" gap="small" width="medium">
              <Heading level={3} margin="none">
                Confirm
              </Heading>
              <Text>Are you sure you want to delete <strong>{catTitle}</strong>?</Text>
              <Box
                as="footer"
                gap="small"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: "medium", bottom: "small" }}
              >
                <Button
                  label="Cancel"
                  onClick={this.onClose}
                  color="dark-3"
                  hoverIndicator="neutral-2"
                  style={{borderRadius:"0", padding: "5px",background:"brand", boxShadow: "none", border: "0 none"}}
                />
                <Button
                  label={
                    <Text color="white">
                      <strong>Delete</strong>
                    </Text>
                  }
                  style={{borderRadius:"0", color:"#F8F8F8",background:"brand", padding: "5px", boxShadow: "none", border: "0 none"}}
                  hoverIndicator="neutral-2"
                  onClick={() => {this.deleteCategories(catId)}}
                  primary
                  color="status-critical"
                />
              </Box>
            </Box>
          </Layer>
        )}
        <AddCategory bodyWidth={bodyWidth}/>
        <MasonryLayout columns={colNumber} gap={10}>

          {lists && lists.length > 0 && lists.map((cat,i) => 
            <Box key={`cat${i}`} pad='xsmall' margin='small' border={{ side: 'all' }} elevation="small">
              <Box direction="row" justify="between" gap="xxsmall">
                <Heading margin="xxsmall" level="4" textAlign="center" color="brand">{cat.title}</Heading>
                <Box direction="row" justify="end" align="center" gap="small">
                  <Box round="full" overflow="hidden" background="brand">
                    <div tooltipadd={`Add a new link !`}>
                      <AddLink cat={cat.id} catName={cat.title} refresh={this.getCategories}/>
                    </div>
                  </Box>
                  <div tooltip={`Delete ${cat.title} ?`}>
                  <Button
                    plain
                    style={{marginTop: "5px"}}
                    reverse
                    icon={<Trash size='medium'/>}
                    onClick={() => this.onOpen(cat.id, cat.title)}
                    hoverIndicator="status-critical"
                  />
                  </div>
                </Box>
              </Box>
              
              {links && links.length > 0 && links.map((e,i) => {
                if (e.categories_id === cat.id) {
                  return <Links key={`link${i}`} id={e.id} link={e.link} label={e.label} deleteLink={this.deleteLink} margin='xxsmall'/>
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

export default connect(mapStateToProps)(ListCategories);
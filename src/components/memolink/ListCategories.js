/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
import React, { PureComponent } from 'react';
import {
  Box, Button, Heading, Layer, Text,
} from 'grommet';
import {
  Down, Trash, Next, FormViewHide, View,
} from 'grommet-icons';
import { connect } from 'react-redux';
import {
  setListsData, setLinksData, setShowAlertStatus, setShowLinks,
} from '../../store/Actions';
import apiGet from '../../api/apiGet';
import apiPost from '../../api/apiPost';
import apiPut from '../../api/apiPut';
import apiDelete from '../../api/apiDelete';
import MasonryLayout from './MasonryLayout';
import AddCategory from './AddCategory';
import Links from './Links';
import AddLink from './AddLink';

const mapStateToProps = (state) => {
  const {
    user, projects, lists, links, showLinks,
  } = state;
  return {
    user, projects, lists, links, showLinks,
  };
};


class ListCategories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openConfirmation: false,
      openConfirmationLink: false,
      catId: null,
      catTitle: '',
      linkToDelete: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.getCategories();
    const tmp = localStorage.getItem('showlinks');
    if (tmp && tmp !== null && tmp.length > 0) {
      dispatch(setShowLinks(JSON.parse(tmp)));
    } else {
      dispatch(setShowLinks([]));
    }
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
    const { dispatch, user } = this.props;
    const { title } = this.state;
    const data = { title, users_id: user.userid };
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

  setOpenConfirmationLink = (elm) => {
    this.setState({ linkToDelete: elm }, () => {
      this.setState({ openConfirmationLink: true });
    });
  }

  closeOpenConfirmationLink = () => {
    this.setState({ openConfirmationLink: false, linkToDelete: null });
  }

  deleteLink = async (id) => {
    const { user, dispatch } = this.props;
    const res = await apiDelete(user.jwt, 'links', id);
    if (res.data === 1) {
      this.getCategories();
      this.closeOpenConfirmationLink();
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

  unsetPublic = async (id) => {
    const { user, lists } = this.props;
    const catInList = lists.filter(cat => cat.id === id);
    const newIsPublic = +catInList[0].is_public === 1 ? 0 : 1;
    const res = await apiPut(user.jwt, 'categories', { is_public: newIsPublic }, id);
    if (res.data === 1) {
      this.getCategories();
    }
  }

  onOpen = (id, title) => this.setState({
    openConfirmation: true,
    catId: id,
    catTitle: title,
  });

  onClose = () => this.setState({ openConfirmation: false });

  onDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.style.border = 'dashed 2px #1976D2';
  }

  onDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.style.border = 'solid 1px rgba(0,0,0,0.33)';
  }

  onDrop = (event, cat) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('id');
    this.putLinks(id, cat);
    event.currentTarget.style.border = 'solid 1px rgba(0,0,0,0.33)';
  }

  putLinks = async (idLinks, idCategories) => {
    const { user, dispatch, links } = this.props;
    const link = JSON.parse(idLinks);
    const data = {
      categories_id: idCategories,
    };

    const currentLink = links.filter(elm => +elm.id === +link.id);
    if (currentLink[0].categories_id === idCategories) {
      return null;
    }

    const response = await apiPut(user.jwt, 'links', data, link.id);
    if (response.data === 1) {
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: 'Link updated',
        show: true,
        variant: 'status-ok',
      }));
      this.getCategories();
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured',
        show: true,
        variant: 'status-danger',
      }));
    }
    return null;
  }

  showCatLinks = (catid) => {
    const { showLinks, dispatch } = this.props;
    let tmp;
    const checkCat = showLinks.indexOf(catid);
    if (checkCat === -1) {
      tmp = [...showLinks, catid];
    } else {
      tmp = [...showLinks];
      tmp.splice(checkCat, 1);
    }
    dispatch(setShowLinks(tmp));
    localStorage.setItem('showlinks', JSON.stringify(tmp));
  }

  render() {
    const {
      user, lists, colNumber, links, bodyWidth, showLinks,
    } = this.props;
    const {
      openConfirmation, openConfirmationLink, catId, catTitle, linkToDelete,
    } = this.state;
    const boolMemolinkPublic = user.memolink_public === 1;

    return (
      <Box fill margin={{ top: 'small' }}>
        {openConfirmation && (
          <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
            <Box pad="medium" width="medium">
              <Heading level={3} margin="none">
                Confirm
              </Heading>
              <Text>Are you sure you want to delete <strong>{catTitle}</strong>?</Text>
              <Box
                as="footer"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: 'medium', bottom: 'small' }}
              >
                <Button
                  label="Cancel"
                  onClick={this.onClose}
                  color="dark-3"
                  hoverIndicator="neutral-2"
                  style={{
                    borderRadius: '0', padding: '5px', background: 'brand', boxShadow: 'none', border: '0 none',
                  }}
                />
                <Button
                  label={(
                    <Text color="white">
                      <strong>Delete</strong>
                    </Text>
                  )}
                  style={{
                    borderRadius: '0', color: '#F8F8F8', background: 'brand', padding: '5px', boxShadow: 'none', border: '0 none',
                  }}
                  hoverIndicator="neutral-2"
                  onClick={() => { this.deleteCategories(catId); }}
                  primary
                  color="status-critical"
                />
              </Box>
            </Box>
          </Layer>
        )}
        {openConfirmationLink && (
          <Layer
            position="center"
            modal
            onClickOutside={() => this.closeOpenConfirmationLink()}
            onEsc={() => this.closeOpenConfirmationLink()}
          >
            <Box pad="medium" width="medium">
              <Heading level={3} margin="none">
                Confirm
              </Heading>
              <Text>Are you sure you want to delete <strong>{linkToDelete.label}</strong>?</Text>
              <Box
                as="footer"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: 'medium', bottom: 'small' }}
              >
                <Button
                  label="Cancel"
                  onClick={() => this.closeOpenConfirmationLink()}
                  color="dark-3"
                  hoverIndicator="neutral-2"
                  style={{
                    borderRadius: '0', padding: '5px', background: 'brand', boxShadow: 'none', border: '0 none',
                  }}
                />
                <Button
                  label={(
                    <Text color="white">
                      <strong>Delete</strong>
                    </Text>
                  )}
                  style={{
                    borderRadius: '0', color: '#F8F8F8', background: 'brand', padding: '5px', boxShadow: 'none', border: '0 none',
                  }}
                  hoverIndicator="neutral-2"
                  onClick={() => { this.deleteLink(linkToDelete.id); }}
                  primary
                  color="status-critical"
                />
              </Box>
            </Box>
          </Layer>
        )}
        <AddCategory bodyWidth={bodyWidth} />
        <MasonryLayout columns={colNumber} gap={10}>

          {lists && lists.length > 0 && lists.map((cat, i) => (
            <Box
              onDragOver={elm => this.onDragOver(elm)}
              onDragLeave={elm => this.onDragLeave(elm)}
              onDrop={elm => this.onDrop(elm, cat.id)}
              key={cat.id}
              pad="xsmall"
              margin="small"
              border={{ side: 'all' }}
              elevation="small"
            >
              <Box direction="row" justify="between" style={{ flexWrap: 'wrap', marginBottom: '4px' }}>
                <Box direction="row" justify="start" align="center">
                  <Button
                    plain
                    style={{ marginRight: '0px' }}
                    reverse
                    icon={showLinks && showLinks.includes(cat.id) ? <Next size="medium" /> : <Down size="medium" />}
                    onClick={() => this.showCatLinks(cat.id)}
                  />
                  <Heading margin="xxsmall" level="4" textAlign="start" color="brand">{cat.title}</Heading>
                </Box>

                <Box direction="row" justify="end" align="center" style={{ marginLeft: 'auto' }}>
                  <Box round="full" overflow="hidden" background="brand">
                    <AddLink
                      cat={cat.id}
                      catName={cat.title}
                      bodyWidth={bodyWidth}
                      refresh={this.getCategories}
                    />
                  </Box>
                  {boolMemolinkPublic
                    && (
                    <Button
                      plain
                      style={{ marginLeft: '4px' }}
                      reverse
                      icon={+cat.is_public === 1 ? <View size="medium" /> : <FormViewHide size="medium" />}
                      onClick={() => this.unsetPublic(cat.id)}
                      hoverIndicator="status-ok"
                    />
                    )}
                  <Button
                    plain
                    style={{ marginLeft: '4px' }}
                    reverse
                    icon={<Trash size="medium" />}
                    onClick={() => this.onOpen(cat.id, cat.title)}
                    hoverIndicator="status-critical"
                  />
                </Box>
              </Box>

              {links && links.length > 0 && links.map((e, idx) => {
                if (e.categories_id === cat.id) {
                  return (
                    <Links
                      cat_id={e.categories_id}
                      showLinks={showLinks || []}
                      key={e.id}
                      id={e.id}
                      link={e.link}
                      label={e.label}
                      setOpenConfirmationLink={this.setOpenConfirmationLink}
                      deleteLink={this.deleteLink}
                      margin="xxsmall"
                    />
                  );
                }
                return null;
              })}
            </Box>
          ))}
        </MasonryLayout>
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ListCategories);

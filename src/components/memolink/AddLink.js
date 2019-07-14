import React, { PureComponent } from "react";
import { Add, Close } from "grommet-icons";
import {
  Box,
  Button,
  FormField,
  Heading,
  Layer,
  TextInput
} from "grommet";
import { connect } from 'react-redux';
import { setListsData, setShowAlertStatus } from '../../store/Actions';
import apiPost from '../../api/apiPost';
import apiGet from '../../api/apiGet';

const mapStateToProps = (state) => {
  const {
    user, projects, lists, selectedProjectId,
  } = state;
  return {
    user, projects, lists, selectedProjectId,
  };
};

class AddLink extends PureComponent {
  constructor(props) {
    super(props);
    this.postLink = this.postLink.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      open: false,
      link: '',
      label: '',
    };
  }
  
  getCategories = async () => {
    const { dispatch, user } = this.props;
    const response = await apiGet(user.jwt, 'categories');
    if (response.status === 200 && response.data.length > 0) {
      dispatch(setListsData(response.data));
    } else {
      dispatch(setShowAlertStatus({
        title: 'Error',
        text: 'A problem occured while fetching the lists',
        show: true,
        variant: 'danger',
      }));
    }
  }

  postLink = async (event) => {
    event.preventDefault();
    const { dispatch, user, cat, catName, refresh } = this.props;
    const { link, label } = this.state;
    const data = { link, label, categories_id: cat, users_id: user.userid };
    const res = await apiPost(user.jwt, 'links', data);
    
    if (res.status === 200 && Number.isInteger(res.data)) {
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: `New Link added to ${catName}`,
        show: true,
        variant: 'status-ok',
      }));
      refresh();
    } else {
      dispatch(setShowAlertStatus({
        title: res.data.status,
        text: res.data.message,
        show: true,
        variant: 'status-error',
      }));
    }
  }

  onOpen = () => this.setState({ open: true });

  onClose = () => {
    this.setState({ open: undefined });
  };

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { open } = this.state;
    const { catName } = this.props;
    return (
      <Box margin="none">
        <Button
          plain
          icon={<Add size='medium'/>}
          hoverIndicator="neutral-2"
          onClick={this.onOpen}>
        </Button>

        {open && (
          <Layer
            position="right"
            full="vertical"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
            <Box
              as="form"
              fill="vertical"
              overflow="auto"
              width="medium"
              pad="medium"
              onSubmit={this.postLink}
            >
              <Box flex={false} direction="row" justify="between" onSubmit={this.postLink}>
                <Heading level={2} margin="none">
                {`Add a Link to ${catName}`}
                </Heading>
                <Button icon={<Close />} onClick={this.onClose} />
              </Box>
              <Box flex="grow" overflow="auto" pad={{ vertical: "medium" }}>
                <FormField label="Link">
                  <TextInput type="text" name="link" onChange={this.handleChange}/>
                </FormField>
                <FormField label="Label">
                  <TextInput type="text" name="label" onChange={this.handleChange}/>
                </FormField>
                <Button
                  type="submit"
                  label="Submit"
                  margin={{"top": "medium"}}
                  hoverIndicator="neutral-2"
                  style={{borderRadius:"0", color:"#F8F8F8",background:"brand", padding: "5px", boxShadow: "none", border: "0 none"}}
                  primary
                />
              </Box>
              <Box flex={false} as="footer" align="start">
                
              </Box>
            </Box>
          </Layer>
        )}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(AddLink);

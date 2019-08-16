import React, { PureComponent } from "react";
import { Add, Close } from "grommet-icons";
import {
  Box,
  Button,
  FormField,
  Heading,
  Layer,
  TextInput,
} from "grommet";
import { connect } from 'react-redux';
import { setListsData, setShowAlertStatus } from '../../store/Actions';
import apiPost from '../../api/apiPost';
import apiGet from '../../api/apiGet';
import SetPublic from "./SetPublic";

const mapStateToProps = (state) => {
  const {
    user, projects, lists,
  } = state;
  return {
    user, projects, lists,
  };
};

class AddCategory extends PureComponent {
  constructor(props) {
    super(props);
    this.postCategory = this.postCategory.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      open: false,
      title: ''
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
        variant: 'status-error',
      }));
    }
  }

  postCategory = async (event) => {
    event.preventDefault();
    const { dispatch, user } = this.props;
    const { title } = this.state;
    const data = { title, users_id: user.userid };
    const res = await apiPost(user.jwt, 'categories', data);
    if (res.status === 200) {
      this.getCategories();
      dispatch(setShowAlertStatus({
        title: 'Success',
        text: 'New Category created',
        show: true,
        variant: 'status-ok',
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
    const { bodyWidth } = this.props;
    const btnMargin = bodyWidth > 770 ? {"right": "small", "left": "small"} : {"right": "xsmall", "left": "xsmall"};
    const btnLabel = bodyWidth > 480 ? 'Add a Category' : '';
    return (
      <>
      <Box direction="row" justify="between" alignContent="center" style={{marginTop:"16px", marginBottom:"16px", height:"36px"}}>
        <SetPublic />
        <Button
          plain
          style={{borderRadius:"0", color:"#FFFFFF", padding: "5px"}}
          margin={btnMargin}
          alignSelf="center"
          icon={<Add/>}
          label={btnLabel}
          hoverIndicator="neutral-2"
          focusIndicator={false}
          primary
          onClick={this.onOpen}
        />
        </Box>
        
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
              onSubmit={this.postCategory}
            >
              <Box flex={false} direction="row" justify="between" onSubmit={this.checkLogin}>
                <Heading level={2} margin="none">
                  Add a Category
                </Heading>
                <Button icon={<Close />} onClick={this.onClose} />
              </Box>
              <Box flex="grow" overflow="auto" pad={{ vertical: "medium" }}>
                <FormField label="Category Name">
                  <TextInput type="text" name="title" onChange={this.handleChange}/>
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
      </>
    );
  }
}

export default connect(mapStateToProps)(AddCategory);


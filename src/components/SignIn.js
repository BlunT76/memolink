import React, { Component } from "react";
import { Close, Login, FormLock, View } from "grommet-icons";
import {
  Box,
  Button,
  FormField,
  Heading,
  Layer,
  Text,
  TextInput,
} from "grommet";
import { connect } from 'react-redux';
import { setUserData, setShowAlertStatus } from '../store/Actions';
import apiSignIn from '../api/apiSignIn';


const mapStateToProps = (state) => {
  const { isLogged } = state;
  return { isLogged };
};


class SignIn extends Component {
  constructor(props) {
    super(props);
    this.checkLogin = this.checkLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      open: false,
      username: '',
      password: '',
      reveal: false,
    };
  }
  

  onOpen = () => this.setState({ open: true });

  onClose = () => this.setState({ open: undefined });

  checkLogin = async (event) => {
    const { username, password } = this.state;
    const { dispatch } = this.props;
    event.preventDefault();
    const response = await apiSignIn(username, password);

    if (response.data.code === 200) {
      const { jwt, userid, role, memolink_public, memolink_public_url } = response.data;
      dispatch(setUserData({ jwt, userid, isLogged: true, memolink_public, memolink_public_url }));
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('userid', userid);
      localStorage.setItem('role', role);
      localStorage.setItem('memolink_public', memolink_public);
      localStorage.setItem('memolink_public_url', memolink_public_url);
      localStorage.setItem('date', Date.now() / 1000);
      dispatch(setShowAlertStatus({
        title: response.data.status,
        text: response.data.message,
        show: true,
        variant: 'status-ok',
      }));
    }

    if (response.data.code === 404) {
      dispatch(setShowAlertStatus({
        title: response.data.status,
        text: response.data.message,
        show: true,
        variant: 'status-error',
      }));
    }
    
    if (response.data.code === 523) {
      dispatch(setShowAlertStatus({
        title: response.data.status,
        text: response.data.message,
        show: true,
        variant: 'status-error',
      }));
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  showPass = () => {
    const { reveal } = this.state;
    this.setState({reveal: !reveal})
  }

  render() {
    const { open, reveal } = this.state;
    const { bodyWidth } = this.props;
    const btnLabel = bodyWidth > 480 ? 'Login' : '';
    return (
        <Box>
          <Box align="center" margin={ {"left": "small"} }>
            <Button hoverIndicator="neutral-2" onClick={this.onOpen}>
              <Box pad="small" direction="row" align="center" gap="xxsmall">
                <Login />
                <Text className="btnTextColor">{btnLabel}</Text>
              </Box>
            </Button>
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
                onSubmit={this.checkLogin}
              >
                <Box flex={false} direction="row" justify="between">
                  <Heading level={2} margin="none">
                    Login
                  </Heading>
                  <Button icon={<Close />} onClick={this.onClose} />
                </Box>
                <Box flex="grow" overflow="auto" pad={{ vertical: "medium" }}>
                  <FormField
                    label="Userame"
                    required
                  >
                    <TextInput type="text" name="username" onChange={this.handleChange}/>
                  </FormField>
                  <FormField label="Password" required>
                  <Box
                    direction="row"
                    align="center"
                    round="xxsmall"
                    border="bottom"
                  >
                    <TextInput plain type={reveal ? "text" : "password"} name="password" onChange={this.handleChange} />
                    <Button
                      icon={reveal ? <View size="medium" /> : <FormLock size="medium" />}
                      onClick={() => this.showPass()}
                    />
                    </Box>
                  </FormField>
                  <Button
                    type="submit"
                    label="Submit"
                    hoverIndicator="neutral-2"
                    margin={{"top": "medium"}}
                    style={{borderRadius:"0", color:"#FFFFFF",background:"brand", padding: "5px", boxShadow: "none", border: "0 none"}}
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

export default connect(mapStateToProps)(SignIn);

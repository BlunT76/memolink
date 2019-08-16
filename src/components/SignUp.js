import React, { PureComponent } from "react";
import { Close, UserAdd, FormLock, View } from "grommet-icons";
import {
  Box,
  Button,
  FormField,
  Heading,
  Layer,
  Text,
  TextInput
} from "grommet";
import { connect } from 'react-redux';
import { setShowAlertStatus } from '../store/Actions';
import apiSignUp from '../api/apiSignUp';

const mapStateToProps = (state) => {
  const { isLogged } = state;
  return { isLogged };
};

class SignUp extends PureComponent {
  constructor(props) {
    super(props);
    this.checkLogin = this.checkLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      open: false,
      username: '',
      email: '',
      password_1: '',
      password_2: '',
      reveal: false,
    };
  }
  

  onOpen = () => this.setState({ open: true });

  onClose = () => this.setState({ open: undefined });

  checkLogin = async (event) => {
    const { dispatch } = this.props;
    const { username, email, password_1, password_2 } = this.state;
    event.preventDefault();
    const response = apiSignUp(username, email, password_1, password_2);
    const responseJSON = await response;
    if (responseJSON.data.code === 200) {
      dispatch(setShowAlertStatus({
        title: responseJSON.data.status,
        text: responseJSON.data.message,
        show: true,
        variant: 'status-ok',
      }));
    }

    if (responseJSON.data.code === 400) {
      dispatch(setShowAlertStatus({
        title: responseJSON.data.status,
        text: responseJSON.data.message,
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
    const btnLabel = bodyWidth > 480 ? 'SignUp' : '';
    return (
        <>
          <Box align="center">
            <Button hoverIndicator="neutral-2" onClick={this.onOpen}>
              <Box pad="small" direction="row" align="center">
                <UserAdd />
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
                    Sign Up
                  </Heading>
                  <Button icon={<Close />} onClick={this.onClose} />
                </Box>
                <Box flex="grow" overflow="auto" pad={{ vertical: "medium" }}>
                  <FormField label="Userame">
                    <TextInput type="text" name="username" onChange={this.handleChange}/>
                  </FormField>
                  <FormField label="Email">
                    <TextInput type="email" name="email" onChange={this.handleChange}/>
                  </FormField>
                  <FormField label="Password">
                    <TextInput type={reveal ? "text" : "password"} name="password_1" onChange={this.handleChange}/>
                  </FormField>
                  <FormField label="Password Verification">
                    <Box
                      direction="row"
                      align="center"
                      round="xxsmall"
                      border="bottom"
                    >
                      <TextInput plain type={reveal ? "text" : "password"} name="password_2" onChange={this.handleChange}/>
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
                    style={{borderRadius:"0", color:"#FFFFFF",background:"brand", padding: "5px", boxShadow: "none", border: "0 none"}}
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

export default connect(mapStateToProps)(SignUp);

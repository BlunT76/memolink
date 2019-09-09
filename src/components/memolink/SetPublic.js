import React, { PureComponent } from 'react';
import {
  Anchor, Button, Box, CheckBox, Text,
} from 'grommet';
import { FormView, FormViewHide } from 'grommet-icons';
import { connect } from 'react-redux';
import { setUserData } from '../../store/Actions';
import apiPut from '../../api/apiPut';

const mapStateToProps = (state) => {
  const {
    user, projects, lists,
  } = state;
  return {
    user, projects, lists,
  };
};

class SetPublic extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  setChecked = async () => {
    const { user, dispatch } = this.props;
    const { memolinkPublic } = user;

    const userUpdate = { ...user, memolink_public: memolinkPublic === 0 ? 1 : 0 };

    const response = await apiPut(user.jwt, 'setpublic', { memolink_public: userUpdate.memolink_public }, user.userid);
    if (response && response.data === 1) {
      dispatch(setUserData(userUpdate));
      localStorage.setItem('memolink_public', userUpdate.memolink_public);
    }
  };

  setShow = (e) => {
    this.setState({ show: e });
  }

  render() {
    const { user } = this.props;
    const { show } = this.state;
    const { memolinkPublic } = user;

    const boolMemolinkPublic = memolinkPublic === 1;
    const publicUrl = `${process.env.REACT_APP_URL}public/${user.memolink_public_url}`;
    const toggleLabel = boolMemolinkPublic ? 'Public ON' : 'Public OFF';

    return (
      <Box direction="row" alignSelf="center" margin={{ left: 'small' }}>
        {!show && (
        <CheckBox
          checked={boolMemolinkPublic}
          margin={{ left: 'small' }}
          toggle
          label={toggleLabel}
          onChange={() => this.setChecked()}
        />
        )}
        <Box>
          {boolMemolinkPublic && (
          <Button
            size="small"
            style={{ borderRadius: '0', color: '#F8F8F8', padding: '5px' }}
            icon={!show ? <FormView /> : <FormViewHide />}
            onClick={() => this.setShow(!show)}
            label={show
              && (
              <Anchor alignSelf="end" size="xsmall" color="dark-1" href={publicUrl} target="_blank" rel="noreferrer noopener">
                <Text size="xsmall" wordBreak="break-all">{publicUrl}</Text>
              </Anchor>
              )}
          />
          )}
        </Box>
      </Box>
    );
  }
}

export default connect(mapStateToProps)(SetPublic);

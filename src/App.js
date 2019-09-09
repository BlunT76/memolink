import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import AppContainer from './components/AppContainer';
import memolinkReducer from './store/Reducers';

const store = createStore(memolinkReducer);

class App extends PureComponent {
  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}

export default App;

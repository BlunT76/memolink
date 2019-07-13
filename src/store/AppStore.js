import { createStore } from 'redux';
import pokanReducer from './Reducers';

const store = createStore(pokanReducer);
export default store;

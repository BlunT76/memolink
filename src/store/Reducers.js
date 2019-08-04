import {
  SET_USER_DATA,
  SET_LISTS_DATA,
  SET_SHOW_ALERTSTATUS,
  SET_LINKS_DATA,
  SET_PUBLIC,
  SET_PUBLIC_USERNAME,
} from './Actions';


const initialState = {
  user: {
    jwt: null,
    userid: null,
    isLogged: false,
    memolink_public: 0,
    memolink_public_url: 0,
  },
  publicPage: false,
  publicPageUsername: '',
  lists: [],
  links:[],
  showAlertStatus: {},
};

const memolinkReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA: {
      return {
        ...state,
        user: action.payload,
      };
    }
    case SET_LISTS_DATA: {
      return {
        ...state,
        lists: action.payload,
      };
    }
    case SET_SHOW_ALERTSTATUS:
      return {
        ...state,
        showAlertStatus: action.payload,
      };
    case SET_LINKS_DATA:
      return {
        ...state,
        links: action.payload,
      };
    case SET_PUBLIC:
      return {
        ...state,
        publicPage: action.payload,
      };
    case SET_PUBLIC_USERNAME:
      return {
        ...state,
        publicPageUsername: action.payload,
      };
    default:
      return state;
  }
};
export default memolinkReducer;

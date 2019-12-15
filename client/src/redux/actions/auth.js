import axios from 'axios';
import {LS} from 'utils';
import {
  FETCH_MEMBER_START,
  FETCH_MEMBER_SUCCESS,
  FETCH_MEMBER_FAIL,
  SET_SHIPPING,
  SET_BILLING,
  AUTH_SIGN_UP,
  AUTH_LOG_IN,
  AUTH_LOG_OUT,
  AUTH_ERROR,
} from './types';


const setLocalStorage = (token, user_id) => {
  LS.set('JWT_TOKEN', token)
  LS.set('USER_ID', user_id)
}

export const setShippingAddress = (data) => async dispatch => {
  const user_id = LS.get('USER_ID')
  await axios.put('/users/user', { data, user_id, type: 'shipping' })
  dispatch({ type: SET_SHIPPING, payload: data })
}

export const setBillingAddress = (data) => async dispatch => {
  const user_id = LS.get('USER_ID')
  await axios.put('/users/user', { data, user_id, type: 'billing' })
  dispatch({ type: SET_BILLING, payload: data })
}

export const fetchMember = () => async dispatch => {
  dispatch({ type: FETCH_MEMBER_START })
  try {
    const user_id = LS.get('USER_ID')
    if(user_id === null){
      dispatch({ type: FETCH_MEMBER_FAIL })
    }else{
      const res = await axios.post('/users/user', { user_id })
      const order = await axios.post('/users_order', { user_id })
      dispatch({ type: FETCH_MEMBER_SUCCESS, payload: {...res.data, ...order.data} })
    }
  } catch (err) {
    dispatch({ type: FETCH_MEMBER_FAIL })
  }
}


export const signUp = (data, callback) => async dispatch => {
  try {
    const res = await axios.post('/users/signup', data)
    dispatch({ type: AUTH_SIGN_UP, payload: res.data.token })
    setLocalStorage(res.data.token, res.data.id)
    callback("Welcome Back", "success")
  } catch (err) {
    dispatch({type: AUTH_ERROR, payload: err.message})
    callback(err.message, "error")
  }
}

export const logIn = (data, callback) => async dispatch => {
  try {
    const res = await axios.post('/users/signin', data);
    dispatch({ type: AUTH_LOG_IN, payload: res.data.token })
    setLocalStorage(res.data.token, res.data.id)
    callback("Welcome Back", "success")
  } catch (err) {
    dispatch({type: AUTH_ERROR, payload: err.message})
    callback(err.message, "error")
  }
}

export const logOut = () => async (dispatch) => {
  LS.remove('JWT_TOKEN')
  LS.remove('USER_ID')
  dispatch({type: AUTH_LOG_OUT})
}

export const oauthThirdParty = ({access_token, party}, callback) => async (dispatch) => {
  try {
    const res = await axios.post(`/users/oauth/${party}`, {access_token})
    dispatch({type: AUTH_SIGN_UP, payload: res.data.token})
    setLocalStorage(res.data.token, res.data.id)
    callback("Welcome Back", "success")
  } catch (err) {
    dispatch({type: AUTH_ERROR, payload: err.message})
    callback(err.message, "error")
  }
}

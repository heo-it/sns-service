import { all, fork, put, call, delay, takeLatest } from "@redux-saga/core/effects";
import { 
  LOAD_MY_INFO_REQUEST, LOAD_MY_INFO_SUCCESS, LOAD_MY_INFO_FAILURE, 
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, 
  LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, 
  LOG_OUT_REQUEST, LOG_OUT_SUCCESS, LOG_OUT_FAILURE, 
  SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE,
  CHANGE_NICKNAME_REQUEST, CHANGE_NICKNAME_SUCCESS, CHANGE_NICKNAME_FAILURE,
  FOLLOW_REQUEST, FOLLOW_SUCCESS, FOLLOW_FAILURE,
  UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS, UNFOLLOW_FAILURE,
  LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILURE,
  LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE,
  REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, REMOVE_FOLLOWER_FAILURE,
} from "../reducers/user";
import axios from 'axios';

function loadMyInfoAPI() {
  return axios.get('/user');
}

function* loadMyInfo(action) {
  try {
    const result = yield call(loadMyInfoAPI, action.data);
    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_MY_INFO_FAILURE,
      error: err.response.data
    }); 
  }
}

function loadUserAPI(data) {
  return axios.get(`/user/${data}`);
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_USER_FAILURE,
      error: err.response.data
    }); 
  }
}

function loadFollowersAPI(data) {
  return axios.get('/user/followers', data);
}

function* loadFollowers(action) {
  try {
    const result = yield call(loadFollowersAPI, action.data);
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: err.response.data
    }); 
  }
}

function loadFollowingsAPI(data) {
  return axios.get('/user/followings', data);
}

function* loadFollowings(action) {
  try {
    const result = yield call(loadFollowingsAPI, action.data);
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: err.response.data
    }); 
  }
}


/****** LogIn ******/
// ????????? ?????? Login ????????? ????????? ??????
function logInAPI(data) {
  return axios.post('/user/login', data);
}

function* logIn(action) {
  try {
    // ?????? ?????? ????????? ????????? success/failure ??? Action??? ?????? ?????? ??????
    // put - dispatch??? ????????? ????????? ?????? effects?????? ?????? ?????? ???
    // call - ????????? ?????? ??????, fork - ?????? ?????? ??????
    // yield??? ???????????? ????????? 
    const result = yield call(logInAPI, action.data);
    yield delay(1000);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data
    });
  } catch (err) {
    console.log('sagas-user-err', err);
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data
    }); 
  }
}

/****** LogOut ******/
function logOutAPI() {
  return axios.post('/user/logout');
}

function* logOut() {
  try {
    yield call(logOutAPI);
    yield put({
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: LOG_OUT_FAILURE,
      err: err.response.data
    }); 
  }
}

function signUpAPI(data) {
  return axios.post('/user', data);
}

function* signUp(action) {
  const result = yield call(signUpAPI, action.data);
  console.log("signUp Result", result);
  try {
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: SIGN_UP_FAILURE,
      err: err.response.data
    }); 
  }
}

function changeNicknameAPI(data) {
  return axios.patch('/user/nickname', { nickname: data});
}

function* changeNickname(action) {
  const result = yield call(changeNicknameAPI, action.data);
  try {
    yield put({
      type: CHANGE_NICKNAME_SUCCESS,
      data: result.data
    });
  } catch (err) {
    yield put({
      type: CHANGE_NICKNAME_FAILURE,
      err: err.response.data
    }); 
  }
}

function followAPI(data) {
  return axios.patch(`/user/${data}/follow`);
}

function* follow(action) {
  const result = yield call(followAPI, action.data);
  try {
    yield put({
      type: FOLLOW_SUCCESS,
      data: result.data
    });
  } catch (err) {
    yield put({
      type: FOLLOW_FAILURE,
      err: err.response
    }); 
  }
}

function unfollowAPI(data) {
  return axios.delete(`/user/${data}/follow`);
}

function* unfollow(action) {
  const result = yield call(unfollowAPI, action.data);
  try {
    yield put({
      type: UNFOLLOW_SUCCESS,
      data: result.data
    });
  } catch (err) {
    yield put({
      type: UNFOLLOW_FAILURE,
      err: err.response
    }); 
  }
}

function removeFollowerAPI(data) {
  return axios.delete(`/user/follower/${data}`);
}

function* removeFollower(action) {
  const result = yield call(removeFollowerAPI, action.data);
  try {
    yield put({
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data
    });
  } catch (err) {
    yield put({
      type: REMOVE_FOLLOWER_FAILURE,
      err: err.response
    }); 
  }
}

function* watchLoadMyInfo() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser);
}

function* watchLoadFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

function* watchLoadFollowers() {
  yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

// ????????? ????????? ?????? ???????????? ???????????? ??????
// ????????? while????????? ?????? ????????? ?????? ?????? ?????????????????? ??????????????? ?????? ????????? takeEvery ??????
function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn);
}

// takeLatest??? ?????? ???????????? ?????? ?????? ?????? ???????????? ????????? take??? ?????????
// ????????? ???????????? ?????? ????????? ?????????????????? ???????????? ??????????????? ????????? ?????? ????????? ??????
// ????????? ???????????? ????????? ??????????????? ??? ?????? ????????? ????????? ???????????? ?????? ????????? refresh?????? ????????? ?????????
function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

function* watchChangeNickname() {
  yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}

function* watchUnFollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}

function* watchRemoveFollower() {
  yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

export default function* userSaga() {
  yield all([
    // ????????? ??????
    fork(watchLoadMyInfo),
    fork(watchLoadUser),
    fork(watchLoadFollowings),
    fork(watchLoadFollowers),
    fork(watchRemoveFollower),
    fork(watchFollow),
    fork(watchUnFollow),
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchSignUp),
    fork(watchChangeNickname),
  ])
}
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';

import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';

import wrapper from '../store/configureStore';

// 각 페이지(index.js)의 return 부분이 _app.js의 Component에 들어간다.
const Home = () => {
  const dispatch = useDispatch();
  const { mainPosts, hasMorePost, loadPostsLoading, retweetError } = useSelector((state) => state.post);

  useEffect(() => {
    console.log(retweetError);
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // https://github.com/bvaughn/react-virtualized
  // 메모리에 로드된 데이터는 다 담아놓고 실제 Dom에 그리는 데이터는 2-3개로 제한할 수 있음
  useEffect(() => {
    function onScroll() {
      // 이렇게 하면 다음 로딩하는데 까지 약간의 시간이 걸리기 때문에 300px 정도 위에서 미리 로딩
      if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
        if (hasMorePost && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1].id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId: lastId,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [mainPosts, hasMorePost, loadPostsLoading]);

  const { me } = useSelector((state) => state.user);

  return (
    <AppLayout>
      { me && <PostForm /> }
      { mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  )
}

/* 프론트 서버에서 백앤드 서버로 요청 보내는 부분 */
export const getServerSideProps = wrapper.getServerSideProps(store => async ({req, res, next}) => {
  const cookie = req ? req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; 
  if (req && cookie) {
    axios.defaults.headers.Cookie = cookie; 
  }
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  })
  store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  store.dispatch(END);
  await store.sagaTask.toPromise();
});

export default Home;
import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Popover, Button, Avatar, List, Comment } from "antd";
import { RetweetOutlined, HeartOutlined, HeartTwoTone, MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import PostImages from './PostImages';
import PostCardContent from './PostCardContent';
import CommentForm from './CommnetForm';
import FollowButton from './FollowButton';
import { REMOVE_POST_REQUEST } from '../reducers/post';

const PostCard = ({ post }) => {
  const id = useSelector((state) => state.user.me?.id);
  const { removeCommentLoading } = useSelector((state) => state.post);
  const dispatch = useDispatch();
  // optional chaning 연산자 - me가 있으면 id가 들어가고 없으면 undefined가 들어가는 연산자
  // const id = me?.id;
  const [liked, setLiked] = useState(false);
  const [commentFormOpened, setCommentFormOpened] = useState(false);

  const onToggleLike = useCallback((e) => {
    console.log("onToggelLike", e.target);
    setLiked((prev) => !prev);
  }, []);

  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, []);

  const onRemovePost = useCallback(() => {
    dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id
    })
  }, []);

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Card 
          cover={post.Images[0] && <PostImages images={post.Images} />} 
          actions={[
            <RetweetOutlined key='retweet'/>,
            liked 
              ? <HeartTwoTone twoToneColor='#eb2f96' key='heart' onClick={onToggleLike}/>
              : <HeartOutlined key='heart' onClick={onToggleLike} />,
            <MessageOutlined key='comment' onClick={onToggleComment}/>,
            <Popover key='more' content={(
              <Button.Group>
                {id && post.User.id === id ? (
                  <>
                    <Button>수정</Button>
                    <Button type='danger' onClick={onRemovePost} loading={ removeCommentLoading }>삭제</Button>
                  </>
                ) : 
                <Button>신고</Button>}
              </Button.Group>
            )}>
              <EllipsisOutlined />
            </Popover>
          ]}
          extra={id && <FollowButton post={post}/>}
          >
          <Card.Meta 
            avatar={<Avatar>{post.User.nickname}</Avatar>}
            title={post.User.nickname}
            description={<PostCardContent postData={post.content} />}>
          </Card.Meta>
          <Button></Button>
        </Card>
        {
          commentFormOpened && 
          <div>
            <CommentForm post={post}/>
            <List 
              header={ `${post.Comments.length}개의 댓글` }
              itemLayout='horizontal'
              dataSource={post.Comments}
              renderItem={(item) => (
                <li>
                  <Comment 
                    author={item.User.nickname}
                    avatar={<Avatar>{item.User.nickname}</Avatar>}
                    content={item.content}
                  />
                </li>
              )}
            />
          </div>
        }
      </div>
    </>
  )
}

PostCard.propTypes= {
  // object props 는 shape를 이용해서 구체적으로 정의가능
  post: PropTypes.shape({
    id: PropTypes.string,
    User: PropTypes.object,
    content: PropTypes.string,
    createAt: PropTypes.object,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object)

  }).isRequired,
};

export default PostCard;
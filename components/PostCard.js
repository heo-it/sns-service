import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Card, Popover, Button, Avatar, List, Comment } from "antd";
import { RetweetOutlined, HeartOutlined, HeartTwoTone, MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import CommentForm from './CommnetForm';

const PostCard = ({ post }) => {
  const id = useSelector((state) => state.user.me?.id);
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
                    <Button type='danger'>삭제</Button>
                  </>
                ) : 
                <Button>신고</Button>}
              </Button.Group>
            )}>
              <EllipsisOutlined />
            </Popover>
          ]}>
          <Card.Meta 
            avatar={<Avatar>{post.User.nickname}</Avatar>}
            title={post.User.nickname}
            description={post.content}>
          
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
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createAt: PropTypes.object,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object)

  }).isRequired,
};

export default PostCard;
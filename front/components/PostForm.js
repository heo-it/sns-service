import React, { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Input } from 'antd';
import { ADD_POST_REQUEST } from '../reducers/post';
import useInput from './hooks/useInput';
import { UPLOAD_IMAGES_REQUEST, REMOVE_IMAGES } from '../reducers/post';
import imageButton from '../assets/images/image.png';

import { AlignRightButton } from '../assets/styles/global';
import styles from '../assets/styles/component/postForm.module.css';

const PostForm = () => {
  const { imagePaths, addPostDone } = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const [text, onChangeText, setText] = useInput('');
  
  useEffect(() => {
    if (addPostDone) {
      setText('');
    }
  }, [addPostDone]);

  // 실제 Dom에 접근하기 위해서 ref를 사용함.
  const imageInput = useRef();
  const onClickImageUpload = useCallback(() =>{
    imageInput.current.click();
  }, [imageInput.current]);

  const onSubmit = useCallback(() => {
    if (!text || !text.trim()) {
      return alert('게시글을 작성하세요.');
    }
    const formData = new FormData();
    imagePaths && imagePaths.forEach((p) => {
      formData.append('image', p);
    });
    formData.append('content', text);
    return dispatch({
      type: ADD_POST_REQUEST,
      data: formData,
    });
  }, [text, imagePaths]);

  const onChangeImages = useCallback((e) => {
    const imageFormData = new FormData();
    [].forEach.call(e.target.files, (f) => {
      imageFormData.append('image', f);
    });
    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, []);

  // 프론트 단에서만 이미지를 제거함
  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_IMAGES,
      data: index,
    })
  }, []);

  return (
    <>
      <div className={styles.container}>
        <Form className={styles.form} encType="multipart/form-data" onFinish={onSubmit}>
          <Input.TextArea
            rows={6}
            value={text}
            bordered={false}
            autoSize={{ minRows: 5, maxRows: 5 }}
            maxLength={200}
            showCount
            placeholder="문구 입력..."
            onChange={onChangeText}
          />
          <div>
            <input type="file" multiple hidden ref={imageInput} onChange={onChangeImages} />
          </div>
          <div>
            {
              imagePaths &&
                imagePaths.map((v, i) => (
                  <div className={styles.image} key={v}>
                    <img src={v} alt={v} />
                    <div>
                      <Button onClick={onRemoveImage(i)} >제거</Button>
                    </div>
                  </div>
              ))
            }
          </div>
          <div className={styles.imageButton}>
            <img src={imageButton} alt="" onClick={onClickImageUpload}/>
            <AlignRightButton htmlType='submit'>업로드</AlignRightButton>
          </div>
        </Form>
      </div>
    </>
  )
}
  
export default PostForm;
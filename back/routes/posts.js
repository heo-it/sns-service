const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();

const { Post, User, Image, Comment } = require('../models');

router.get('/', async (req, res, next) => { //GET /posts
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
      where.id = { [Op.lt] : parseInt(req.query.lastId, 10)}
    }

    const posts = await Post.findAll({
      where,
      limit: 10,
      // offset: 0, // 0 ~ 10 가져오는데 게시글 추가, 삭제 할 때 문제가 생기므로 이 방법은 잘 사용하지 않음
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC'],
      ],
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }]
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          as: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }]
    });
    res.status(200).json(posts);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
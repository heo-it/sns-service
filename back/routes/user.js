const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Op } = require('sequelize');

const { User, Post, Image, Comment } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

// refresh 할 때 로그인 유지하기
router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ['password']
        },
        include: [{
          model: Post,
          attributes: ['id'], // 데이터 효율을 위해 id만 가져옴 (attributes)
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      });
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* 팔로우 목록 불러오기 */ 
router.get('/followers', isLoggedIn, async (req, res, next) => { // GET /user/followers
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('가입하지 않은 회원입니다.');
    }
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit),
    });
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) => { // GET /user/followings
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('가입하지 않은 회원입니다.');
    }
    const followings = await user.getFollowers({
      limit: parseInt(req.query.limit),
    });
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId', async (req, res, next) => { // GET /user/1
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Post,
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      }]
    })
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length; // 개인정보 침해 예방
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      res.status(200).json(data);
    } else {
      res.status(404).json('존재하지 않는 사용자입니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId/posts', async (req, res, next) => { //GET /user/:userId/posts
  try {
    const where = { UserId: req.params.userId };
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

// 미들웨어 확장 - passport.authenticate는 원래 req, res, next를 사용할 수 없는데 다음과 같이 확장하여 사용가능함
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // callback 함수
    if (err) {
      console.error(err);
      next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    req.login(user, async (loginErr) => {
      // passport login 에러시 
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        // 이렇게 지정가능 아래처럼 제외가능
        // attributes: ['id', 'nickname', 'email']
        attributes: {
          exclude: ['password']
        },
        // user 데이터에 추가 해주는 로직
        include: [{
          model: Post
        }, {
          model: User,
          as: 'Followings'
        }, {
          model: User,
          as: 'Followers'
        }]
      })
      return res.status(200).json(fullUserWithoutPassword);
    })
  })(req, res, next);
});

router.post('/', isNotLoggedIn, async (req, res, next) => {  // POST /user/
  try {
    // 아이디 중복 처리
    const exUser = await User.findOne({
      // 조건
      where: {
        email: req.body.email,
      }
    });

    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }

    // 데이터를 해쉬화 하는 라이브러리
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // 순차적으로 실행하기 위해 await 해줘야함
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword
    });
    // 이렇게 브라우저에서 허용해주던가
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send('ok');
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/logout', isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => { // PATCH /user/
  try {
    await User.update({
      nickname: req.body.nickname,
    }, {
      where: { id: req.user.id },
    });
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* 팔로우 팔로잉 하기 */
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('가입하지 않은 회원입니다.');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => { // DELETE /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('가입하지 않은 회원입니다.');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });s
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => { // DELETE /user/follower/1
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('가입하지 않은 회원입니다.');
    }
    await user.removeFollowing(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });s
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
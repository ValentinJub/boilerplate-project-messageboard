'use strict'

const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const Board = require('../models/board');

router.get('/:board', async (req, res) => {
  try {
    let board = await Board.findOne({ text: req.params.board });
    if(!board) {
      board = await createBoard(req.params.board);
    }
    res.render('board');
  }
  catch(e) {
    console.log(e);
    res.send({error: e});
  }
});

router.get('/:board/:thread_id', async (req, res) => {
  try {
    let thread = await Thread.findById(req.params.thread_id);
    res.render('thread', {thread: thread});
  }
  catch(e) {
    console.log(e);
    res.send({error: e});
  }
});

function createBoard(board) {
  return new Board({
    text: board
  }).save();
}


module.exports = router;
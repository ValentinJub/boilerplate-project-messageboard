const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const Board = require('../models/board');
const Reply = require('../models/reply');
const hash = require("../public/hash.js")

router.get('/:board', async (req, res) => {
  try {
    let board = await Board.findOne({ text: req.params.board });
    if(!board) {
      board = await createBoard(req.params.board);
    }
    const threads = await returnThreads(board._id);
    res.send(threads);
  } 
  catch (e) {
    console.log(e); 
    res.send({error: e});
  }
});

//post a new thread
router.post('/:board', async (req, res) => {
  let time = Date.now();
  let { text, delete_password } = req.body;
  let hashedPassword = hash.hashPassword(delete_password);
  try {
    let parent_board = await Board.findOne({ text: req.params.board });
    if(!parent_board) {
      parent_board = await createBoard(req.params.board);
    }
    let thread = await new Thread({
      board: parent_board.id,
      text: text,
      password: hashedPassword,
      created_on: time,
      bumped_on: time
    }).save();
    res.redirect(`/b/${req.params.board}`);
  } catch (e) {
    console.log(e)
    res.send({error: e})
  }
});

//report a thread
router.put('/:board', async (req, res) => {
  try {
    let thread = await Thread.findByIdAndUpdate(req.body.thread_id, { reported: true }); 
    res.send("reported")
  } catch (e) {
   console.log(e) 
   res.send({error: e})
  }
});

//delete a thread
router.delete('/:board', async (req, res) => {
  let { thread_id, delete_password } = req.body;
  try {
    let thread = await Thread.findById(thread_id) 
    if(hash.comparePassword(delete_password, thread.password)) {
      await Thread.findByIdAndDelete(thread_id);
      await Reply.deleteMany({ thread: thread_id });
      res.send("success");
    } else {
      res.send("incorrect password");
    }
  } catch (e) {
    console.log(e)
    res.send({error: e})
  }
});

async function returnReplies(thread_id) {
  try {
    //get all replies for a thread
    let replies = await Reply.find({ thread: thread_id }).sort({ created_on: -1 });
    return replies.map(reply => {
      return {
        _id: reply._id,
        text: reply.text,
        created_on: reply.created_on
      }
    });
  }
  catch (e) {
    console.log(e);
    return null;
  }
}

async function returnThreads(board_id) {
  try {
    //get the 10 most recent threads
    const threads = await Thread.find({ board: board_id })
      .sort({ bumped_on: -1 })
      .limit(10)
    //convert threads to json
    let jsonedThreads = threads.map(thread => {
      return {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
      }
    });
    //add replycount and replies to each thread
    //using a for loop because I need to use await
    for (let inc in jsonedThreads) {
      const reply = await returnReplies(jsonedThreads[inc]._id);
      jsonedThreads[inc].replycount = reply.length;
      jsonedThreads[inc].replies = reply.slice(0,3);
    }
    return jsonedThreads;
  } catch (e) {
  console.log(e);
  return null;
  }
}


async function createBoard(board) {
  return new Board({
    text: board,
    threads: []
  }).save();
}

function mongoReset() {
  Board.collection.drop((err, res) => {
    if(err) console.log(err);
    console.log(res);
  })
  Thread.collection.drop((err, res) => {
    if(err) console.log(err);
    console.log(res);
  })
  Reply.collection.drop((err, res) => {
    if(err) console.log(err);
    console.log(res);
  })
}

module.exports = router;
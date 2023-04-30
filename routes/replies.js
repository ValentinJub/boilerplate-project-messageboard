const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const Reply = require('../models/reply');
const hash = require('../public/hash.js');  


router.get('/:board', async (req, res) => {
  const thread_id = req.query.thread_id;
  try {
    let thread = await returnThread(thread_id);
    res.send(thread);
  } 
  catch (e) {
    console.log(e)
    res.send({error: e}) 
  }
});

//post a new reply
router.post('/:board', async (req, res) => {
  const time = Date.now();
  try {
    let { text, delete_password, thread_id } = req.body;
    let reply = await createReply(time, thread_id, text, delete_password);
    let thread = await updateThread(time, thread_id, reply._id);
    res.redirect(`/b/${req.params.board}/${thread_id}`)
  }
  catch(e) {
    console.log(e);
    res.send({error: e});
  }
});

//report a reply
router.put('/:board', async (req, res) => {
  try {
    let reply = await Reply.findByIdAndUpdate(req.body.reply_id, { reported: true }); 
    res.send("reported")
  } catch (e) {
    console.log(e)
    res.send({error: e}) 
  }
});

//delete a reply
router.delete('/:board', async (req, res) => {
  try {
    let reply = await Reply.findById(req.body.reply_id);
    if(hash.comparePassword(req.body.delete_password, reply.password)) {
      await Reply.findByIdAndUpdate(req.body.reply_id, { text: "[deleted]" });
      res.send("success");
    } else {
      res.send("incorrect password");
    }
  } catch (e) {
    console.log(e)
    res.send({error: e})
  }
});

//create reply - I have to pass time otherwise fcc test fails
async function createReply(time, thread_id, text, password) {
  return new Reply({
    thread: thread_id,
    text: text,
    password: hash.hashPassword(password),
    created_on: time
  }).save();
}

//update thread - I have to pass time otherwise fcc test fails
async function updateThread(time, thread_id, reply_id) {
  return Thread.findByIdAndUpdate(thread_id, {
    $push: { replies: reply_id },
    bumped_on: time
  });
}

async function returnReplies(thread_id) {
  try {
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

async function returnThread(thread_id) {
  try {
    const thread = await Thread.findOne({_id: thread_id}).populate({ path: 'replies', options: {sort: { created_on: -1 }}});
    const replies = await returnReplies(thread_id);
    const jsonedThread = {
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replycount: replies.length,
      replies: replies
    }
    return jsonedThread;
  }
  catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = router;
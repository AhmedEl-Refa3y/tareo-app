import express from "express";
import axios from "axios";
import Session from "../models/Session";
import Message from "../models/Message";
import { protect } from "../middleware/auth";

const router = express.Router();

const KB_URL = "http://127.0.0.1:8000";

router.post("/start", protect, async (req: any, res) => {
  try {
    const session = await Session.create({
      patientId: req.user._id,
      type: "chat",
      status: "active",
    });

    const kbRes = await axios.post(`${KB_URL}/kb/start`);

    const doctorMessage = await Message.create({
      sessionId: session._id,
      senderId: req.user._id,
      senderType: "doctor",
      content: kbRes.data.response,
    });

    res.json({
      session,
      messages: [doctorMessage],
    });
  } catch (error) {
    console.error("AI start error:", error);
    res.status(500).json({ message: "Failed to start AI chat" });
  }
});

router.post("/message", protect, async (req: any, res) => {
  try {
    const { sessionId, message } = req.body;

    const userMessage = await Message.create({
      sessionId,
      senderId: req.user._id,
      senderType: "patient",
      content: message,
    });

    const kbRes = await axios.post(`${KB_URL}/kb/chat`, {
      message,
    });

    const doctorMessage = await Message.create({
      sessionId,
      senderId: req.user._id,
      senderType: "doctor",
      content: kbRes.data.response,
    });

    res.json({
      userMessage,
      doctorMessage,
      state: kbRes.data.state,
    });
  } catch (error) {
    console.error("AI message error:", error);
    res.status(500).json({ message: "Failed to send AI message" });
  }
});

router.post("/new-chat", protect, async (req: any, res) => {
  try {
    const { oldSessionId } = req.body;

    if (oldSessionId) {
      await Session.findByIdAndUpdate(oldSessionId, {
        status: "ended",
        endedAt: new Date(),
      });
    }

    const session = await Session.create({
      patientId: req.user._id,
      type: "chat",
      status: "active",
    });

    const kbRes = await axios.post(`${KB_URL}/kb/reset`);

    const doctorMessage = await Message.create({
      sessionId: session._id,
      senderId: req.user._id,
      senderType: "doctor",
      content: kbRes.data.response,
    });

    res.json({
      session,
      messages: [doctorMessage],
    });
  } catch (error) {
    console.error("AI new chat error:", error);
    res.status(500).json({ message: "Failed to create new chat" });
  }
});

router.post("/end", protect, async (req: any, res) => {
  try {
    const { sessionId } = req.body;

    await Session.findByIdAndUpdate(sessionId, {
      status: "ended",
      endedAt: new Date(),
    });

    await axios.post(`${KB_URL}/kb/reset`);

    res.json({ success: true });
  } catch (error) {
    console.error("AI end error:", error);
    res.status(500).json({ message: "Failed to end chat" });
  }
});

//  Load latest chat session for current patient
router.get("/latest-session", protect, async (req: any, res) => {
  try {
    let session = await Session.findOne({
      patientId: req.user._id,
      type: "chat",
    }).sort({ createdAt: -1 });

    // لو مفيش أي جلسة قبل كده، اعمل واحدة جديدة
    if (!session) {
      session = await Session.create({
        patientId: req.user._id,
        type: "chat",
        status: "active",
      });

      const kbRes = await axios.post(`${KB_URL}/kb/start`);

      const doctorMessage = await Message.create({
        sessionId: session._id,
        senderId: req.user._id,
        senderType: "doctor",
        content: kbRes.data.response,
      });

      return res.json({
        session,
        messages: [doctorMessage],
      });
    }

    // لو فيه جلسة قديمة، رجّع رسائلها
    const messages = await Message.find({ sessionId: session._id }).sort({
      createdAt: 1,
    });

    return res.json({
      session,
      messages,
    });
  } catch (error) {
    console.error("Latest session error:", error);
    res.status(500).json({ message: "Failed to load latest session" });
  }
});
export default router;
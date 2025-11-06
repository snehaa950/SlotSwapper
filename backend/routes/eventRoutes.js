import express from "express";
import Event from "../models/event.js";
import SwapRequest from "../models/swapRequest.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================================
   ✅ CREATE EVENT
================================ */
router.post("/", auth, async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;

    const newEvent = new Event({
      title,
      startTime,
      endTime,
      owner: req.user.id,
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully!", event: newEvent });
  } catch (error) {
    console.error("❌ Event creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ GET USER EVENTS
================================ */
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id });
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ MAKE EVENT SWAPPABLE
================================ */
router.patch("/:id/make-swappable", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "SWAPPABLE";
    await event.save();

    res.json({ message: "Event marked as swappable!", event });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ GET ALL SWAPPABLE SLOTS (OTHERS)
================================ */
router.get("/swappable-slots", auth, async (req, res) => {
  try {
    const slots = await Event.find({
      status: "SWAPPABLE",
      owner: { $ne: req.user.id },
    }).populate("owner", "name email");

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ REQUEST A SWAP
================================ */
router.post("/swap-request", auth, async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: "One or both slots not found" });

    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
      return res.status(400).json({ message: "Both slots must be swappable" });

    const newRequest = new SwapRequest({
      requester: req.user.id,
      receiver: theirSlot.owner,
      mySlot: mySlotId,
      theirSlot: theirSlotId,
    });

    await newRequest.save();

    // mark both slots as pending
    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";
    await mySlot.save();
    await theirSlot.save();

    res
      .status(201)
      .json({ message: "Swap request sent!", request: newRequest });
  } catch (error) {
    console.error("❌ Swap request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ RESPOND TO SWAP REQUEST
================================ */
router.post("/swap-response/:id", auth, async (req, res) => {
  try {
    const { accept } = req.body;

    const request = await SwapRequest.findById(req.params.id)
      .populate("mySlot")
      .populate("theirSlot");

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (String(request.receiver) !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (accept) {
      // Swap owners
      const tempOwner = request.mySlot.owner;
      request.mySlot.owner = request.theirSlot.owner;
      request.theirSlot.owner = tempOwner;

      request.mySlot.status = "BUSY";
      request.theirSlot.status = "BUSY";
      request.status = "ACCEPTED";
    } else {
      request.mySlot.status = "SWAPPABLE";
      request.theirSlot.status = "SWAPPABLE";
      request.status = "REJECTED";
    }

    await request.mySlot.save();
    await request.theirSlot.save();
    await request.save();

    res.json({ message: `Swap ${accept ? "accepted" : "rejected"}!`, request });
  } catch (error) {
    console.error("❌ Swap response error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

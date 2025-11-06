import express from "express";
import auth from "../middleware/auth.js";
import Event from "../models/event.js";
import SwapRequest from "../models/swapRequest.js";
import User from "../models/user.js";

const router = express.Router();

/**
 * 🟢 GET /api/swappable-slots
 * Get all swappable events from other users
 */
router.get("/swappable-slots", auth, async (req, res) => {
  try {
    const slots = await Event.find({
      status: "SWAPPABLE",
      owner: { $ne: req.user.id }, // exclude logged-in user's slots
    }).populate("owner", "name email");

    res.json({ slots });
  } catch (error) {
    console.error("Error fetching swappable slots:", error);
    res.status(500).json({ message: "Failed to load swappable slots" });
  }
});

/**
 * 🟢 GET /api/my-slots
 * Get logged-in user’s own swappable events
 */
router.get("/my-slots", auth, async (req, res) => {
  try {
    const slots = await Event.find({
      owner: req.user.id,
      status: "SWAPPABLE",
    });
    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load your slots" });
  }
});

/**
 * 🟢 POST /api/slot-requests
 * Send a swap request to another user
 */
router.post("/slot-requests", auth, async (req, res) => {
  try {
    const { mySlotId, targetSlotId } = req.body;

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(targetSlotId);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: "One or both slots not found" });
    }

    const swapRequest = new SwapRequest({
      requester: req.user.id,
      receiver: theirSlot.owner,
      mySlot: mySlotId,
      theirSlot: targetSlotId,
      status: "PENDING",
    });

    await swapRequest.save();
    res.json({ message: "Swap request sent!", request: swapRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send swap request" });
  }
});

/**
 * 🟢 GET /api/swap-requests
 * Get all swap requests involving the logged-in user
 */
router.get("/swap-requests", auth, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }],
    })
      .populate("requester", "name email")
      .populate("receiver", "name email")
      .populate("mySlot")
      .populate("theirSlot")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    res.status(500).json({ message: "Failed to load swap requests." });
  }
});

/**
 * 🟢 PATCH /api/swap-requests/:id/accept
 * Accept a swap request → swap event owners
 */
router.patch("/swap-requests/:id/accept", auth, async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("mySlot")
      .populate("theirSlot");

    if (!request) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Verify receiver owns the "theirSlot"
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Swap event owners
    const mySlot = await Event.findById(request.mySlot._id);
    const theirSlot = await Event.findById(request.theirSlot._id);

    const tempOwner = mySlot.owner;
    mySlot.owner = theirSlot.owner;
    theirSlot.owner = tempOwner;

    mySlot.status = "BUSY";
    theirSlot.status = "BUSY";

    await mySlot.save();
    await theirSlot.save();

    request.status = "ACCEPTED";
    await request.save();

    res.json({ message: "Swap accepted!", request });
  } catch (error) {
    console.error("Error accepting swap:", error);
    res.status(500).json({ message: "Failed to accept swap request" });
  }
});

/**
 * 🟢 PATCH /api/swap-requests/:id/reject
 * Reject a swap request
 */
router.patch("/swap-requests/:id/reject", auth, async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    request.status = "REJECTED";
    await request.save();

    res.json({ message: "Swap rejected", request });
  } catch (error) {
    console.error("Error rejecting swap:", error);
    res.status(500).json({ message: "Failed to reject swap request" });
  }
});

export default router;

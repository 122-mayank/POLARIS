import Expedition from "../models/Expedition.js";

// CREATE EXPEDITION
const createExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.create(req.body);

    res.status(201).json({
      success: true,
      message: "Expedition created successfully",
      data: expedition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create expedition",
      error: error.message
    });
  }
};


// GET ALL EXPEDITIONS
const getAllExpeditions = async (req, res) => {
  try {
    const expeditions = await Expedition.find();

    res.status(200).json({
      success: true,
      count: expeditions.length,
      data: expeditions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expeditions",
      error: error.message
    });
  }
};


// GET SINGLE EXPEDITION
const getExpeditionById = async (req, res) => {
  try {
    const expedition = await Expedition.findById(req.params.id);

    if (!expedition) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found"
      });
    }

    res.status(200).json({
      success: true,
      data: expedition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expedition",
      error: error.message
    });
  }
};


// UPDATE EXPEDITION
const updateExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!expedition) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Expedition updated successfully",
      data: expedition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update expedition",
      error: error.message
    });
  }
};


// DELETE EXPEDITION
const deleteExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.findByIdAndDelete(
      req.params.id
    );

    if (!expedition) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Expedition deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete expedition",
      error: error.message
    });
  }
};


// EXPORT
export {
  createExpedition,
  getAllExpeditions,
  getExpeditionById,
  updateExpedition,
  deleteExpedition
};
const Blacklist = require('../models/Blacklist');

exports.addToBlacklist = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientCIN,
      reason
    } = req.body;

    const existing = await Blacklist.findOne({
      clientCIN,
      partnerId: req.user.id
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Ce client est déjà dans votre liste noire' 
      });
    }

    const blacklistedClient = new Blacklist({
      clientName,
      clientEmail,
      clientPhone,
      clientCIN,
      reason,
      partnerId: req.user.id,
      addedBy: req.user.name
    });

    await blacklistedClient.save();

    res.status(201).json({
      success: true,
      message: 'Client ajouté à la liste noire avec succès',
      blacklistedClient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'ajout à la liste noire' 
    });
  }
};

exports.getMyBlacklist = async (req, res) => {
  try {
    const blacklist = await Blacklist.find({ partnerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      blacklist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de la liste noire' 
    });
  }
};

exports.checkBlacklist = async (req, res) => {
  try {
    const { email, cin } = req.query;

    let query = { partnerId: req.user.id };
    if (email) query.clientEmail = email;
    if (cin) query.clientCIN = cin;

    const blacklisted = await Blacklist.findOne(query);

    res.json({
      success: true,
      isBlacklisted: !!blacklisted,
      client: blacklisted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la vérification' 
    });
  }
};

exports.removeFromBlacklist = async (req, res) => {
  try {
    const blacklisted = await Blacklist.findById(req.params.id);
    
    if (!blacklisted) {
      return res.status(404).json({ 
        success: false,
        message: 'Client non trouvé dans la liste noire' 
      });
    }

    if (blacklisted.partnerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès non autorisé à cette entrée' 
      });
    }

    await Blacklist.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Client retiré de la liste noire avec succès' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression' 
    });
  }
};

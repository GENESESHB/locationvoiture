// controllers/contractController.js
const Contract = require('../models/Contract');
const Blacklist = require('../models/Blacklist');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

exports.createContract = async (req, res) => {
  try {
    const {
      // Client information
      clientLastName,
      clientFirstName,
      clientBirthDate,
      clientPhone,
      clientAddress,
      clientPassport,
      clientCIN,
      clientLicenseNumber,
      clientLicenseIssueDate,

      // Second driver information
      secondDriverLastName,
      secondDriverFirstName,
      secondDriverLicenseNumber,
      secondDriverLicenseIssueDate,

      // Vehicle information
      vehicleId,

      // Rental information
      startDateTime,
      endDateTime,
      startLocation,
      endLocation,

      // Price information
      prixParJour
    } = req.body;

    console.log('📥 Données reçues pour le contrat:', req.body);
    console.log('👤 User ID from token:', req.user.id);

    // Fetch the complete user information from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user._id,
      name: user.name,
      entreprise: user.entreprise,
      email: user.email
    });

    // Fetch vehicle information from database
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    console.log('🚗 Véhicule trouvé:', {
      id: vehicle._id,
      name: vehicle.name,
      type: vehicle.type,
      boiteVitesse: vehicle.boiteVitesse,
      partnerId: vehicle.partnerId,
      pricePerDay: vehicle.pricePerDay
    });

    // Verify that the vehicle belongs to the current user
    if (vehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    // Check vehicle availability
    const overlappingContracts = await Contract.findOverlappingContracts(
      vehicleId,
      startDateTime,
      endDateTime
    );

    if (overlappingContracts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Le véhicule n\'est pas disponible pour ces dates',
        conflictingDates: overlappingContracts.map(contract => ({
          start: contract.startDateTime,
          end: contract.endDateTime
        }))
      });
    }

    // Check blacklist using CIN or passport
    if (clientCIN || clientPassport) {
      const isBlacklisted = await Blacklist.checkBlacklist({
        clientCIN: clientCIN,
        clientPassport: clientPassport,
        clientLicenseNumber: clientLicenseNumber
      });
      if (isBlacklisted) {
        return res.status(400).json({
          success: false,
          message: 'Ce client est dans la liste noire! Contrat non autorisé.'
        });
      }
    }

    // Use custom price if provided, otherwise use vehicle's price
    const dailyPrice = parseFloat(prixParJour) || vehicle.pricePerDay;

    // ✅ AJOUT: Calcul de la durée et du prix total
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const prixTotal = durationDays * dailyPrice;

    console.log('💰 Calculs prix et durée:', {
      durationDays,
      prixTotal,
      dailyPrice,
      start: start.toISOString(),
      end: end.toISOString()
    });

    // Create the contract with vehicle information
    const contract = new Contract({
      // Client information
      clientLastName,
      clientFirstName,
      clientBirthDate: new Date(clientBirthDate),
      clientPhone,
      clientAddress,
      clientPassport: clientPassport || '',
      clientCIN: clientCIN || '',
      clientLicenseNumber,
      clientLicenseIssueDate: new Date(clientLicenseIssueDate),

      // Second driver information
      secondDriverLastName: secondDriverLastName || '',
      secondDriverFirstName: secondDriverFirstName || '',
      secondDriverLicenseNumber: secondDriverLicenseNumber || '',
      secondDriverLicenseIssueDate: secondDriverLicenseIssueDate ?
        new Date(secondDriverLicenseIssueDate) : null,

      // Vehicle information (inherit vehicle details)
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      vehicleBoiteVitesse: vehicle.boiteVitesse,
      vehicleDescription: vehicle.description,
      vehiclePricePerDay: vehicle.pricePerDay,
      vehicleMarque: vehicle.marque,
      vehicleModele: vehicle.modele,
      vehicleAnnee: vehicle.annee,
      vehicleCouleur: vehicle.couleur,
      vehicleCarburant: vehicle.carburant,
      vehiclePlaqueImmatriculation: vehicle.plaqueImmatriculation,

      // Rental information
      startDateTime: start,
      endDateTime: end,
      startLocation,
      endLocation,

      // ✅ AJOUT: Prix et durée calculés
      durationDays,
      prixTotal,
      prixParJour: dailyPrice,

      // Partner information
      partnerId: user._id,
      partnerName: user.entreprise,
      partnerEmail: user.email,

      // Status
      status: 'pending'
    });

    console.log('📄 Contrat à créer:', {
      client: `${contract.clientFirstName} ${contract.clientLastName}`,
      vehicleId: contract.vehicleId,
      dates: `${contract.startDateTime} to ${contract.endDateTime}`,
      partner: contract.partnerName,
      durationDays: contract.durationDays,
      prixTotal: contract.prixTotal
    });

    await contract.save();

    console.log('✅ Contrat créé avec informations véhicule héritées:', {
      vehicleName: contract.vehicleName,
      vehicleType: contract.vehicleType,
      vehiclePricePerDay: contract.vehiclePricePerDay,
      prixTotal: contract.prixTotal,
      durationDays: contract.durationDays
    });

    // Populate the contract with vehicle information
    const populatedContract = await Contract.findById(contract._id)
      .populate('vehicleId', 'name type boiteVitesse pricePerDay marque modele annee couleur carburant plaqueImmatriculation')
      .populate('partnerId', 'name entreprise email');

    res.status(201).json({
      success: true,
      message: 'Contrat créé avec succès',
      contract: populatedContract
    });
  } catch (error) {
    console.error('❌ Erreur création contrat:', error);

    // More detailed error information
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de contrat déjà existant'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du contrat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMyContracts = async (req, res) => {
  try {
    console.log('📋 Récupération des contrats pour user ID:', req.user.id);

    const { status, page = 1, limit = 10 } = req.query;

    let query = { partnerId: req.user.id };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const contracts = await Contract.find(query)
      .populate('vehicleId', 'name type boiteVitesse pricePerDay marque modele annee couleur carburant plaqueImmatriculation')
      .populate('partnerId', 'name entreprise email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contract.countDocuments(query);

    console.log(`✅ ${contracts.length} contrats trouvés`);

    res.json({
      success: true,
      contracts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Erreur récupération contrats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contrats'
    });
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('vehicleId', 'name type boiteVitesse pricePerDay marque modele annee couleur carburant plaqueImmatriculation')
      .populate('partnerId', 'name entreprise email');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    if (contract.partnerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    res.json({
      success: true,
      contract
    });
  } catch (error) {
    console.error('❌ Erreur récupération contrat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const {
      // Client information
      clientLastName,
      clientFirstName,
      clientBirthDate,
      clientPhone,
      clientAddress,
      clientPassport,
      clientCIN,
      clientLicenseNumber,
      clientLicenseIssueDate,

      // Second driver information
      secondDriverLastName,
      secondDriverFirstName,
      secondDriverLicenseNumber,
      secondDriverLicenseIssueDate,

      // Vehicle information
      vehicleId,

      // Rental information
      startDateTime,
      endDateTime,
      startLocation,
      endLocation,

      // Price information
      prixParJour,

      // Status
      status
    } = req.body;

    // Fetch user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Find existing contract
    const existingContract = await Contract.findById(req.params.id);
    if (!existingContract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    if (existingContract.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    let vehicle = null;
    if (vehicleId && vehicleId !== existingContract.vehicleId.toString()) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.partnerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à ce véhicule'
        });
      }
    } else {
      vehicle = await Vehicle.findById(existingContract.vehicleId);
    }

    // ✅ AJOUT: Calcul de la durée et du prix total pour la mise à jour
    const start = new Date(startDateTime || existingContract.startDateTime);
    const end = new Date(endDateTime || existingContract.endDateTime);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const dailyPrice = parseFloat(prixParJour) || existingContract.prixParJour;
    const prixTotal = durationDays * dailyPrice;

    // Check for overlapping contracts if dates or vehicle changed
    if (
      (startDateTime && startDateTime !== existingContract.startDateTime.toISOString()) ||
      (endDateTime && endDateTime !== existingContract.endDateTime.toISOString()) ||
      (vehicleId && vehicleId !== existingContract.vehicleId.toString())
    ) {
      const overlappingContracts = await Contract.findOverlappingContracts(
        vehicleId || existingContract.vehicleId,
        startDateTime || existingContract.startDateTime,
        endDateTime || existingContract.endDateTime,
        req.params.id // Exclude current contract
      );

      if (overlappingContracts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Le véhicule n\'est pas disponible pour ces dates',
          conflictingDates: overlappingContracts.map(contract => ({
            start: contract.startDateTime,
            end: contract.endDateTime
          }))
        });
      }
    }

    // Update contract using findByIdAndUpdate to trigger pre-save middleware
    const updateData = {
      // Client information
      clientLastName,
      clientFirstName,
      clientBirthDate: new Date(clientBirthDate),
      clientPhone,
      clientAddress,
      clientPassport: clientPassport || '',
      clientCIN: clientCIN || '',
      clientLicenseNumber,
      clientLicenseIssueDate: new Date(clientLicenseIssueDate),

      // Second driver information
      secondDriverLastName: secondDriverLastName || '',
      secondDriverFirstName: secondDriverFirstName || '',
      secondDriverLicenseNumber: secondDriverLicenseNumber || '',
      secondDriverLicenseIssueDate: secondDriverLicenseIssueDate ?
        new Date(secondDriverLicenseIssueDate) : null,

      // Rental information
      startDateTime: start,
      endDateTime: end,
      startLocation,
      endLocation,

      // ✅ AJOUT: Prix et durée calculés
      durationDays,
      prixTotal,
      prixParJour: dailyPrice,

      // Partner information
      partnerName: user.entreprise,

      // Status
      status: status || existingContract.status
    };

    // Update vehicle information if changed
    if (vehicleId && vehicleId !== existingContract.vehicleId.toString()) {
      updateData.vehicleId = vehicleId;
      updateData.vehicleName = vehicle.name;
      updateData.vehicleType = vehicle.type; // ✅ CORRECTION: = au lieu de :
      updateData.vehicleBoiteVitesse = vehicle.boiteVitesse; // ✅ CORRECTION
      updateData.vehicleDescription = vehicle.description; // ✅ CORRECTION
      updateData.vehiclePricePerDay = vehicle.pricePerDay; // ✅ CORRECTION
      updateData.vehicleMarque = vehicle.marque; // ✅ CORRECTION
      updateData.vehicleModele = vehicle.modele; // ✅ CORRECTION
      updateData.vehicleAnnee = vehicle.annee; // ✅ CORRECTION
      updateData.vehicleCouleur = vehicle.couleur; // ✅ CORRECTION
      updateData.vehicleCarburant = vehicle.carburant; // ✅ CORRECTION
      updateData.vehiclePlaqueImmatriculation = vehicle.plaqueImmatriculation; // ✅ CORRECTION
    }

    console.log('📝 Mise à jour du contrat:', {
      contractId: req.params.id,
      client: `${clientFirstName} ${clientLastName}`,
      vehicleId: vehicleId || existingContract.vehicleId,
      durationDays,
      prixTotal
    });

    // Update contract - this will trigger pre-save middleware
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Populate and return updated contract
    const updatedContract = await Contract.findById(contract._id)
      .populate('vehicleId', 'name type boiteVitesse pricePerDay marque modele annee couleur carburant plaqueImmatriculation')
      .populate('partnerId', 'name entreprise email');

    res.json({
      success: true,
      message: 'Contrat mis à jour avec succès',
      contract: updatedContract
    });
  } catch (error) {
    console.error('❌ Erreur modification contrat:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du contrat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    if (contract.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    // Check if contract can be deleted (not active or completed)
    if (['active', 'completed'].includes(contract.status)) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un contrat actif ou terminé'
      });
    }

    await Contract.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contrat supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression contrat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du contrat'
    });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    if (contract.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    // Check if contract can be cancelled
    if (status === 'cancelled' && !contract.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'annuler le contrat: moins de 24 heures avant le début'
      });
    }

    contract.status = status;
    await contract.save();

    const updatedContract = await Contract.findById(contract._id)
      .populate('vehicleId', 'name type boiteVitesse pricePerDay marque modele annee couleur carburant plaqueImmatriculation')
      .populate('partnerId', 'name entreprise email');

    res.json({
      success: true,
      message: 'Statut du contrat mis à jour',
      contract: updatedContract
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

exports.checkVehicleAvailability = async (req, res) => {
  try {
    const { vehicleId, startDateTime, endDateTime, contractId } = req.body;

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // Find overlapping contracts using the model's static method
    const overlappingContracts = await Contract.findOverlappingContracts(
      vehicleId,
      startDateTime,
      endDateTime,
      contractId
    );

    const isAvailable = overlappingContracts.length === 0;

    res.json({
      success: true,
      isAvailable,
      conflictingContracts: isAvailable ? [] : overlappingContracts.map(contract => ({
        id: contract._id,
        client: `${contract.clientFirstName} ${contract.clientLastName}`,
        start: contract.startDateTime,
        end: contract.endDateTime,
        status: contract.status
      }))
    });
  } catch (error) {
    console.error('❌ Erreur vérification disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité'
    });
  }
};

exports.updateVehicleInContracts = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Verify that the vehicle belongs to the current user
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    if (vehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    // Update all contracts with the new vehicle information
    const result = await Contract.updateMany(
      { vehicleId: vehicleId },
      {
        $set: {
          vehicleName: vehicle.name,
          vehicleType: vehicle.type,
          vehicleBoiteVitesse: vehicle.boiteVitesse,
          vehicleDescription: vehicle.description,
          vehiclePricePerDay: vehicle.pricePerDay,
          vehicleMarque: vehicle.marque,
          vehicleModele: vehicle.modele,
          vehicleAnnee: vehicle.annee,
          vehicleCouleur: vehicle.couleur,
          vehicleCarburant: vehicle.carburant,
          vehiclePlaqueImmatriculation: vehicle.plaqueImmatriculation
        }
      }
    );

    res.json({
      success: true,
      message: `Informations véhicule mises à jour dans ${result.modifiedCount} contrats`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour véhicule dans contrats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des informations véhicule'
    });
  }
};

exports.getContractStats = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const stats = await Contract.aggregate([
      { $match: { partnerId: new require('mongoose').Types.ObjectId(partnerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$prixTotal' }
        }
      }
    ]);

    const totalContracts = await Contract.countDocuments({ partnerId });
    const totalRevenue = await Contract.aggregate([
      { $match: { partnerId: new require('mongoose').Types.ObjectId(partnerId) } },
      { $group: { _id: null, total: { $sum: '$prixTotal' } } }
    ]);

    const monthlyStats = await Contract.aggregate([
      { $match: { partnerId: new require('mongoose').Types.ObjectId(partnerId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$prixTotal' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalContracts,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

exports.getUpcomingReturns = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingReturns = await Contract.find({
      partnerId: req.user.id,
      status: 'active',
      endDateTime: { $lte: nextWeek, $gte: today }
    })
    .populate('vehicleId', 'name plaqueImmatriculation')
    .sort({ endDateTime: 1 })
    .limit(10);

    res.json({
      success: true,
      upcomingReturns
    });
  } catch (error) {
    console.error('❌ Erreur récupération retours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des retours à venir'
    });
  }
};

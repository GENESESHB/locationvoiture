const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // Partner information (auto-populated from authenticated user)
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partnerName: {
    type: String,
    required: true
  },
  partnerEmail: {
    type: String,
    required: true
  },

  // Client information
  clientLastName: {
    type: String,
    required: [true, 'Le nom du client est obligatoire'],
    trim: true
  },
  clientFirstName: {
    type: String,
    required: [true, 'Le prénom du client est obligatoire'],
    trim: true
  },
  clientBirthDate: {
    type: Date,
    required: [true, 'La date de naissance du client est obligatoire']
  },
  clientPhone: {
    type: String,
    required: [true, 'Le téléphone du client est obligatoire'],
    trim: true
  },
  clientAddress: {
    type: String,
    required: [true, 'L\'adresse du client est obligatoire'],
    trim: true
  },
  clientPassport: {
    type: String,
    trim: true,
    sparse: true // Allows multiple nulls
  },
  clientCIN: {
    type: String,
    trim: true,
    sparse: true // Allows multiple nulls
  },
  clientLicenseNumber: {
    type: String,
    required: [true, 'Le numéro de permis du client est obligatoire'],
    trim: true
  },
  clientLicenseIssueDate: {
    type: Date,
    required: [true, 'La date de délivrance du permis est obligatoire']
  },

  // Second driver information (optional)
  secondDriverLastName: {
    type: String,
    trim: true,
    default: ''
  },
  secondDriverFirstName: {
    type: String,
    trim: true,
    default: ''
  },
  secondDriverLicenseNumber: {
    type: String,
    trim: true,
    default: ''
  },
  secondDriverLicenseIssueDate: {
    type: Date,
    default: null
  },

  // Vehicle information (reference to Vehicle model)
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'La sélection d\'un véhicule est obligatoire']
  },

  // Inherited vehicle details (for easy access and reporting)
  vehicleName: String,
  vehicleType: String,
  vehicleBoiteVitesse: String,
  vehicleDescription: String,
  vehiclePricePerDay: Number,
  vehicleMarque: String,
  vehicleModele: String,
  vehicleAnnee: Number,
  vehicleCouleur: String,
  vehicleCarburant: String,
  vehiclePlaqueImmatriculation: String,

  // Rental information
  startDateTime: {
    type: Date,
    required: [true, 'La date et heure de début sont obligatoires']
  },
  endDateTime: {
    type: Date,
    required: [true, 'La date et heure de fin sont obligatoires'],
    validate: {
      validator: function(value) {
        return value > this.startDateTime;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  startLocation: {
    type: String,
    required: [true, 'Le lieu de départ est obligatoire'],
    trim: true
  },
  endLocation: {
    type: String,
    required: [true, 'Le lieu de retour est obligatoire'],
    trim: true
  },

  // Price information
  prixParJour: {
    type: Number,
    required: [true, 'Le prix par jour est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  prixTotal: {
    type: Number,
    required: true,
    min: 0
  },

  // Contract status
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      message: 'Le statut doit être: pending, confirmed, active, completed, ou cancelled'
    },
    default: 'pending'
  },

  // Additional fields for contract management
  durationDays: {
    type: Number,
    required: true
  },
  contractNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // For cancellation or notes
  cancellationReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },

  // Security fields
  signatureClient: {
    type: String, // Could be a base64 image or digital signature
    default: null
  },
  signaturePartner: {
    type: String,
    default: null
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Pre-save middleware to calculate total price and duration
contractSchema.pre('save', function(next) {
  // Calculate duration in days
  const start = new Date(this.startDateTime);
  const end = new Date(this.endDateTime);
  const durationMs = end - start;
  this.durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  // Calculate total price
  this.prixTotal = this.durationDays * this.prixParJour;

  // Generate contract number if not exists
  if (!this.contractNumber) {
    this.contractNumber = `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  this.updatedAt = Date.now();
  next();
});

// Static method to check for overlapping contracts for the same vehicle
contractSchema.statics.findOverlappingContracts = function(vehicleId, startDateTime, endDateTime, excludeContractId = null) {
  const query = {
    vehicleId: vehicleId,
    status: { $in: ['confirmed', 'active'] }, // Only check active/confirmed contracts
    $or: [
      // New contract starts during existing contract
      {
        startDateTime: { $lte: new Date(startDateTime) },
        endDateTime: { $gt: new Date(startDateTime) }
      },
      // New contract ends during existing contract
      {
        startDateTime: { $lt: new Date(endDateTime) },
        endDateTime: { $gte: new Date(endDateTime) }
      },
      // New contract completely contains existing contract
      {
        startDateTime: { $gte: new Date(startDateTime) },
        endDateTime: { $lte: new Date(endDateTime) }
      }
    ]
  };

  // Exclude current contract when updating
  if (excludeContractId) {
    query._id = { $ne: excludeContractId };
  }

  return this.find(query);
};

// Instance method to check if contract can be cancelled
contractSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const start = new Date(this.startDateTime);
  const hoursUntilStart = (start - now) / (1000 * 60 * 60);
  
  return hoursUntilStart > 24; // Can cancel if more than 24 hours before start
};

// Virtual for client full name
contractSchema.virtual('clientFullName').get(function() {
  return `${this.clientFirstName} ${this.clientLastName}`;
});

// Virtual for second driver full name
contractSchema.virtual('secondDriverFullName').get(function() {
  if (this.secondDriverFirstName && this.secondDriverLastName) {
    return `${this.secondDriverFirstName} ${this.secondDriverLastName}`;
  }
  return '';
});

// Ensure virtual fields are serialized when converted to JSON
contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

// Indexes for better performance
contractSchema.index({ partnerId: 1, createdAt: -1 });
contractSchema.index({ vehicleId: 1, startDateTime: 1, endDateTime: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ clientCIN: 1 });
contractSchema.index({ clientPhone: 1 });
contractSchema.index({ contractNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Contract', contractSchema);

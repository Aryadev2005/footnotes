const footnoteSchema = new mongoose.Schema({
  title: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  tags : Array,
  isPublic: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

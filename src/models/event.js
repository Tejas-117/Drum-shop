import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventCode: {
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  eventName: {
    type: String,
    trim: true,
    required: [true, 'Event name can\'t be empty'],
    minLength: [1, 'Event name can\'t be empty'],
    maxLength: [1, 'Event name can\'t exceed 150 characters'],
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date can\'t be empty']
  },
  eventTime: {
    time: {
      type: String,
      required: [true, 'Event time can\'t be empty'],
      validate: {
        validator: function(val){
          return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(val);
        },
        message: 'Invalid event time format. Please use HH:MM format'
      }
    },
    period: {
      type: String,
      trim: true,
      required: true,
      enum: ['AM', 'PM'],
    }
  },
  eventDetails: {
    type: String,
    trim: true,
    required: [true, 'Event details can\'t be empty'],
  }
},
{
  timestamps: true
}
);

const Event = mongoose.model.events || mongoose.model('events', eventSchema);

export default Event;
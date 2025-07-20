const cron = require('node-cron');
const TimeCapsule = require('../models/TimeCapsule');
const sendMail = require('../utils/sendMail'); // you'll create this

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const dueCapsules = await TimeCapsule.find({
    deliveryDate: { $lte: now },
    isDelivered: false
  });

  for (const capsule of dueCapsules) {
    await sendMail(capsule.email, capsule.title, capsule.message);

    capsule.isDelivered = true;
    await capsule.save();
  }
});

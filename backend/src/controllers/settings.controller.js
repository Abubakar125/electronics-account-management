const { Setting } = require('../models');
const path = require('path');

exports.get = async (req, res, next) => {
  try {
    let settings = await Setting.findByPk(1);
    if (!settings) {
      settings = await Setting.create({ id: 1, company_name: 'Farhan Electronics', currency: 'PKR' });
    }
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    let settings = await Setting.findByPk(1);
    if (!settings) settings = await Setting.create({ id: 1 });

    const updateData = { ...req.body };

    if (req.files?.logo) {
      const ext = path.extname(req.files.logo.name);
      const filename = `logo_${Date.now()}${ext}`;
      await req.files.logo.mv(`src/uploads/logos/${filename}`);
      updateData.logo = `/uploads/logos/${filename}`;
    }

    await settings.update(updateData);
    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) { next(error); }
};

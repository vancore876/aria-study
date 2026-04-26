const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { isAdminOrSelf } = require('../middleware/roles');
const speakeasy = require('speakeasy');

router.post('/enable', [authMiddleware, isAdminOrSelf], async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const secret = user.generateMfaSecret();
    await user.save();
    
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      issuer: 'KnowledgeSystem',
      label: user.email
    });
    
    res.json({ 
      secret: secret.base32,
      otpauthUrl,
      qrcode: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauthUrl)}&size=300x300` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', [authMiddleware, isAdminOrSelf], async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.mfaSecret) {
      return res.status(400).json({ error: 'MFA not configured' });
    }
    
    const isValid = user.verifyMfaToken(token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    user.isMfaEnabled = true;
    await user.save();
    
    res.json({ success: true, message: 'MFA enabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disable', [authMiddleware, isAdminOrSelf], async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.isMfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();
    
    res.json({ success: true, message: 'MFA disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

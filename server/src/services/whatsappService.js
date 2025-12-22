// server/src/services/whatsappService.js
const axios = require('axios');
const prisma = require('../config/prismaClient');

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const sendMessage = async (toNumber, templateName, components = []) => {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
        console.error('WhatsApp API credentials are not set.');
        // Log to WhatsAppLog model with status 'failed'
        await prisma.whatsAppLog.create({
            data: {
                toNumber: toNumber,
                messageBody: `Template: ${templateName}, Components: ${JSON.stringify(components)}`,
                status: 'FAILED - Credentials Missing',
            },
        });
        return { success: false, error: 'WhatsApp API credentials missing.' };
    }

    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;

    const data = {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'template',
        template: {
            name: templateName,
            language: { code: 'en_US' },
            components: components,
        },
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        // Log successful message to WhatsAppLog model
        await prisma.whatsAppLog.create({
            data: {
                toNumber: toNumber,
                messageBody: JSON.stringify(data),
                status: 'SENT',
                metaMessageId: response.data.messages[0]?.id || null,
            },
        });

        console.log('WhatsApp message sent successfully:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error.response ? error.response.data : error.message);
        
        // Log failed message to WhatsAppLog model
        await prisma.whatsAppLog.create({
            data: {
                toNumber: toNumber,
                messageBody: JSON.stringify(data),
                status: `FAILED - ${error.response ? JSON.stringify(error.response.data) : error.message}`,
            },
        });
        return { success: false, error: error.response ? error.response.data : error.message };
    }
};

module.exports = { sendMessage };

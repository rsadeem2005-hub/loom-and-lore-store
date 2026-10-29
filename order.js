export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, items, total } = req.body || {};

    if (!email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Email and cart items are required.' });
    }

    const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Klaviyo server configuration is missing.' });
    }

    const orderId = `LL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const orderTotal = Number.isFinite(Number(total)) ? Number(total) : calculatedTotal;

    const event = {
      data: {
        type: 'event',
        attributes: {
          properties: {
            OrderID: orderId,
            ItemNames: items.map(item => item.name),
            Items: items.map(item => ({
              ProductID: item.id || item.name,
              ProductName: item.name,
              Quantity: 1,
              ItemPrice: Number(item.price) || 0
            })),
            OrderTotal: orderTotal,
            Source: 'Loom & Lore portfolio storefront',
            $extra: {
              checkout_url: 'https://loom-and-lore.vercel.app/checkout'
            }
          },
          time: new Date().toISOString(),
          value: orderTotal,
          value_currency: 'USD',
          unique_id: orderId,
          metric: {
            data: {
              type: 'metric',
              attributes: { name: 'Placed Order' }
            }
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
                first_name: firstName || null
              }
            }
          }
        }
      }
    };

    const response = await fetch('https://a.klaviyo.com/api/events', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        revision: '2025-10-15'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Klaviyo event error:', text);
      return res.status(502).json({ error: 'Klaviyo rejected the order event.' });
    }

    return res.status(200).json({ ok: true, orderId });
  } catch (error) {
    console.error('Order endpoint error:', error);
    return res.status(500).json({ error: 'Unable to place the portfolio order.' });
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Property } from '../types';

// Helper to format detailed full currency (e.g. ₹2,40,000)
const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Helper to generate an analytical summary of the dataset to feed as context to Gemini
export const generateDataSummary = (properties: Property[]): string => {
  const total = properties.length;
  const approved = properties.filter((p) => p.status === 'Approved').length;
  const rejected = properties.filter((p) => p.status === 'Rejected').length;
  const pending = properties.filter((p) => p.status === 'Pending').length;
  const totalTax = properties.reduce((acc, p) => acc + p.annual_tax_inr, 0);
  const totalCollection = properties.reduce((acc, p) => acc + p.collection_inr, 0);

  // Group by city
  const cityStats: Record<string, {
    registered: number;
    approved: number;
    rejected: number;
    pending: number;
    tax: number;
    collection: number;
  }> = {};

  properties.forEach((p) => {
    if (!cityStats[p.tenant]) {
      cityStats[p.tenant] = { registered: 0, approved: 0, rejected: 0, pending: 0, tax: 0, collection: 0 };
    }
    const stats = cityStats[p.tenant];
    stats.registered += 1;
    stats.tax += p.annual_tax_inr;
    stats.collection += p.collection_inr;
    if (p.status === 'Approved') stats.approved += 1;
    else if (p.status === 'Rejected') stats.rejected += 1;
    else if (p.status === 'Pending') stats.pending += 1;
  });

  // Find top city by collection
  let topCity = '';
  let maxColl = -1;
  Object.entries(cityStats).forEach(([city, stats]) => {
    if (stats.collection > maxColl) {
      maxColl = stats.collection;
      topCity = city;
    }
  });

  // Render text summary
  let breakdownStr = '';
  Object.entries(cityStats).forEach(([city, stats]) => {
    breakdownStr += `- **${city}**: ${stats.registered} properties (${stats.approved} Approved, ${stats.rejected} Rejected, ${stats.pending} Pending). Total Collection: ₹${stats.collection.toFixed(2)}.\n`;
  });

  return `
Platform Context:
- Platform Name: UPYOG Multi-Tenant Civic Platform
- Tenant Cities (10): Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow
- Dataset Size: 1,000 property records

Core Platform Statistics (Combined):
- Total Registered Properties: ${total}
- Total Approved Properties: ${approved}
- Total Rejected Properties: ${rejected}
- Total Pending Properties: ${pending}
- Overall Tax Demand: ₹${totalTax.toFixed(2)}
- Total Property Tax Collected: ₹${totalCollection.toFixed(2)}
- Top Performing City by Collection: ${topCity} (Collected ₹${maxColl.toFixed(2)})

Municipal Breakdowns:
${breakdownStr}
`;
};

// Fallback dynamic local AI engine to answer common questions if API key is not yet set up
const localAiFallback = (question: string, properties: Property[], selectedCity: string): string => {
  const q = question.toLowerCase();
  
  // Group statistics by city
  const cityStats: Record<string, {
    registered: number;
    approved: number;
    rejected: number;
    pending: number;
    collection: number;
  }> = {};

  properties.forEach((p) => {
    const city = p.tenant;
    if (!cityStats[city]) {
      cityStats[city] = { registered: 0, approved: 0, rejected: 0, pending: 0, collection: 0 };
    }
    const s = cityStats[city];
    s.registered += 1;
    s.collection += p.collection_inr;
    if (p.status === 'Approved') s.approved += 1;
    else if (p.status === 'Rejected') s.rejected += 1;
    else if (p.status === 'Pending') s.pending += 1;
  });

  const cities = Object.keys(cityStats);

  // Identify if a city is explicitly mentioned in the query
  let mentionedCity = '';
  for (const city of cities) {
    if (q.includes(city.toLowerCase())) {
      mentionedCity = city;
      break;
    }
  }

  // Handle local context references: "here", "this city", "our", "current"
  if (!mentionedCity && selectedCity !== 'All Cities' && (q.includes('here') || q.includes('this') || q.includes('our') || q.includes('local') || q.includes('current'))) {
    mentionedCity = selectedCity;
  }

  // 1. Highest collection query
  if (q.includes('highest') && (q.includes('collection') || q.includes('tax') || q.includes('collected'))) {
    let topCity = '';
    let maxColl = -1;
    cities.forEach((c) => {
      if (cityStats[c].collection > maxColl) {
        maxColl = cityStats[c].collection;
        topCity = c;
      }
    });
    return `According to the live UPYOG dataset, **${topCity}** has the highest total property tax collection, with a grand total of **₹${maxColl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}** collected.`;
  }

  // 2. Count rejected in specific city (e.g. rejected in Mumbai / rejected here)
  if (q.includes('rejected') && mentionedCity) {
    const count = cityStats[mentionedCity].rejected;
    return `There are currently **${count}** rejected properties in **${mentionedCity}** Municipality out of ${cityStats[mentionedCity].registered} total registrations.`;
  }

  // 3. Count approved percentage (e.g. percentage approved in Delhi / approved here)
  if ((q.includes('percent') || q.includes('%')) && q.includes('approved') && mentionedCity) {
    const stats = cityStats[mentionedCity];
    const percentage = (stats.approved / stats.registered) * 100;
    return `In **${mentionedCity}**, **${percentage.toFixed(1)}%** of properties are approved (${stats.approved} approved out of ${stats.registered} total registrations).`;
  }

  // 4. City with most pending properties
  if (q.includes('most') && q.includes('pending')) {
    let topCity = '';
    let maxPending = -1;
    cities.forEach((c) => {
      if (cityStats[c].pending > maxPending) {
        maxPending = cityStats[c].pending;
        topCity = c;
      }
    });
    return `**${topCity}** has the highest number of pending properties, with **${cityStats[topCity].pending}** applications currently awaiting municipal review.`;
  }

  // 5. Compare total registrations between Pune and Jaipur
  if (q.includes('compare') || (q.includes('registration') && q.includes('pune') && q.includes('jaipur'))) {
    const statsPune = cityStats['Pune'] || { registered: 0 };
    const statsJaipur = cityStats['Jaipur'] || { registered: 0 };
    const diff = Math.abs(statsPune.registered - statsJaipur.registered);
    const larger = statsPune.registered > statsJaipur.registered ? 'Pune' : 'Jaipur';
    return `Comparing registration volumes:\n* **Pune Municipality**: ${statsPune.registered} properties registered\n* **Jaipur Municipality**: ${statsJaipur.registered} properties registered\n\n**${larger}** has a higher volume by **${diff}** properties.`;
  }

  // 6. Support for total collection of a specific city (e.g. collection in Chennai)
  if ((q.includes('collection') || q.includes('collected') || q.includes('tax')) && mentionedCity) {
    const stats = cityStats[mentionedCity];
    return `The total property tax collection for **${mentionedCity}** Municipality is **${formatFullCurrency(stats.collection)}** across ${stats.registered} registered properties.`;
  }

  // Generic fallback summary answer
  const totalCollection = properties.reduce((acc, p) => acc + p.collection_inr, 0);
  let modeMsg = `I am currently operating in **demo mode** (using local analytical algorithms).`;
  if (selectedCity !== 'All Cities') {
    modeMsg += ` You are currently viewing **${selectedCity}** Municipality on the dashboard.`;
  }
  
  return `${modeMsg} Here is a snapshot of the live platform data:
- **Total Registrations:** 1,000 properties across 10 municipalities.
- **Global Collection:** ₹${totalCollection.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
- **Status Split:** ${properties.filter(p => p.status === 'Approved').length} Approved, ${properties.filter(p => p.status === 'Rejected').length} Rejected, and ${properties.filter(p => p.status === 'Pending').length} Pending.

*To activate the full semantic capability of Gemini 1.5 Flash, please create a \`.env\` file in the project root and add your API key: \`VITE_GEMINI_API_KEY=your_key_here\`.*`;
};

// Main API interface
export const askGemini = async (question: string, properties: Property[], selectedCity: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Artificial latency for premium typing feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    return localAiFallback(question, properties, selectedCity);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const dataSummary = generateDataSummary(properties);

    const systemPrompt = `
You are the official UPYOG Property Tax Analytics Assistant, an advanced semantic AI module built directly into the civic dashboard.
You have access to a live statistical summary of 1,000 properties across 10 Indian cities (tenants).

Currently Selected City on the Dashboard: ${selectedCity}
(If the user's question uses words like "here", "our city", "this municipality", "current city", or refers to local statistics without naming the city, resolve it to the currently selected city: ${selectedCity}).

Here is the live data summary:
${dataSummary}

Your Guidelines:
1. Answer the user's questions about the property tax data with absolute numerical accuracy.
2. Rely strictly on the numbers provided in the context above.
3. Be professional, friendly, and concise. Use markdown bolding and bullet points to format your responses cleanly.
4. If asked generic municipal questions, reply constructively within the context of property tax services.
5. If the user asks a question about a city that has 0 results or is missing, kindly clarify based on the 10 cities list.
`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User Question: "${question}"` }
    ]);

    const response = await result.response;
    return response.text().trim();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to generate response.';
    console.error('Error calling Gemini API:', error);
    return `⚠️ **Gemini API Error:** ${errMsg} \n\n*Falling back to local data analyzer:* \n\n${localAiFallback(question, properties, selectedCity)}`;
  }
};

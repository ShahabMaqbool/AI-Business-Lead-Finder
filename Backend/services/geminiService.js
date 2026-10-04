const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function searchBusinesses(query, location) {

    const prompt = `
Find up to 5 real businesses matching:

Business type: ${query}
Location: ${location}

Use Google Search to research each business.

For EVERY business, try to find publicly available contact
information from reliable public sources.

PRIORITY FOR CONTACT DISCOVERY:

1. Official company website
2. Official contact/about page
3. Google Business / public business listing
4. Public business directories
5. Official social media profile
6. Other trustworthy public sources

For each business find:

- Company name
- Official website
- Public business email
- Phone number
- Full location
- Business category
- Short description
- Lead quality from 1 to 100

IMPORTANT EMAIL RULES:

- Only provide an email if it is publicly available in the
  search results or a public business source.
- NEVER guess an email address.
- NEVER create an email from the company domain.
- NEVER assume info@company.com exists.
- If no public email can be found, write:
  "Not publicly available"
- If an email is found, provide the exact email address.

IMPORTANT WEBSITE RULES:

- Only provide a website if there is evidence that it belongs
  to the business.
- Do not infer a website only from the company name.
- If no official website is found, write:
  "Not available"

IMPORTANT:

- Do not invent phone numbers.
- Do not invent addresses.
- Do not invent emails.
- Use publicly available information only.

For each business return this exact structure:

Company Name:
Website:
Email:
Phone:
Location:
Category:
Description:
Lead Quality:

Also mention the source where contact information was found
when possible.

Return only the business results.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
            tools: [
                {
                    googleSearch: {}
                }
            ]
        }
    });

    return response.text;
}

async function generateColdEmail(lead) {

    const prompt = `
You are an AI cold outreach specialist.

Create a professional and personalized cold email for this business:

Company: ${lead.company_name}
Category: ${lead.category}
Location: ${lead.location}
Description: ${lead.description || "No description available"}
Website: ${lead.website || "No website available"}

Our service:
We provide professional website development services to businesses
that do not currently have a proper website.

IMPORTANT:
- The purpose of this email is to offer website development services.
- Clearly mention that we noticed the business does not have an official
  website or strong web presence.
- Explain briefly how a professional website could help the business.
- Keep the email personalized to the business.
- Keep it professional, friendly and concise.
- Do NOT make false claims.
- Do NOT use placeholders.
- Do NOT write [Your Name].
- Do NOT write [Your Title].
- Do NOT write [Your Company Name].

Use these sender details:

Sender Name: Shahab
Sender Title: AI Solutions Developer
Company Name: LeadGen AI

Return ONLY:

Subject:
Email Body:

The email should end with:

Best regards,
Shahab
AI Solutions Developer
LeadGen AI
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text;
}

module.exports = {
    searchBusinesses,
    generateColdEmail
};
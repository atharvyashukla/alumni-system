/**
 * Service for Gemini AI Mentor Matching
 * Uses process.env.GEMINI_API_KEY to call Google Gemini API.
 */

export const matchAlumniWithGemini = async ({ message, branch, alumniList }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!alumniList || alumniList.length === 0) {
    return [];
  }

  // Fallback heuristic scoring function in case API key is not configured or rate-limited
  const getHeuristicFallback = () => {
    console.log('Using heuristic matching fallback for mentorship suggestions.');
    const studentQueryLower = (message || '').toLowerCase();
    const studentBranchLower = (branch || '').toLowerCase();

    return alumniList
      .map((alumni) => {
        let score = 50;
        const alumniBranch = (alumni.branch || '').toLowerCase();
        const company = (alumni.currentCompany || '').toLowerCase();
        const designation = (alumni.designation || '').toLowerCase();
        const sector = (alumni.sector || '').toLowerCase();

        // Branch match
        if (studentBranchLower && alumniBranch.includes(studentBranchLower)) {
          score += 25;
        }

        // Query keywords match
        if (studentQueryLower.includes(company) || company.split(' ').some((w) => w.length > 3 && studentQueryLower.includes(w))) {
          score += 20;
        }
        if (studentQueryLower.includes(sector) || studentQueryLower.includes(designation)) {
          score += 15;
        }
        if (alumni.isVerified) {
          score += 10;
        }

        const cappedScore = Math.min(98, score);
        return {
          alumniId: alumni.id,
          name: alumni.user?.fullName || 'Alumni Mentor',
          matchScore: cappedScore,
          highlight: `${alumni.designation || 'Specialist'} at ${alumni.currentCompany || 'Industry Leader'}`,
          reason: `Strong alignment in ${alumni.branch} with proven industry expertise at ${alumni.currentCompany || 'their organization'} (${alumni.batchYear} batch). Ideal guide for your goals in ${alumni.sector || 'this field'}.`,
          alumni,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  };

  // If no API key or placeholder key, use heuristic
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return getHeuristicFallback();
  }

  try {
    const prompt = `
You are an expert AI Mentor Matching Engine for a prestigious collegiate network.
Analyze the following student mentorship inquiry and match them with the top 3 best-suited verified alumni from the provided candidates list.

STUDENT DETAILS:
- Inquiry / Goal: "${message}"
- Student Academic Branch: "${branch || 'General Engineering'}"

CANDIDATE ALUMNI (All verified graduates from the same institution):
${JSON.stringify(
  alumniList.map((a) => ({
    id: a.id,
    name: a.user?.fullName,
    batchYear: a.batchYear,
    branch: a.branch,
    currentCompany: a.currentCompany,
    designation: a.designation,
    sector: a.sector,
    city: a.city,
  })),
  null,
  2
)}

INSTRUCTIONS:
1. Select at most 3 candidates who are best positioned to mentor this student based on branch similarity, industry sector, company prestige, and career trajectory relevant to the student's message.
2. Return a JSON array of objects with the exact schema:
[
  {
    "alumniId": "string (the id of the candidate)",
    "matchScore": number (integer between 75 and 99),
    "highlight": "string (brief 3-6 word summary tag)",
    "reason": "string (2-3 sentences explaining specifically why this mentor is an exceptional fit for the student's goals)"
  }
]
Return ONLY the raw JSON array. Do not include markdown code block ticks (\`\`\`json or \`\`\`).
`;

    // Call Google Gemini API (gemini-1.5-flash or gemini-1.5-pro)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API returned error status:', response.status, errText);
      return getHeuristicFallback();
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn('Empty response text from Gemini API, falling back to heuristic');
      return getHeuristicFallback();
    }

    // Clean potential markdown delimiters
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedSuggestions = JSON.parse(cleanJson);

    // Merge suggestions with full alumni objects
    const matchedResults = parsedSuggestions
      .map((item) => {
        const alumni = alumniList.find((a) => a.id === item.alumniId);
        if (!alumni) return null;
        return {
          alumniId: item.alumniId,
          name: alumni.user?.fullName,
          matchScore: item.matchScore || 85,
          highlight: item.highlight || `${alumni.designation} at ${alumni.currentCompany}`,
          reason: item.reason,
          alumni,
        };
      })
      .filter(Boolean);

    return matchedResults.length > 0 ? matchedResults : getHeuristicFallback();
  } catch (error) {
    console.error('Error in matchAlumniWithGemini:', error);
    return getHeuristicFallback();
  }
};

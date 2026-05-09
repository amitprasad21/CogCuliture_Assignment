import { POST as verifyRoute } from '../../src/app/api/verify/route';

// Mock the dependencies
jest.mock('@tavily/core', () => ({
  tavily: jest.fn().mockReturnValue({
    search: jest.fn().mockResolvedValue({
      results: [
        {
          title: 'Fact Check: Earth is not flat',
          url: 'https://example.com/fact-check',
          content: 'The Earth is definitively an oblate spheroid, not flat. NASA has not faked the moon landings.'
        }
      ]
    })
  })
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: '{"status": "false", "confidence_score": 99, "corrected_fact": "The Earth is an oblate spheroid.", "explanation": "Scientific consensus and satellite imagery prove the Earth is round."}'
      })
    }
  }))
}));

describe('Verification API Edge Cases & Hallucination Prevention', () => {
  it('should return false for known conspiracy theories (flat earth)', async () => {
    const req = new Request('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimText: 'The Earth is definitively flat and NASA has admitted to faking the moon landing.', category: 'technical' })
    });

    const res = await verifyRoute(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('false');
    expect(data.confidence_score).toBeGreaterThan(90);
    expect(data.corrected_fact).toContain('oblate spheroid');
  });

  it('should handle API timeouts gracefully', async () => {
    // Override mock to simulate timeout
    const { GoogleGenAI } = require('@google/genai');
    GoogleGenAI.mockImplementationOnce(() => ({
      models: {
        generateContent: jest.fn().mockRejectedValue(new Error('Timeout'))
      }
    }));

    const req = new Request('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimText: 'Valid claim' })
    });

    const res = await verifyRoute(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});

"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const findLeads = async () => {
    if (!query || !location) {
      alert("Please enter business type and location");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            location,
          }),
        }
      );

      const data = await response.json();

      console.log("API Response:", data);

      if (data.success) {
        setResults(data.results);
      } else {
        alert("No results found");
      }

    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  const saveLead = async (lead) => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/leads",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(lead),
        }
      );

      const data = await response.json();

      if (data.success) {

        alert("✅ Lead saved successfully!");

      } else {

        alert("❌ Failed to save lead");

      }

    } catch (error) {

      console.error(error);

      alert("❌ Backend connection failed");

    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        {/* SEARCH SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center mb-2">
            AI Business Lead Finder
          </h1>

          <p className="text-center text-gray-500 mb-8">
            Find relevant businesses using AI
          </p>

          <label className="block font-semibold mb-2">
            What are you looking for?
          </label>

          <input
            type="text"
            placeholder="e.g. Software Houses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-lg p-3 mb-5"
          />

          <label className="block font-semibold mb-2">
            Location
          </label>

          <input
            type="text"
            placeholder="e.g. Islamabad"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg p-3 mb-6"
          />

          <button
            onClick={findLeads}
            disabled={loading}
            className="w-full bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800"
          >
            {loading ? "Searching..." : "🔍 Find Leads"}
          </button>

        </div>


        {/* RESULTS */}
        {results.length > 0 && (
          <div className="mt-8">

            <h2 className="text-2xl font-bold mb-6">
              🔎 AI Search Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {results.map((lead, index) => (

                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 border"
                >

                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">

                    <div>
                      <h3 className="text-xl font-bold">
                        🏢 {lead.company_name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {lead.category}
                      </p>
                    </div>

                    {/* SCORE */}
                    <div className="text-center">

                      <div className="text-2xl font-bold text-green-600">
                        {lead.lead_score}
                      </div>

                      <div className="text-xs text-gray-500">
                        / 100
                      </div>

                    </div>

                  </div>


                  {/* BUSINESS DETAILS */}
                  <div className="space-y-2 text-sm mb-5">

                    <p>
                      <strong>📍 Location:</strong>{" "}
                      {lead.location || "Not available"}
                    </p>

                    <p>
                      <strong>🌐 Website:</strong>{" "}
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {lead.website}
                        </a>
                      ) : (
                        "Not available"
                      )}
                    </p>

                    <p>
                      <strong>📧 Email:</strong>{" "}
                      {lead.email || "Not publicly available"}
                    </p>

                    <p>
                      <strong>📞 Phone:</strong>{" "}
                      {lead.phone || "Not publicly available"}
                    </p>

                  </div>


                  {/* DESCRIPTION */}
                  <div className="mb-5">

                    <h4 className="font-bold mb-1">
                      📝 Description
                    </h4>

                    <p className="text-sm text-gray-600 leading-6">
                      {lead.description || "No description available."}
                    </p>

                  </div>


                  {/* AI SUMMARY */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-5">

                    <h4 className="font-bold mb-1">
                      🤖 AI Summary
                    </h4>

                    <p className="text-sm text-gray-600 leading-6">
                      {lead.ai_summary || "No AI summary available."}
                    </p>

                  </div>


                  {/* LEAD QUALITY */}
                  <div className="flex items-center justify-between mb-5">

                    <span className="font-semibold">
                      🎯 Lead Quality
                    </span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {lead.lead_quality}
                    </span>

                  </div>


                  {/* BUTTONS */}
                  <div className="flex gap-3">

                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
                      >
                        🔗 Visit Website
                      </a>
                    )}

                    <button
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                      onClick={() => saveLead(lead)}
                    >
                      💾 Save Lead
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

      </div>

    </main>
  );
}